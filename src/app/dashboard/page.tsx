'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
      {/* Futuristic Hero Section - High Contrast Optimized */}
      <Card className="relative overflow-hidden border-none shadow-2xl bg-black min-h-[260px] md:min-h-[300px] flex flex-col justify-center rounded-[2.5rem] md:rounded-[3rem]">
        {/* Animated Bioluminescent Background - Darker for Contrast */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="futuristic-card-glow opacity-30" />
          <div 
            className="absolute bottom-0 left-0 right-0 liquid-gradient-bioluminescent transition-all duration-1000 ease-in-out"
            style={{ height: `${Math.max(20, balanceRatio)}%`, opacity: 0.6 }}
          >
            <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic opacity-25" />
            <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic-slow opacity-15" />
          </div>
          {/* Subtle top light for depth */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
        </div>

        <CardHeader className="pb-2 relative z-10 pt-6 md:pt-8 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <CardTitle className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] md:tracking-[0.35em] text-white/90 drop-shadow-md">
                {t.netBalance}
              </CardTitle>
            </div>
            <Link href="/transactions">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-primary transition-all backdrop-blur-2xl active:scale-90 shadow-lg">
                <Wallet className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pb-6 md:pb-8 px-6">
          <div className="flex flex-col gap-1">
            <div className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance)}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-md shadow-inner">
                <p className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-3 w-3 fill-primary text-primary" />
                  {Math.round(balanceRatio)}% {language.key === 'ar' ? 'طاقة الرصيد' : 'Balance Energy'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="group relative overflow-hidden flex items-center gap-3 p-4 rounded-[1.8rem] bg-white/10 border border-white/10 backdrop-blur-3xl shadow-xl">
              <div className="p-3 rounded-2xl bg-green-500/30 text-green-300 shadow-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest truncate drop-shadow-sm">{language.key === 'ar' ? 'الوارد' : 'Inflow'}</p>
                <p className="text-base md:text-lg font-black text-green-400 truncate drop-shadow-sm">{new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden flex items-center gap-3 p-4 rounded-[1.8rem] bg-white/10 border border-white/10 backdrop-blur-3xl shadow-xl">
              <div className="p-3 rounded-2xl bg-destructive/30 text-destructive-foreground shadow-lg">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest truncate drop-shadow-sm">{language.key === 'ar' ? 'الصادر' : 'Outflow'}</p>
                <p className="text-base md:text-lg font-black text-red-400 truncate drop-shadow-sm">{new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Pots Section - Improved Contrast */}
      <div className="space-y-6 md:space-y-8 mt-8">
        <div className="flex items-center justify-between px-4">
          <div className="flex flex-col">
            <h2 className={cn("font-headline text-2xl md:text-3xl font-black tracking-tighter text-foreground drop-shadow-sm", language.dir === 'rtl' ? 'text-right' : 'text-left')}>
              {t.financialPots}
            </h2>
            <div className="h-1.5 w-12 bg-primary mt-1.5 rounded-full shadow-sm" />
          </div>
          <Droplets className="h-6 w-6 text-primary/60 animate-bounce" />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:gap-6 px-1">
          {potDetails.map(pot => {
            const PotIcon = pot.icon;
            const totalAllocated = totalIncome * (pot.percentage / 100);
            const remainingBalance = getPotBalance(pot.id);
            const liquidLevel = totalAllocated > 0 ? (remainingBalance / totalAllocated) * 100 : 0;
            const safeLevel = Math.max(0, Math.min(liquidLevel, 100));
            
            return (
              <Link href={`/pots/${pot.id}`} key={pot.id}>
                <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-2xl rounded-[2.2rem] border-white/10 hover:border-primary/40 active:scale-[0.98] transition-all duration-300 shadow-xl">
                  <CardContent className="p-6 md:p-7 flex flex-col gap-6">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="p-4 rounded-2xl bg-secondary/40 group-hover:bg-primary/20 transition-colors duration-500 shadow-inner">
                            <PotIcon className="h-7 w-7 md:h-8 md:w-8" style={{ color: pot.color }}/>
                          </div>
                        </div>
                        <div>
                          <p className="font-black text-xl md:text-2xl tracking-tight text-foreground">{pot.name[language.key]}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: pot.color }} />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">{pot.percentage}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl md:text-3xl font-black tabular-nums drop-shadow-sm" style={{ color: pot.color }}>
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(pot.balance)}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{language.key === 'ar' ? 'المتاح حالياً' : 'Available Now'}</p>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative w-full h-3 rounded-full bg-black/30 border border-white/5 overflow-hidden shadow-inner">
                      <div 
                        className="absolute bottom-0 left-0 top-0 transition-all duration-1000 ease-in-out"
                        style={{ 
                          width: `${safeLevel}%`, 
                          backgroundColor: pot.color,
                          boxShadow: `0 0 20px ${pot.color}60`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                        <div className="absolute top-0 right-0 bottom-0 w-[200%] liquid-wave-futuristic opacity-30" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Optimized Floating Action Buttons */}
      <div className={cn(
        "fixed bottom-8 z-30 flex flex-col gap-4",
        language.dir === 'rtl' ? 'left-8' : 'right-8'
      )}>
        <Button
          variant="outline"
          className="h-16 w-16 rounded-[1.5rem] bg-card/80 backdrop-blur-2xl border-primary/30 shadow-2xl active:scale-90 transition-all group"
          size="icon"
          onClick={() => setChatOpen(true)}
        >
          <Bot className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          <span className="sr-only">{t.guide}</span>
        </Button>
        
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className="h-20 w-20 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] active:scale-90 bg-primary hover:bg-primary/90 transition-all group overflow-hidden"
              size="icon"
            >
              <Plus className="h-10 w-10 text-white group-hover:rotate-90 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <span className="sr-only">{t.addTransaction}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="top" align={language.dir === 'rtl' ? 'start' : 'end'} sideOffset={16}>
            <div className="flex flex-col items-end gap-4 p-2">
              <Button onClick={openIncomeDialog} className="rounded-2xl bg-green-500 text-white hover:bg-green-600 h-14 px-8 shadow-2xl border-none font-black text-base transition-all hover:-translate-y-1 active:scale-95">
                <Plus className={cn("h-5 w-5", language.dir === 'rtl' ? 'ml-3' : 'mr-3')} />
                {t.addIncome}
              </Button>
              <Button onClick={openExpenseDialog} className="rounded-2xl bg-destructive text-white hover:bg-destructive/90 h-14 px-8 shadow-2xl border-none font-black text-base transition-all hover:-translate-y-1 active:scale-95">
                <span className={cn("font-black text-2xl", language.dir === 'rtl' ? 'ml-3' : 'mr-3')}>−</span>
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
        <DialogContent className="p-0 bg-transparent border-none shadow-none sm:max-w-xl w-[95vw] mx-auto overflow-hidden rounded-[2.5rem]">
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
