
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Bot, User as UserIcon } from 'lucide-react';
import { getFinancialAdvice } from '@/ai/flows/financial-advice';
import { ScrollArea } from '../ui/scroll-area';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getFinancialAdvice({ query: input });
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

  return (
    <div className="flex h-[400px] flex-col rounded-lg border">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-lg bg-secondary p-3 text-sm">
                    <p>مرحباً! أنا مرشد الموازين. كيف يمكنني مساعدتك في تحقيق أهدافك المالية اليوم؟</p>
                </div>
            </div>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
            >
              {message.sender === 'ai' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                </div>
              )}
              <div className={`rounded-lg p-3 text-sm ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary'
              }`}>
                <p>{message.text}</p>
              </div>
               {message.sender === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-lg bg-secondary p-3 text-sm">
                   <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 border-t p-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="اكتب سؤالك هنا..."
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading || input.trim() === ''} size="icon">
            <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
