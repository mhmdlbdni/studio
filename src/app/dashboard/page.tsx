
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Bot } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTransactionDialog } from '@/components/dashboard/AddTransactionDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChatInterface } from '@/components/ai/ChatInterface';

export default function DashboardPage() {
  const { pots, user, getPotBalance, totalIncome, totalExpenses, language } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{language === 'ar' ? 'إجمالي الدخل' : 'Total Income'}</CardTitle>
                <span className="text-green-500">▲</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{language === 'ar' ? 'إجمالي المصروفات' : 'Total Expenses'}</CardTitle>
                 <span className="text-destructive">▼</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                     {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{language === 'ar' ? 'الصافي الحالي' : 'Net Balance'}</CardTitle>
                 <span className="text-primary">=</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance)}
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className={`font-headline text-xl font-bold ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'الأوعية المالية' : 'Financial Pots'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {potDetails.map(pot => {
            const PotIcon = pot.icon;
            return (
              <Link href={`/pots/${pot.id}`} key={pot.id}>
                <Card className="hover:bg-accent transition-colors p-4">
                    <div className={`flex w-full items-center justify-between gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="text-lg font-bold" style={{ color: pot.color }}>
                            {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(pot.balance)}
                        </div>
                        <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="p-2 bg-secondary rounded-md">
                                <PotIcon className="h-6 w-6" style={{ color: pot.color }}/>
                            </div>
                            <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                <p className="font-semibold text-base">{pot.name[language]}</p>
                                <p className="text-xs text-muted-foreground">{pot.percentage}%</p>
                            </div>
                        </div>
                    </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Button
        variant="outline"
        className={`fixed bottom-40 ${language === 'ar' ? 'left-4' : 'right-4'} z-20 h-14 w-14 rounded-full shadow-lg lg:bottom-28 ${language === 'ar' ? 'lg:left-8' : 'lg:right-8'}`}
        size="icon"
        onClick={() => setChatOpen(true)}
      >
        <Bot className="h-8 w-8" />
        <span className="sr-only">{language === 'ar' ? 'مرشد الموازين' : 'Al-Mawazin Guide'}</span>
      </Button>
      
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`fixed bottom-20 ${language === 'ar' ? 'left-4' : 'right-4'} z-20 h-16 w-16 rounded-full shadow-lg ${language === 'ar' ? 'lg:bottom-8 lg:left-8' : 'lg:bottom-8 lg:right-8'} bg-primary hover:bg-primary/90`}
            size="icon"
          >
            <Plus className="h-8 w-8" />
            <span className="sr-only">{language === 'ar' ? 'إضافة معاملة' : 'Add Transaction'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="top" align={language === 'ar' ? 'start' : 'end'} sideOffset={15}>
            <div className="flex flex-col items-end gap-3">
                 <Button onClick={() => openDialog('income')} className="justify-center rounded-full bg-green-500 text-white hover:bg-green-600 h-11 px-6 shadow-lg">
                    <Plus className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {language === 'ar' ? 'إضافة دخل' : 'Add Income'}
                </Button>
                <Button onClick={() => openDialog('expense')} className="justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 px-6 shadow-lg">
                    <span className={`font-bold text-xl ${language === 'ar' ? 'ml-2' : 'mr-2'}`}>−</span>
                    {language === 'ar' ? 'إضافة مصروف' : 'Add Expense'}
                </Button>
            </div>
        </PopoverContent>
      </Popover>

      <AddTransactionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        initialTab={dialogInitialTab}
      />

      <Dialog open={isChatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none sm:max-w-md w-full">
          <ChatInterface />
        </DialogContent>
      </Dialog>
    </div>
  );
}
