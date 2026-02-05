'use client';

import { useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowUp, ArrowDown, Wallet, History, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PotPageProps {
  params: Promise<{ potId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function PotDetailPage({ params, searchParams }: PotPageProps) {
  const router = useRouter();
  
  // Unwrap params and searchParams using React.use() as required by Next.js 15
  const resolvedParams = use(params);
  const _resolvedSearchParams = use(searchParams);
  const potId = resolvedParams.potId;
  
  const { pots, transactions, getPotBalance, user, language, totalIncome } = useApp();
  const currency = user?.currency || 'YER';
  const locale = language.code;

  const pot = useMemo(() => pots.find(p => p.id === potId), [pots, potId]);
  const potBalance = useMemo(() => getPotBalance(potId), [getPotBalance, potId]);
  
  const potTransactions = useMemo(() => {
    return transactions
      .filter(t => (t.type === 'expense' && t.potId === potId) || (t.type === 'income'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, potId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  if (!pot) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="p-6 rounded-[2.5rem] bg-destructive/10 mb-6">
                <Wallet className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter">{language.key === 'ar' ? 'لم يتم العثور على الوعاء' : 'Pot Not Found'}</h2>
            <p className="text-muted-foreground mt-2">{language.key === 'ar' ? 'قد يكون قد تم حذفه أو أن الرابط غير صحيح.' : 'It may have been deleted or the link is incorrect.'}</p>
            <Button onClick={() => router.back()} className="mt-8 rounded-2xl h-14 px-8 font-black shadow-xl">
                <ArrowLeft className={cn("h-5 w-5", language.dir === 'rtl' ? 'ml-2' : 'mr-2')} />
                {language.key === 'ar' ? 'العودة للرئيسية' : 'Back to Dashboard'}
            </Button>
        </div>
    );
  }

  const totalAllocated = totalIncome * (pot.percentage / 100);
  const liquidLevel = totalAllocated > 0 ? Math.max(0, Math.min(100, (potBalance / totalAllocated) * 100)) : 0;
  const dateLocale = language.key === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="space-y-6 pb-20 select-none">
        {/* Futuristic Liquid Header Card - Theme Aware */}
        <Card className="relative overflow-hidden border-none shadow-2xl bg-card dark:bg-black min-h-[220px] flex flex-col justify-center rounded-[2.8rem] transition-all duration-500">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out opacity-60"
                    style={{ 
                        height: `${Math.max(20, liquidLevel)}%`, 
                        backgroundColor: pot.color,
                        boxShadow: `0 0 80px ${pot.color}40`
                    }}
                >
                    <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic opacity-30" />
                    <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic-slow opacity-20" />
                </div>
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent" />
            </div>

            <CardHeader className="relative z-10 pt-8 px-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-[1.8rem] bg-secondary/50 dark:bg-white/10 backdrop-blur-3xl border border-border dark:border-white/10 shadow-2xl">
                        <pot.icon className="h-8 w-8" style={{ color: pot.color }} />
                    </div>
                    <div>
                        <CardTitle className="text-2xl md:text-3xl font-black text-foreground dark:text-white tracking-tighter">{pot.name[language.key]}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="px-3 py-0.5 rounded-full bg-secondary/50 dark:bg-white/10 border border-border dark:border-white/10 text-[10px] font-black text-foreground/80 dark:text-white/80 uppercase tracking-widest">
                                {pot.percentage}% {language.key === 'ar' ? 'تخصيص' : 'Allocated'}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 pb-8 px-8">
                <div className="mt-4">
                    <p className="text-4xl md:text-6xl font-black text-foreground dark:text-white tracking-tighter drop-shadow-2xl">
                        {formatCurrency(potBalance)}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground dark:text-white/60 font-black uppercase tracking-[0.2em] mt-2">
                        {language.key === 'ar' ? 'الرصيد المتاح حالياً' : 'Current Available Balance'}
                    </p>
                </div>
            </CardContent>
        </Card>

        {/* Transaction History Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <h3 className="font-black text-xl md:text-2xl tracking-tighter flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        {language.key === 'ar' ? 'سجل العمليات' : 'Transaction History'}
                    </h3>
                    <div className="h-1 w-8 bg-primary mt-1 rounded-full" />
                </div>
            </div>

            <Card className="glass-effect rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl">
                <CardContent className="p-4">
                    {potTransactions.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-muted-foreground font-medium italic">
                                {language.key === 'ar' ? 'لا توجد معاملات في هذا الوعاء بعد.' : 'No transactions in this pot yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {potTransactions.map(t => {
                                const isExpense = t.type === 'expense';
                                const amountForPot = isExpense ? t.amount : t.amount * (pot.percentage / 100);

                                return (
                                    <div 
                                        key={t.id} 
                                        className="flex items-center justify-between p-4 rounded-[1.8rem] bg-secondary/30 hover:bg-secondary/50 transition-colors group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-2xl shadow-lg transition-transform group-hover:scale-110",
                                                isExpense ? 'bg-destructive/15 text-destructive' : 'bg-green-500/15 text-green-500'
                                            )}>
                                                {isExpense ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-sm md:text-lg truncate tracking-tight">{t.description}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                                                    {new Date(t.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right ml-2">
                                            <p className={cn(
                                                "text-sm md:text-xl font-black tabular-nums whitespace-nowrap",
                                                isExpense ? 'text-destructive' : 'text-green-500'
                                            )}>
                                                {isExpense ? '−' : '+'}
                                                {formatCurrency(amountForPot)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}