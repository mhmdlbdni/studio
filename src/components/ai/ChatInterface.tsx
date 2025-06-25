
'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonal, Loader2, RefreshCw, Scale, Bot } from 'lucide-react';
import { getFinancialAdvice } from '@/ai/flows/financial-advice';
import { ScrollArea } from '../ui/scroll-area';
import { useApp } from '@/contexts/AppContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatInterfaceProps {
    requestOpenIncomeDialog?: () => void;
    requestOpenExpenseDialog?: () => void;
    closeChat?: () => void;
}

const getInitialMessages = (languageKey: 'ar' | 'en'): Message[] => [
    { sender: 'ai', text: languageKey === 'ar' ? 'أهلاً بك، أنا مرشد الموازين. مساعدك المالي الذكي. كيف يمكنني أن أخدمك اليوم؟' : 'Hello, I am the Al-Mawazin Guide, your smart financial assistant. How can I help you today?' },
];

const questionPool = {
    ar: [
        'حلل وضعي المالي الحالي',
        'كيف يمكنني تحسين ميزانيتي؟',
        'ما هي أكبر مصاريفي؟',
        'أريد إضافة راتبي الجديد',
        'ساعدني في تسجيل مصروف',
        'كيف أعدل نسب الموازين؟'
    ],
    en: [
        'Analyze my current financial situation',
        'How can I improve my budget?',
        'What are my biggest expenses?',
        'I want to add my new salary',
        'Help me record an expense',
        'How do I adjust the pot percentages?'
    ]
};

const shuffleArray = (array: string[]) => {
    if (typeof window === 'undefined' || !array) return array || [];
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


export function ChatInterface({ requestOpenIncomeDialog, requestOpenExpenseDialog, closeChat }: ChatInterfaceProps) {
  const { language, user, pots, getPotBalance, totalIncome, totalExpenses, addTransaction } = useApp();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(() => getInitialMessages(language.key));
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const generateSuggestions = () => {
      const staticQuestion = language.key === 'ar' ? 'ما هو نظام الموازين؟' : 'What is the Al-Mawazin system?';
      const randomQuestions = shuffleArray(questionPool[language.key]).slice(0, 2);
      setSuggestedQuestions([staticQuestion, ...randomQuestions]);
  }

  useEffect(() => {
    handleReset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language.key]);


  const handleSend = async (query?: string) => {
    const textToSend = query || input;
    if (textToSend.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!query) {
        setInput('');
    }
    if (showSuggestions) {
        setShowSuggestions(false);
    }
    setIsLoading(true);

    try {
      const potDetails = pots.map(pot => ({
        id: pot.id,
        name: pot.name[language.key],
        percentage: pot.percentage,
        balance: getPotBalance(pot.id)
      }));

      const response = await getFinancialAdvice({
        query: textToSend,
        financials: {
          totalIncome,
          totalExpenses,
          pots: potDetails
        }
      });
      
      if (response.text) {
        const aiMessage: Message = { sender: 'ai', text: response.text };
        setMessages(prev => [...prev, aiMessage]);
      }

      if (response.toolRequests && response.toolRequests.length > 0) {
        let confirmationMessage: Message | null = null;
        
        for (const toolRequest of response.toolRequests) {
          switch (toolRequest.name) {
            case 'addIncome': {
              const { description, amount } = toolRequest.input;
              addTransaction({ type: 'income', description, amount });
              const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'YER', minimumFractionDigits: 0 }).format(amount);
              confirmationMessage = { sender: 'ai', text: language.key === 'ar' ? `تم! لقد أضفت دخلاً بقيمة ${formattedAmount} بنجاح.` : `Done! I've successfully added an income of ${formattedAmount}.` };
              break;
            }
            case 'addExpense': {
              const { description, amount, potId } = toolRequest.input;
              addTransaction({ type: 'expense', description, amount, potId });
              const potName = pots.find(p => p.id === potId)?.name[language.key] || '';
              const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'YER', minimumFractionDigits: 0 }).format(amount);
              confirmationMessage = { sender: 'ai', text: language.key === 'ar' ? `تمام! تم تسجيل مصروف بقيمة ${formattedAmount} من وعاء "${potName}".` : `Got it! An expense of ${formattedAmount} from the "${potName}" pot has been recorded.` };
              break;
            }
            case 'navigateTo': {
              const page = toolRequest.input.page;
              if (page === 'manage-pots' || page === 'settings') {
                  router.push(`/${page}`);
                  closeChat?.();
              }
              break;
            }
          }
        }

        if (confirmationMessage) {
            setMessages(prev => [...prev, confirmationMessage!]);
        }
      }

    } catch (error) {
      console.error("Error calling financial advice flow:", error);
      const errorMessage: Message = { sender: 'ai', text: language.key === 'ar' ? 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' : 'Sorry, something went wrong. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  }

  const handleReset = () => {
    setMessages(getInitialMessages(language.key));
    setShowSuggestions(true);
    setIsLoading(false);
    generateSuggestions();
  }

  return (
    <div className="flex h-[70vh] min-h-[400px] max-h-[700px] flex-col overflow-hidden rounded-lg border bg-card shadow-xl">
      <div className="flex shrink-0 items-center justify-between bg-primary p-3 text-primary-foreground">
        <div className="flex items-center gap-3">
            <Bot className="h-6 w-6"/>
            <h2 className="font-bold">{language.key === 'ar' ? 'مرشد الموازين' : 'Al-Mawazin Guide'}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8 hover:bg-primary/80">
            <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex w-full items-end gap-2 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && language.dir === 'ltr' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Bot className="h-5 w-5" />
                  </div>
              )}
              <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary'
              }`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
               {message.sender === 'ai' && language.dir === 'rtl' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Bot className="h-5 w-5" />
                  </div>
              )}
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-2 justify-start">
                {language.dir === 'ltr' && <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Bot className="h-5 w-5" />
                </div>}
                <div className="rounded-lg bg-secondary p-3 text-sm">
                   <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                {language.dir === 'rtl' && <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Bot className="h-5 w-5" />
                </div>}
            </div>
          )}
          {showSuggestions && (
            <div className={`flex flex-col gap-2 pt-4 ${language.dir === 'rtl' ? 'items-end' : 'items-start'}`}>
                {suggestedQuestions.map((q) => (
                    <Button 
                        key={q} 
                        variant="outline"
                        onClick={() => handleSend(q)}
                        className="h-auto max-w-xs whitespace-normal rounded-full border-primary/50 bg-transparent px-4 py-2 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                        {q}
                    </Button>
                ))}
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="flex shrink-0 items-center gap-2 border-t p-2">
        <div className="relative flex-1">
            <Scale className={`pointer-events-none absolute ${language.dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`}/>
            <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language.key === 'ar' ? 'اسأل مرشدك المالي هنا..' : 'Ask your financial guide here..'}
                disabled={isLoading}
                className={`h-10 rounded-full bg-secondary ${language.dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
            />
        </div>
        <Button onClick={() => handleSend()} disabled={isLoading || input.trim() === ''} size="icon" className="rounded-full">
            <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
