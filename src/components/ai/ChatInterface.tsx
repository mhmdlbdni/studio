
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
        'ساعدني في تسجيل مصروف'
    ],
    en: [
        'Analyze my current financial situation',
        'How can I improve my budget?',
        'What are my biggest expenses?',
        'I want to add my new salary',
        'Help me record an expense'
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
  const { language, user, pots, getPotBalance, totalIncome, totalExpenses, addTransaction, transactions } = useApp();
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
  }, [language.key]);

  const formatCurrency = (amount: number) => {
    // Force English numerals (1, 2, 3)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'YER', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSend = async (query?: string) => {
    const textToSend = query || input;
    if (textToSend.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);

    if (!query) setInput('');
    if (showSuggestions) setShowSuggestions(false);
    setIsLoading(true);

    try {
      const potDetails = pots.map(pot => ({
        id: pot.id,
        name: pot.name[language.key],
        percentage: pot.percentage,
        balance: getPotBalance(pot.id)
      }));

      const historyForAI = messages.slice(-5).map(msg => ({
        sender: msg.sender === 'user' ? 'User' : 'Guide',
        text: msg.text
      }));

      const response = await getFinancialAdvice({
        query: textToSend,
        history: historyForAI,
        financials: {
          totalIncome,
          totalExpenses,
          pots: potDetails,
          transactions,
        }
      });
      
      if (response && response.text) {
        setMessages(prev => [...prev, { sender: 'ai', text: response.text }]);
      }

      if (response && response.success && response.toolRequests && response.toolRequests.length > 0) {
        for (const toolRequest of response.toolRequests) {
          switch (toolRequest.name) {
            case 'addIncome': {
              const { description, amount } = toolRequest.input;
              addTransaction({ type: 'income', description, amount });
              setMessages(prev => [...prev, { sender: 'ai', text: language.key === 'ar' ? `تم! أضفت دخلاً بقيمة ${formatCurrency(amount)}.` : `Done! Added income: ${formatCurrency(amount)}.` }]);
              break;
            }
            case 'addExpense': {
              const { description, amount, potId } = toolRequest.input;
              addTransaction({ type: 'expense', description, amount, potId });
              const potName = pots.find(p => p.id === potId)?.name[language.key] || '';
              setMessages(prev => [...prev, { sender: 'ai', text: language.key === 'ar' ? `تمام! سجلت مصروفاً بقيمة ${formatCurrency(amount)} من وعاء ${potName}.` : `Recorded expense: ${formatCurrency(amount)} from ${potName}.` }]);
              break;
            }
            case 'navigateTo': {
              const page = toolRequest.input.page;
              router.push(`/${page}`);
              closeChat?.();
              break;
            }
          }
        }
      } else if (!response || !response.success) {
         setMessages(prev => [...prev, { sender: 'ai', text: language.key === 'ar' ? 'عذراً، واجهت مشكلة في الاتصال بالمرشد الذكي. يرجى التأكد من استقرار الإنترنت وتوفر صلاحيات الوصول للخدمة.' : 'Connection error with the guide. Please check your internet.' }]);
      }

    } catch (error: any) {
      console.error("ChatInterface Error:", error);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: language.key === 'ar' 
          ? 'عذراً، انقطع الاتصال بالمرشد الذكي. يرجى المحاولة مرة أخرى لاحقاً.' 
          : 'Sorry, the connection was closed. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  }

  const handleReset = () => {
    setMessages(getInitialMessages(language.key));
    setShowSuggestions(true);
    setIsLoading(false);
    generateSuggestions();
  }

  return (
    <div className="flex h-[70vh] min-h-[400px] max-h-[700px] flex-col overflow-hidden rounded-[2.5rem] border bg-card shadow-2xl">
      <div className="flex shrink-0 items-center justify-between bg-primary p-4 text-primary-foreground">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
                <Bot className="h-6 w-6"/>
            </div>
            <h2 className="font-black tracking-tight">{language.key === 'ar' ? 'مرشد الموازين' : 'Al-Mawazin Guide'}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={handleReset} className="h-10 w-10 rounded-xl hover:bg-white/10 text-white">
            <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4 bg-secondary/10">
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
              <div className={`max-w-[85%] rounded-[1.5rem] p-4 text-sm font-medium shadow-sm ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-card border border-border text-foreground rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed tabular-nums">{message.text}</p>
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
                <div className="rounded-[1.5rem] bg-card border border-border p-4 shadow-sm">
                   <Loader2 className="h-5 w-5 animate-spin text-primary" />
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
                        className="h-auto max-w-xs whitespace-normal rounded-2xl border-primary/30 bg-card/50 backdrop-blur-sm px-5 py-2.5 text-primary hover:bg-primary/10 transition-all font-bold text-xs"
                    >
                        {q}
                    </Button>
                ))}
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="flex shrink-0 items-center gap-2 border-t p-3 bg-card">
        <div className="relative flex-1">
            <Scale className={`pointer-events-none absolute ${language.dir === 'rtl' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`}/>
            <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language.key === 'ar' ? 'اسأل مرشدك المالي هنا..' : 'Ask your financial guide here..'}
                disabled={isLoading}
                className={`h-12 rounded-[1.2rem] bg-secondary/50 border-none font-medium focus:ring-2 focus:ring-primary/40 ${language.dir === 'rtl' ? 'pr-12' : 'pl-12'}`}
            />
        </div>
        <Button onClick={() => handleSend()} disabled={isLoading || input.trim() === ''} size="icon" className="h-12 w-12 rounded-[1.2rem] shadow-lg active:scale-95 transition-transform">
            <SendHorizonal className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
