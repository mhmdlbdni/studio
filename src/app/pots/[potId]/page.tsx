
'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const potId = params.potId as string;
  const { pots, transactions, getPotBalance, user, language } = useApp();
  const currency = user?.currency || 'YER';

  const pot = useMemo(() => pots.find(p => p.id === potId), [pots, potId]);
  const potBalance = useMemo(() => getPotBalance(potId), [getPotBalance, potId]);
  
  const potTransactions = useMemo(() => {
    return transactions
      .filter(t => (t.type === 'expense' && t.potId === potId) || (t.type === 'income'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, potId]);

  if (!pot) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-10">
            <h2 className="text-2xl font-bold">{language === 'ar' ? 'لم يتم العثور على الوعاء' : 'Pot Not Found'}</h2>
            <p className="text-muted-foreground">{language === 'ar' ? 'قد يكون قد تم حذفه أو أن الرابط غير صحيح.' : 'It may have been deleted or the link is incorrect.'}</p>
            <Button onClick={() => router.back()} className="mt-4">
                <ArrowLeft className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
        </div>
    );
  }
  
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <pot.icon className="h-10 w-10" style={{ color: pot.color }} />
                    <div>
                        <CardTitle className="text-2xl font-bold">{pot.name}</CardTitle>
                        <CardDescription>{pot.percentage}% {language === 'ar' ? 'من الدخل' : 'of income'}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold" style={{ color: pot.color }}>
                    {new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(potBalance)}
                </p>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}</CardTitle>
            </CardHeader>
            <CardContent>
                {potTransactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        {language === 'ar' ? 'لا توجد معاملات في هذا الوعاء بعد.' : 'No transactions in this pot yet.'}
                        <br/>
                        {language === 'ar' ? 'ابدأ عندما تدخل ليسحر يحدث!' : 'Start by adding an income or expense!'}
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {potTransactions.map(t => {
                            const isExpense = t.type === 'expense';
                            const amountForPot = isExpense ? t.amount : t.amount * (pot.percentage / 100);

                            return (
                                <li key={t.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`rounded-full p-2 ${isExpense ? 'bg-destructive/20' : 'bg-green-500/20'}`}>
                                            {isExpense ? <ArrowUp className="h-5 w-5 text-destructive" /> : <ArrowDown className="h-5 w-5 text-green-500" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{t.description}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString(locale)}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold ${isExpense ? 'text-destructive' : 'text-green-500'}`}>
                                        {isExpense ? '-' : '+'}
                                        {new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(amountForPot)}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
