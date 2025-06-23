
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Bot, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTransactionDialog } from '@/components/dashboard/AddTransactionDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChatInterface } from '@/components/ai/ChatInterface';

export default function DashboardPage() {
  const { pots, user, getPotBalance, totalIncome, totalExpenses, language, transactions } = useApp();
  const [isIncomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const currency = user?.currency || 'YER';

  const potDetails = useMemo(() => {
    return pots.map(pot => ({
      ...pot,
      balance: getPotBalance(pot.id)
    }));
  }, [pots, getPotBalance]);

  const netBalance = totalIncome - totalExpenses;

  const openIncomeDialog = () => {
    setIncomeDialogOpen(true);
    setPopoverOpen(false);
  }

  const openExpenseDialog = () => {
    setExpenseDialogOpen(true);
    setPopoverOpen(false);
  }

  return (
    <div className="space-y-8">
       <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{language.dashboard.netBalance}</CardTitle>
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">
                    {new Intl.NumberFormat(language.code, { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance)}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>{new Intl.NumberFormat(language.code, { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                         <span>{new Intl.NumberFormat(language.code, { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>

      <div className="space-y-4">
        <h2 className={`font-headline text-xl font-bold ${language.dir === 'rtl' ? 'text-right' : 'text-left'}`}>{language.dashboard.financialPots}</h2>
        <div className="grid grid-cols-1 gap-4">
          {potDetails.map(pot => {
            const PotIcon = pot.icon;
            const totalAllocated = totalIncome * (pot.percentage / 100);
            const expensesForPot = transactions
              .filter(t => t.type === 'expense' && t.potId === pot.id)
              .reduce((sum, t) => sum + t.amount, 0);

            const spentPercentage = totalAllocated > 0 ? (expensesForPot / totalAllocated) * 100 : 0;
            
            return (
              <Link href={`/pots/${pot.id}`} key={pot.id}>
                <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-secondary rounded-md">
                            <PotIcon className="h-6 w-6" style={{ color: pot.color }}/>
                        </div>
                        <div className="flex-1">
                            <div className="flex w-full items-center justify-between">
                                <p className="font-semibold text-base">{pot.name[language.key]}</p>
                                <p className="text-sm font-bold" style={{ color: pot.color }}>
                                  {new Intl.NumberFormat(language.code, { style: 'currency', currency, minimumFractionDigits: 0 }).format(pot.balance)}
                                </p>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <Progress value={spentPercentage} className="h-2" />
                                <span className="text-xs text-muted-foreground">{pot.percentage}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Button
        variant="outline"
        className={`fixed bottom-40 ${language.dir === 'rtl' ? 'left-4' : 'right-4'} z-20 h-14 w-14 rounded-full shadow-lg lg:bottom-28 ${language.dir === 'rtl' ? 'lg:left-8' : 'lg:right-8'}`}
        size="icon"
        onClick={() => setChatOpen(true)}
      >
        <Bot className="h-8 w-8" />
        <span className="sr-only">{language.dashboard.guide}</span>
      </Button>
      
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`fixed bottom-20 ${language.dir === 'rtl' ? 'left-4' : 'right-4'} z-20 h-16 w-16 rounded-full shadow-lg ${language.dir === 'rtl' ? 'lg:bottom-8 lg:left-8' : 'lg:bottom-8 lg:right-8'} bg-primary hover:bg-primary/90`}
            size="icon"
          >
            <Plus className="h-8 w-8" />
            <span className="sr-only">{language.dashboard.addTransaction}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="top" align={language.dir === 'rtl' ? 'start' : 'end'} sideOffset={15}>
            <div className="flex flex-col items-end gap-3">
                 <Button onClick={openIncomeDialog} className="justify-center rounded-full bg-green-500 text-white hover:bg-green-600 h-11 px-6 shadow-lg">
                    <Plus className={`${language.dir === 'rtl' ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {language.dashboard.addIncome}
                </Button>
                <Button onClick={openExpenseDialog} className="justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 px-6 shadow-lg">
                    <span className={`font-bold text-xl ${language.dir === 'rtl' ? 'ml-2' : 'mr-2'}`}>−</span>
                    {language.dashboard.addExpense}
                </Button>
            </div>
        </PopoverContent>
      </Popover>

      <AddTransactionDialog 
        open={isIncomeDialogOpen} 
        onOpenChange={setIncomeDialogOpen}
        type="income"
      />
      <AddTransactionDialog 
        open={isExpenseDialogOpen} 
        onOpenChange={setExpenseDialogOpen}
        type="expense"
      />

      <Dialog open={isChatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none sm:max-w-lg w-full">
          <DialogTitle className="sr-only">{language.dashboard.guide}</DialogTitle>
          <ChatInterface />
        </DialogContent>
      </Dialog>
    </div>
  );
}
