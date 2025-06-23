
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Bot } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTransactionDialog } from '@/components/dashboard/AddTransactionDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function DashboardPage() {
  const { pots, user, getPotBalance, totalIncome, totalExpenses } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
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
    setPopoverOpen(false);
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
         <Card className="text-center">
            <CardHeader className="flex flex-row items-center justify-center space-y-0 p-4 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الدخل</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-green-500">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}
                </div>
            </CardContent>
        </Card>
        <Card className="text-center">
            <CardHeader className="flex flex-row items-center justify-center space-y-0 p-4 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-destructive">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}
                </div>
            </CardContent>
        </Card>
        <Card className="text-center">
            <CardHeader className="flex items-center justify-center p-4 pb-2">
                <div className="text-sm font-medium leading-none">الصافي<br/>الحالي</div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance)}
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="mb-2 font-headline text-2xl font-bold text-right">الأوعية المالية</h2>
        <div className="flex flex-col gap-3">
          {potDetails.map(pot => {
            const PotIcon = pot.icon;
            return (
              <Link href={`/pots/${pot.id}`} key={pot.id}>
                <Card className="hover:bg-accent transition-colors p-4">
                    <div className="flex w-full items-center justify-between">
                        <div className="text-lg font-bold" style={{ color: pot.color }}>
                            {new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(pot.balance)}
                        </div>
                        <div className="flex items-center gap-3 text-right">
                            <div>
                                <p className="font-semibold text-base">{pot.name}</p>
                                <p className="text-xs text-muted-foreground">{pot.percentage}%</p>
                            </div>
                            <PotIcon className="h-7 w-7 flex-shrink-0" style={{ color: pot.color }}/>
                        </div>
                    </div>
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
      
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 z-20 h-16 w-16 rounded-full shadow-lg lg:bottom-8 lg:right-8 bg-primary hover:bg-primary/90"
            size="icon"
          >
            <Plus className="h-8 w-8" />
            <span className="sr-only">إضافة معاملة</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="top" align="end" sideOffset={15}>
            <div className="flex flex-col items-end gap-3">
                 <Button onClick={() => openDialog('income')} className="justify-center rounded-full bg-green-500 text-white hover:bg-green-600 h-11 px-6 shadow-lg">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة دخل
                </Button>
                <Button onClick={() => openDialog('expense')} className="justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 px-6 shadow-lg">
                    <span className="font-bold text-xl ml-2">−</span>
                    إضافة مصروف
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
