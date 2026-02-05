
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Bot, Wallet, TrendingUp, TrendingDown, Droplets } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTransactionDialog } from '@/components/dashboard/AddTransactionDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { pots, user, getPotBalance, totalIncome, totalExpenses, language, transactions } = useApp();
  const [isIncomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const currency = user?.currency || 'YER';

  const t = language.translations.dashboard;

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
       <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.netBalance}</CardTitle>
                    <Link href="/transactions">
                      <div className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                        <Wallet className="h-4 w-4" />
                      </div>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-black tracking-tighter">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance)}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-green-500/5 border border-green-500/10">
                        <div className="p-2 rounded-xl bg-green-500/20 text-green-500">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold">{language.key === 'ar' ? 'إجمالي الدخل' : 'Total Income'}</p>
                            <p className="text-sm font-bold text-green-500">{new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-destructive/5 border border-destructive/10">
                        <div className="p-2 rounded-xl bg-destructive/20 text-destructive">
                            <TrendingDown className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground font-bold">{language.key === 'ar' ? 'إجمالي المصاريف' : 'Total Expenses'}</p>
                            <p className="text-sm font-bold text-destructive">{new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
            <h2 className={cn("font-headline text-2xl font-black tracking-tight", language.dir === 'rtl' ? 'text-right' : 'text-left')}>
                {t.financialPots}
            </h2>
            <Droplets className="h-5 w-5 text-primary animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {potDetails.map(pot => {
            const PotIcon = pot.icon;
            const totalAllocated = totalIncome * (pot.percentage / 100);
            const expensesForPot = transactions
              .filter(t => t.type === 'expense' && t.potId === pot.id)
              .reduce((sum, t) => sum + t.amount, 0);

            // spentPercentage is how much of the "water" has been used. 
            // We'll visualize the REMAINING balance as the liquid level.
            const remainingBalance = getPotBalance(pot.id);
            const liquidLevel = totalAllocated > 0 ? (remainingBalance / totalAllocated) * 100 : 0;
            const safeLevel = Math.max(0, Math.min(liquidLevel, 100));
            
            return (
              <Link href={`/pots/${pot.id}`} key={pot.id}>
                <Card className="group hover:scale-[1.02] transition-all duration-300 border-none shadow-lg hover:shadow-2xl overflow-hidden relative bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-secondary/50 group-hover:bg-secondary transition-colors">
                                    <PotIcon className="h-6 w-6" style={{ color: pot.color }}/>
                                </div>
                                <div>
                                    <p className="font-black text-lg tracking-tight">{pot.name[language.key]}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{pot.percentage}% {language.key === 'ar' ? 'من الدخل' : 'Allocation'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black" style={{ color: pot.color }}>
                                  {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(pot.balance)}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-bold">{language.key === 'ar' ? 'الرصيد المتاح' : 'Available Balance'}</p>
                            </div>
                        </div>

                        {/* Liquid Progress Bar */}
                        <div className="relative w-full h-4 rounded-full bg-secondary/30 border border-white/5 overflow-hidden">
                            {/* The Water Fill */}
                            <div 
                                className="absolute bottom-0 left-0 top-0 transition-all duration-1000 ease-in-out"
                                style={{ 
                                    width: `${safeLevel}%`, 
                                    backgroundColor: pot.color,
                                    boxShadow: `0 0 20px ${pot.color}40, inset 0 2px 4px rgba(255,255,255,0.3)`
                                }}
                            >
                                {/* Liquid Surface Shimmer */}
                                <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white/30 to-transparent animate-pulse" />
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
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
        className={cn(
          "fixed bottom-40 z-20 h-14 w-14 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 bg-card border-primary/20",
          language.dir === 'rtl' ? 'left-4 lg:left-8' : 'right-4 lg:right-8'
        )}
        size="icon"
        onClick={() => setChatOpen(true)}
      >
        <Bot className="h-7 w-7 text-primary" />
        <span className="sr-only">{t.guide}</span>
      </Button>
      
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
                "fixed bottom-20 z-20 h-16 w-16 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 bg-primary hover:bg-primary/90",
                language.dir === 'rtl' ? 'left-4 lg:left-8 lg:bottom-8' : 'right-4 lg:right-8 lg:bottom-8'
            )}
            size="icon"
          >
            <Plus className="h-8 w-8" />
            <span className="sr-only">{t.addTransaction}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="top" align={language.dir === 'rtl' ? 'start' : 'end'} sideOffset={15}>
            <div className="flex flex-col items-end gap-3 p-2">
                 <Button onClick={openIncomeDialog} className="justify-center rounded-full bg-green-500 text-white hover:bg-green-600 h-12 px-6 shadow-xl border-none font-bold">
                    <Plus className={cn("h-4 w-4", language.dir === 'rtl' ? 'ml-2' : 'mr-2')} />
                    {t.addIncome}
                </Button>
                <Button onClick={openExpenseDialog} className="justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 h-12 px-6 shadow-xl border-none font-bold">
                    <span className={cn("font-bold text-xl", language.dir === 'rtl' ? 'ml-2' : 'mr-2')}>−</span>
                    {t.addExpense}
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
          <DialogTitle className="sr-only">{t.guide}</DialogTitle>
          <ChatInterface 
            requestOpenIncomeDialog={openIncomeDialog}
            requestOpenExpenseDialog={openExpenseDialog}
            closeChat={() => setChatOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
