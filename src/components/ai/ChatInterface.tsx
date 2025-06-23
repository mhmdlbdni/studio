
'use client';
import { useState, useRef, useEffect } from 'react';
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

const getInitialMessages = (language: 'ar' | 'en'): Message[] => [
    { sender: 'ai', text: language === 'ar' ? 'أهلاً بك، أنا مرشد الموازين. مساعدك المالي الذكي. كيف يمكنني أن أخدمك اليوم؟' : 'Hello, I am the Al-Mawazin Guide, your smart financial assistant. How can I help you today?' },
    { sender: 'ai', text: language === 'ar' ? 'يمكنك سؤالي عن أي شيء يتعلق بفلسفة الموازين أو كيفية استخدام التطبيق.' : 'You can ask me anything about the Al-Mawazin philosophy or how to use the app.' },
];

const questionPool = {
    ar: [
        'ما هو أهم ما يجب أن أركز عليه؟',
        'دخولي غير منتظمة، كيف أبدأ؟',
        'كيف أتعامل مع ديوني؟',
        'ما هو وعاء الحرية المالية؟',
        'كيف أستخدم وعاء المرح والترفيه؟',
        'لدي أهداف خاصة، كيف أخصص لها وعاء؟'
    ],
    en: [
        'What is the most important thing to focus on?',
        'My income is irregular, how do I start?',
        'How do I deal with my debts?',
        'What is the Financial Freedom pot?',
        'How should I use the Play & Fun pot?',
        'I have special goals, how do I create a pot for them?'
    ]
};

const shuffleArray = (array: string[]) => {
    if (typeof window === 'undefined') return array;
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


export function ChatInterface() {
  const { language } = useApp();
  const [messages, setMessages] = useState<Message[]>(getInitialMessages(language));
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const generateSuggestions = () => {
      const staticQuestion = language === 'ar' ? 'ما هو نظام الموازين؟' : 'What is the Al-Mawazin system?';
      const randomQuestions = shuffleArray(questionPool[language]).slice(0, 2);
      setSuggestedQuestions([staticQuestion, ...randomQuestions]);
  }

  useEffect(() => {
    handleReset();
  }, [language]);


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
      const response = await getFinancialAdvice({ query: textToSend });
      const aiMessage: Message = { sender: 'ai', text: response.advice };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'ai', text: language === 'ar' ? 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' : 'Sorry, something went wrong. Please try again.' };
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
    setMessages(getInitialMessages(language));
    setShowSuggestions(true);
    setIsLoading(false);
    generateSuggestions();
  }

  return (
    <div className="flex h-[70vh] min-h-[400px] max-h-[700px] flex-col overflow-hidden rounded-lg border bg-card shadow-xl">
      <div className="flex shrink-0 items-center justify-between bg-primary p-3 text-primary-foreground">
        <div className="flex items-center gap-3">
            <Bot className="h-6 w-6"/>
            <h2 className="font-bold">{language === 'ar' ? 'مرشد الموازين' : 'Al-Mawazin Guide'}</h2>
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
              {message.sender === 'ai' && language === 'en' && (
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
               {message.sender === 'ai' && language === 'ar' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Bot className="h-5 w-5" />
                  </div>
              )}
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-2 justify-start">
                {language === 'en' && <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Bot className="h-5 w-5" />
                </div>}
                <div className="rounded-lg bg-secondary p-3 text-sm">
                   <Loader2 className="h-5 w-5 animate-spin" />
                </div>
                {language === 'ar' && <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Bot className="h-5 w-5" />
                </div>}
            </div>
          )}
          {showSuggestions && (
            <div className={`flex flex-col gap-2 pt-4 ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                {suggestedQuestions.map((q) => (
                    <Button 
                        key={q} 
                        variant="outline"
                        onClick={() => handleSend(q)}
                        className={`h-auto max-w-xs whitespace-normal rounded-full border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:text-primary ${language === 'ar' ? 'self-end text-right' : 'self-start text-left'}`}
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
            <Scale className={`pointer-events-none absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`}/>
            <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'ar' ? 'اسأل مرشدك المالي هنا..' : 'Ask your financial guide here..'}
                disabled={isLoading}
                className={`h-10 rounded-full bg-secondary ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
            />
        </div>
        <Button onClick={() => handleSend()} disabled={isLoading || input.trim() === ''} size="icon" className="rounded-full">
            <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
