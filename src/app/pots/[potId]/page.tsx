'use client';

import { useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, History, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PotPageProps {
  params: Promise<{ potId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function PotDetailPage({ params, searchParams }: PotPageProps) {
  const router = useRouter();
  
  // Next.js 15: Unwrap params and searchParams
  const resolvedParams = use(params);
  const _resolvedSearchParams = use(searchParams);
  const potId = resolvedParams.potId;
  
  const { pots, transactions, getPotBalance, user, language, totalIncome } = useApp();
  const currency = user?.currency || 'YER';

  const pot = useMemo(() => pots.find(p => p.id === potId), [pots, potId]);
  const potBalance = useMemo(() => getPotBalance(potId), [getPotBalance, potId]);
  
  const potTransactions = useMemo(() => {
    return transactions
      .filter(t => (t.type === 'expense' && t.potId === potId) || (t.type === 'income'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, potId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  if (!pot) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-black">{language.key === 'ar' ? 'الوعاء غير موجود' : 'Pot Not Found'}</h2>
            <Button onClick={() => router.back()} className="mt-6 rounded-xl font-black">
                {language.key === 'ar' ? 'العودة' : 'Back'}
            </Button>
        </div>
    );
  }

  const totalAllocated = totalIncome * (pot.percentage / 100);
  const liquidLevel = totalAllocated > 0 ? Math.max(0, Math.min(100, (potBalance / totalAllocated) * 100)) : 0;

  return (
    <div className="space-y-6 pb-20 select-none">
        <Card className="relative overflow-hidden border-none shadow-2xl bg-card dark:bg-black min-h-[220px] flex flex-col justify-center rounded-[2.8rem] transition-all">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out opacity-60"
                    style={{ 
                        height: `${Math.max(20, liquidLevel)}%`, 
                        backgroundColor: pot.color,
                        boxShadow: `0 0 60px ${pot.color}40`
                    }}
                >
                    <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic opacity-30" />
                </div>
            </div>

            <CardHeader className="relative z-10 pt-8 px-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-[1.8rem] bg-secondary/50 dark:bg-white/10 backdrop-blur-3xl border border-border/10 shadow-xl">
                        <pot.icon className="h-8 w-8" style={{ color: pot.color }} />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tighter">{pot.name[language.key]}</CardTitle>
                        <div className="px-3 py-0.5 rounded-full bg-secondary/50 text-[10px] font-black uppercase tracking-widest mt-1 inline-block">
                            {pot.percentage}% {language.key === 'ar' ? 'تخصيص' : 'Allocated'}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 pb-8 px-8">
                <div className="mt-4">
                    <p className="text-4xl md:text-6xl font-black tracking-tighter drop-shadow-2xl">
                        {formatCurrency(potBalance)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">
                        {language.key === 'ar' ? 'الرصيد المتاح حالياً' : 'Current Available Balance'}
                    </p>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-4">
            <h3 className="font-black text-xl tracking-tighter flex items-center gap-2 px-2">
                <History className="h-5 w-5 text-primary" />
                {language.key === 'ar' ? 'سجل العمليات' : 'Transaction History'}
            </h3>

            <div className="space-y-3 px-2">
                {potTransactions.length === 0 ? (
                    <p className="text-center py-10 text-muted-foreground italic">
                        {language.key === 'ar' ? 'لا توجد عمليات بعد.' : 'No transactions yet.'}
                    </p>
                ) : (
                    potTransactions.map(t => {
                        const isExpense = t.type === 'expense';
                        const amountForPot = isExpense ? t.amount : t.amount * (pot.percentage / 100);

                        return (
                            <div key={t.id} className="flex items-center justify-between p-4 rounded-[1.8rem] bg-card/60 border border-white/5 backdrop-blur-sm shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-3 rounded-2xl",
                                        isExpense ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'
                                    )}>
                                        {isExpense ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-sm truncate">{t.description}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">
                                            {new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                <p className={cn(
                                    "text-lg font-black tabular-nums",
                                    isExpense ? 'text-destructive' : 'text-green-500'
                                )}>
                                    {isExpense ? '−' : '+'}
                                    {formatCurrency(amountForPot)}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    </div>
  );
}
