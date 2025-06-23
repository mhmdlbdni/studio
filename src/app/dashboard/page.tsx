
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Bot, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTransactionDialog } from '@/components/dashboard/AddTransactionDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function DashboardPage() {
  const { pots, user, getPotBalance, totalIncome, totalExpenses } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInitialTab, setDialogInitialTab] = useState<'income' | 'expense'>('expense');
  const currency = user?.currency || 'YER';

  const potDetails = useMemo(() => {
    return pots.map(pot => ({
      ...pot,
      balance: getPotBalance(pot.id)
    }));
  }, [pots, getPotBalance]);

  const netBalance = totalIncome - totalExpenses;

  const openDialog = (tab: 'income' | 'expense') => {
    setDialogInitialTab(tab);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الدخل</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-500">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-destructive">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الصافي</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance)}
                </div>
            </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-headline text-lg font-medium">أوعية الموازنة (الموازين)</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {potDetails.map(pot => {
            const Icon = pot.icon;
            return (
              <Link href={`/pots/${pot.id}`} key={pot.id}>
                <Card className="hover:bg-accent transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{pot.name}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" style={{ color: pot.color }}/>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                        {new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(pot.balance)}
                    </div>
                    <p className="text-xs text-muted-foreground">{pot.percentage}% من الدخل</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="fixed bottom-40 right-4 z-20 h-14 w-14 rounded-full shadow-lg lg:bottom-28 lg:right-8"
        size="icon"
      >
        <Link href="/support">
          <Bot className="h-8 w-8" />
          <span className="sr-only">مرشد الموازين</span>
        </Link>
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 z-20 h-16 w-16 rounded-full shadow-lg lg:bottom-8 lg:right-8"
            size="icon"
          >
            <Plus className="h-8 w-8" />
            <span className="sr-only">إضافة معاملة</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top" align="end">
            <div className="flex flex-col gap-2">
                <Button onClick={() => openDialog('expense')} variant="ghost" className="justify-start">
                    <ArrowUp className="ml-2 h-4 w-4 text-destructive" />
                    إضافة مصروف
                </Button>
                <Button onClick={() => openDialog('income')} variant="ghost" className="justify-start">
                    <ArrowDown className="ml-2 h-4 w-4 text-green-500" />
                    إضافة دخل
                </Button>
            </div>
        </PopoverContent>
      </Popover>

      <AddTransactionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        initialTab={dialogInitialTab}
      />
    </div>
  );
}
