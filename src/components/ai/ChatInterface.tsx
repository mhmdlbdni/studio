'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonal, Loader2, RefreshCw, Scale } from 'lucide-react';
import { getFinancialAdvice } from '@/ai/flows/financial-advice';
import { ScrollArea } from '../ui/scroll-area';
import { Logo } from '@/components/icons/Logo';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const initialMessages: Message[] = [
    { sender: 'ai', text: 'أهلاً بك، أنا مرشد الموازين. مساعدك المالي الذكي. كيف يمكنني أن أخدمك اليوم؟' },
    { sender: 'ai', text: 'يمكنك سؤال عن أي شيء يتعلق بالموازين بشكل كامل أو عن كيفية استخدام التطبيق' },
];

const suggestedQuestions = [
    'ما هو نظام الموازين؟',
    'ما هو أهم يجب أن أركز عليه؟',
    'لقد دخلت بشكل غير منتظم، كيف أبدأ؟',
    'ما الفائدة من الاشتراك برو؟',
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
      const errorMessage: Message = { sender: 'ai', text: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' };
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
    setMessages(initialMessages);
    setShowSuggestions(true);
    setIsLoading(false);
  }

  return (
    <div className="flex h-[600px] flex-col overflow-hidden rounded-lg border bg-card">
      <div className="flex shrink-0 items-center justify-between bg-primary p-3 text-primary-foreground">
        <div className="flex items-center gap-3">
            <Logo className="h-6 w-6"/>
            <h2 className="font-bold">مرشد الموازين</h2>
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
              className={`flex w-full items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {message.sender === 'ai' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Logo className="h-5 w-5" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                message.sender === 'user'
                  ? 'rounded-br-none bg-primary text-primary-foreground'
                  : 'rounded-bl-none bg-secondary'
              }`}>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Logo className="h-5 w-5" />
                </div>
                <div className="rounded-lg bg-secondary p-3 text-sm">
                   <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
          )}
          {showSuggestions && (
            <div className="flex flex-col items-end gap-2 pt-4">
                {suggestedQuestions.map((q) => (
                    <Button 
                        key={q} 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSend(q)}
                        className="h-auto max-w-xs self-end whitespace-normal rounded-full border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:text-primary"
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
            <Scale className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اسأل مرشدك المالي هنا.."
                disabled={isLoading}
                className="h-10 rounded-full bg-secondary pr-10"
            />
        </div>
        <Button onClick={() => handleSend()} disabled={isLoading || input.trim() === ''} size="icon" className="rounded-full">
            <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
