'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Bot, Wallet, TrendingUp, TrendingDown, Droplets, Sparkles, Zap } from 'lucide-react';
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
  const balanceRatio = totalIncome > 0 ? Math.max(0, Math.min(100, (netBalance / totalIncome) * 100)) : 0;

  const openIncomeDialog = () => {
    setIncomeDialogOpen(true);
    setPopoverOpen(false);
  }

  const openExpenseDialog = () => {
    setExpenseDialogOpen(true);
    setPopoverOpen(false);
  }

  return (
    <div className="space-y-6 pb-24 md:space-y-10 md:pb-20 px-1">
      {/* Futuristic Hero Section - Optimized for Mobile */}
      <Card className="relative overflow-hidden border-none shadow-2xl bg-black/40 backdrop-blur-3xl min-h-[240px] md:min-h-[280px] flex flex-col justify-center rounded-[2.5rem] md:rounded-[3rem]">
        {/* Animated Bioluminescent Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="futuristic-card-glow" />
          <div 
            className="absolute bottom-0 left-0 right-0 liquid-gradient-bioluminescent transition-all duration-1000 ease-in-out"
            style={{ height: `${Math.max(15, balanceRatio)}%` }}
          >
            <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic opacity-30" />
            <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic-slow opacity-15" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-sm" />
        </div>

        <CardHeader className="pb-2 relative z-10 pt-6 md:pt-8 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <CardTitle className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary/80">
                {t.netBalance}
              </CardTitle>
            </div>
            <Link href="/transactions">
              <div className="p-2.5 md:p-3 rounded-2xl bg-white/5 border border-white/10 text-primary hover:bg-primary hover:text-white transition-all backdrop-blur-2xl active:scale-90">
                <Wallet className="h-4 w-4 md:h-5 md:w-5" />
              </div>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pb-6 md:pb-8 px-6">
          <div className="flex flex-col gap-1">
            <div className="text-4xl md:text-6xl font-black tracking-tighter drop-shadow-sm text-white">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                <p className="text-[8px] md:text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-2.5 w-2.5 fill-primary" />
                  {Math.round(balanceRatio)}% {language.key === 'ar' ? 'طاقة الرصيد' : 'Balance Energy'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:gap-4">
            <div className="group relative overflow-hidden flex items-center gap-3 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-3xl">
              <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-green-500/20 text-green-400">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest truncate">{language.key === 'ar' ? 'الوارد' : 'Inflow'}</p>
                <p className="text-sm md:text-base font-black text-green-400 truncate">{new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden flex items-center gap-3 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-3xl">
              <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-destructive/20 text-destructive">
                <TrendingDown className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest truncate">{language.key === 'ar' ? 'الصادر' : 'Outflow'}</p>
                <p className="text-sm md:text-base font-black text-destructive truncate">{new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Pots Section */}
      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between px-3">
          <div className="flex flex-col">
            <h2 className={cn("font-headline text-2xl md:text-3xl font-black tracking-tighter", language.dir === 'rtl' ? 'text-right' : 'text-left')}>
              {t.financialPots}
            </h2>
            <div className="h-1 w-10 bg-primary mt-1 rounded-full opacity-60" />
          </div>
          <Droplets className="h-5 w-5 text-primary/40 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {potDetails.map(pot => {
            const PotIcon = pot.icon;
            const totalAllocated = totalIncome * (pot.percentage / 100);
            const remainingBalance = getPotBalance(pot.id);
            const liquidLevel = totalAllocated > 0 ? (remainingBalance / totalAllocated) * 100 : 0;
            const safeLevel = Math.max(0, Math.min(liquidLevel, 100));
            
            return (
              <Link href={`/pots/${pot.id}`} key={pot.id}>
                <Card className="group relative overflow-hidden glass-effect rounded-[2rem] border-white/5 hover:border-primary/20 active:scale-[0.98] transition-transform">
                  <CardContent className="p-5 md:p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="relative">
                          <div className="p-3 md:p-4 rounded-2xl bg-secondary/30 group-hover:bg-primary/10 transition-colors duration-500">
                            <PotIcon className="h-6 w-6 md:h-7 md:w-7" style={{ color: pot.color }}/>
                          </div>
                        </div>
                        <div>
                          <p className="font-black text-lg md:text-xl tracking-tight text-foreground/90">{pot.name[language.key]}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: pot.color }} />
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{pot.percentage}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl md:text-2xl font-black tabular-nums" style={{ color: pot.color }}>
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(pot.balance)}
                        </p>
                        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">{language.key === 'ar' ? 'المتاح' : 'Available'}</p>
                      </div>
                    </div>

                    {/* Compact Futuristic Liquid Progress Bar */}
                    <div className="relative w-full h-2 rounded-full bg-black/20 border border-white/5 overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 top-0 transition-all duration-1000 ease-in-out"
                        style={{ 
                          width: `${safeLevel}%`, 
                          backgroundColor: pot.color,
                          boxShadow: `0 0 15px ${pot.color}40`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                        <div className="absolute top-0 right-0 bottom-0 w-[200%] liquid-wave-futuristic opacity-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Optimized Floating Action Buttons for Mobile Reachability */}
      <div className={cn(
        "fixed bottom-6 z-30 flex flex-col gap-3",
        language.dir === 'rtl' ? 'left-6' : 'right-6'
      )}>
        <Button
          variant="outline"
          className="h-14 w-14 rounded-2xl glass-effect border-primary/20 shadow-xl active:scale-90 transition-all"
          size="icon"
          onClick={() => setChatOpen(true)}
        >
          <Bot className="h-7 w-7 text-primary" />
          <span className="sr-only">{t.guide}</span>
        </Button>
        
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className="h-16 w-16 rounded-2xl shadow-2xl active:scale-90 bg-primary hover:bg-primary/90"
              size="icon"
            >
              <Plus className="h-8 w-8" />
              <span className="sr-only">{t.addTransaction}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="top" align={language.dir === 'rtl' ? 'start' : 'end'} sideOffset={12}>
            <div className="flex flex-col items-end gap-3 p-1">
              <Button onClick={openIncomeDialog} className="rounded-xl bg-green-500 text-white hover:bg-green-600 h-12 px-6 shadow-xl border-none font-black text-sm transition-all hover:-translate-y-1">
                <Plus className={cn("h-4 w-4", language.dir === 'rtl' ? 'ml-2' : 'mr-2')} />
                {t.addIncome}
              </Button>
              <Button onClick={openExpenseDialog} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 h-12 px-6 shadow-xl border-none font-black text-sm transition-all hover:-translate-y-1">
                <span className={cn("font-black text-xl", language.dir === 'rtl' ? 'ml-2' : 'mr-2')}>−</span>
                {t.addExpense}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

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
        <DialogContent className="p-0 bg-transparent border-none shadow-none sm:max-w-xl w-[95vw] mx-auto overflow-hidden rounded-3xl">
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
