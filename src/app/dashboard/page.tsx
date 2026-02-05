'use client';

import { useMemo, useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Bot, Wallet, TrendingUp, TrendingDown, CircleDollarSign, Coins, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddTransactionDialog } from '@/components/dashboard/AddTransactionDialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChatInterface } from '@/components/ai/ChatInterface';
import { cn } from '@/lib/utils';

export default function DashboardPage({ searchParams }: { searchParams: Promise<any> }) {
  const { pots, user, getPotBalance, totalIncome, totalExpenses, language, updatePots } = useApp();
  const [isIncomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Unwrap searchParams to satisfy Next.js 15
  const _resolvedSearchParams = use(searchParams);

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

  // Long Press Handlers for Reordering
  const handleTouchStart = (id: string) => {
    if (reorderingId) return;
    longPressTimer.current = setTimeout(() => {
      setReorderingId(id);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const movePot = (id: string, direction: 'up' | 'down') => {
    const index = pots.findIndex(p => p.id === id);
    if (index === -1) return;
    
    const newPots = [...pots];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newPots.length) {
      const [movedItem] = newPots.splice(index, 1);
      newPots.splice(targetIndex, 0, movedItem);
      updatePots(newPots);
    }
  };

  const formatCurrency = (amount: number) => {
    // Force English (Latin) numerals by using 'en-US' locale
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-5 pb-28 md:space-y-10 md:pb-20 px-0.5 select-none">
      {/* Futuristic Hero Section - Theme Aware */}
      <Card className="relative overflow-hidden border-none shadow-2xl bg-card dark:bg-black min-h-[220px] md:min-h-[300px] flex flex-col justify-center rounded-[2.8rem] md:rounded-[3.5rem] transition-all duration-500">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="futuristic-card-glow opacity-40" />
          <div 
            className="absolute bottom-0 left-0 right-0 liquid-gradient-bioluminescent transition-all duration-1000 ease-in-out"
            style={{ height: `${Math.max(15, balanceRatio)}%`, opacity: 0.7 }}
          >
            <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic opacity-30" />
            <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic-slow opacity-20" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/15 to-transparent" />
        </div>

        <CardHeader className="pb-1 relative z-10 pt-5 md:pt-8 px-6 md:px-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-primary/20 animate-pulse">
                <CircleDollarSign className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-foreground/80 dark:text-white/80">
                {t.netBalance}
              </CardTitle>
            </div>
            <Link href="/transactions">
              <div className="p-3.5 rounded-2xl bg-secondary/50 dark:bg-white/10 border border-border dark:border-white/20 text-foreground dark:text-white hover:bg-primary hover:text-white transition-all backdrop-blur-3xl active:scale-90 shadow-2xl">
                <Wallet className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pb-6 md:pb-10 px-6 md:px-10">
          <div className="flex flex-col gap-0.5">
            <div className="text-4xl xs:text-5xl md:text-7xl font-black tracking-tighter text-foreground dark:text-white drop-shadow-2xl leading-tight">
              {formatCurrency(netBalance)}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="px-4 py-1.5 rounded-full bg-primary/25 border border-primary/40 backdrop-blur-md shadow-2xl">
                <p className="text-[10px] md:text-[13px] font-black text-foreground dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Coins className="h-3.5 w-3.5 fill-primary text-primary" />
                  {Math.round(balanceRatio)}% {language.key === 'ar' ? 'طاقة الرصيد' : 'Balance Energy'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:gap-6">
            <div className="group relative overflow-hidden flex items-center gap-3 p-3.5 md:p-5 rounded-[2rem] bg-secondary/30 dark:bg-white/10 border border-border dark:border-white/10 backdrop-blur-3xl shadow-2xl transition-transform hover:scale-[1.02]">
              <div className="p-2.5 md:p-3 rounded-2xl bg-green-500/30 text-green-300 shadow-xl">
                <TrendingUp className="h-4 w-4 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] md:text-[10px] text-muted-foreground dark:text-slate-200 font-black uppercase tracking-widest truncate">{language.key === 'ar' ? 'الوارد' : 'Inflow'}</p>
                <p className="text-sm md:text-xl font-black text-green-500 truncate">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden flex items-center gap-3 p-3.5 md:p-5 rounded-[2rem] bg-secondary/30 dark:bg-white/10 border border-border dark:border-white/10 backdrop-blur-3xl shadow-2xl transition-transform hover:scale-[1.02]">
              <div className="p-2.5 md:p-3 rounded-2xl bg-destructive/30 text-destructive-foreground shadow-xl">
                <TrendingDown className="h-4 w-4 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] md:text-[10px] text-muted-foreground dark:text-slate-200 font-black uppercase tracking-widest truncate">{language.key === 'ar' ? 'الصادر' : 'Outflow'}</p>
                <p className="text-sm md:text-xl font-black text-red-500 truncate">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Pots Section */}
      <div className="space-y-5 md:space-y-8 mt-4 md:mt-8">
        <div className="flex items-center justify-between px-5">
          <div className="flex flex-col">
            <h2 className={cn("font-headline text-xl md:text-3xl font-black tracking-tighter text-foreground drop-shadow-sm", language.dir === 'rtl' ? 'text-right' : 'text-left')}>
              {t.financialPots}
            </h2>
            <div className="h-1.5 w-10 bg-primary mt-1 rounded-full shadow-lg" />
          </div>
          {reorderingId && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-full bg-primary/20 text-primary border border-primary/30 h-8 px-4 font-black"
              onClick={() => setReorderingId(null)}
            >
              <Check className="h-4 w-4 ml-1" />
              {language.key === 'ar' ? 'تم' : 'Done'}
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4 px-2">
          {potDetails.map((pot, index) => {
            const PotIcon = pot.icon;
            const totalAllocated = totalIncome * (pot.percentage / 100);
            const remainingBalance = getPotBalance(pot.id);
            const liquidLevel = totalAllocated > 0 ? (remainingBalance / totalAllocated) * 100 : 0;
            const safeLevel = Math.max(0, Math.min(liquidLevel, 100));
            const isTarget = reorderingId === pot.id;
            
            return (
              <div 
                key={pot.id} 
                className={cn(
                  "relative transition-all duration-300",
                  isTarget ? "scale-[1.05] z-20 shadow-2xl" : reorderingId ? "opacity-50 grayscale scale-[0.98]" : "hover:scale-[1.01]"
                )}
                onMouseDown={() => handleTouchStart(pot.id)}
                onMouseUp={handleTouchEnd}
                onTouchStart={() => handleTouchStart(pot.id)}
                onTouchEnd={handleTouchEnd}
              >
                {/* Reorder Controls Overlay */}
                {isTarget && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
                    <Button 
                      size="icon" 
                      className="rounded-full w-10 h-10 bg-white/20 backdrop-blur-3xl border border-white/30 text-white shadow-2xl active:scale-90"
                      onClick={(e) => { e.preventDefault(); movePot(pot.id, 'up'); }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-6 w-6" />
                    </Button>
                    <Button 
                      size="icon" 
                      className="rounded-full w-10 h-10 bg-white/20 backdrop-blur-3xl border border-white/30 text-white shadow-2xl active:scale-90"
                      onClick={(e) => { e.preventDefault(); movePot(pot.id, 'down'); }}
                      disabled={index === pots.length - 1}
                    >
                      <ChevronDown className="h-6 w-6" />
                    </Button>
                  </div>
                )}

                <Link href={reorderingId ? "#" : `/pots/${pot.id}`} className={cn("block w-full", reorderingId && "cursor-default")}>
                  <Card className={cn(
                    "group relative overflow-hidden bg-card/60 backdrop-blur-3xl rounded-[2.5rem] border-white/10 transition-all duration-300 shadow-2xl",
                    isTarget ? "border-primary/50 bg-primary/5" : "hover:border-primary/50 active:scale-[0.97]"
                  )}>
                    <CardContent className="p-5 md:p-8 flex flex-col gap-5">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="p-4 rounded-[1.8rem] bg-secondary/60 group-hover:bg-primary/20 transition-all duration-500 shadow-inner">
                              <PotIcon className="h-6 w-6 md:h-8 md:w-8" style={{ color: pot.color }}/>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background" style={{ backgroundColor: pot.color }} />
                          </div>
                          <div>
                            <p className="font-black text-lg md:text-2xl tracking-tight text-foreground leading-none">{pot.name[language.key]}</p>
                            <p className="text-[9px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">{pot.percentage}% {language.key === 'ar' ? 'تخصيص' : 'Allocated'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl md:text-3xl font-black tabular-nums" style={{ color: pot.color }}>
                            {formatCurrency(pot.balance)}
                          </p>
                          <p className="text-[8px] md:text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1">{language.key === 'ar' ? 'المتاح حالياً' : 'Available Now'}</p>
                        </div>
                      </div>

                      <div className="relative w-full h-3.5 rounded-full bg-black/20 border border-white/5 overflow-hidden shadow-inner">
                        <div 
                          className="absolute bottom-0 left-0 top-0 transition-all duration-1000 ease-in-out"
                          style={{ 
                            width: `${safeLevel}%`, 
                            backgroundColor: pot.color,
                            boxShadow: `0 0 25px ${pot.color}80`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
                          <div className="absolute top-0 right-0 bottom-0 w-[300%] liquid-wave-futuristic opacity-40" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className={cn(
        "fixed bottom-10 z-30 flex flex-col gap-6",
        language.dir === 'rtl' ? 'left-6' : 'right-6'
      )}>
        <Button
          variant="outline"
          className="h-14 w-14 md:h-16 md:w-16 rounded-[1.6rem] bg-card/90 backdrop-blur-3xl border-primary/40 shadow-[0_10px_40px_rgba(0,0,0,0.4)] active:scale-90 transition-all group overflow-hidden"
          size="icon"
          onClick={() => setChatOpen(true)}
        >
          <Bot className="h-7 w-7 md:h-8 md:w-8 text-primary group-hover:scale-110 transition-transform" />
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          <span className="sr-only">{t.guide}</span>
        </Button>
        
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className="h-16 w-16 md:h-16 md:w-16 rounded-[1.8rem] shadow-[0_15px_50px_rgba(var(--primary),0.5)] active:scale-95 bg-primary hover:bg-primary/90 transition-all group relative overflow-hidden"
              size="icon"
            >
              <Plus className="h-8 w-8 md:h-10 md:w-10 text-white group-hover:rotate-90 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <span className="sr-only">{t.addTransaction}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="top" align={language.dir === 'rtl' ? 'start' : 'end'} sideOffset={20}>
            <div className="flex flex-col items-end gap-4 p-2">
              <Button onClick={openIncomeDialog} className="rounded-[1.5rem] bg-green-500 text-white hover:bg-green-600 h-12 px-5 shadow-[0_10px_30px_rgba(34,197,94,0.3)] border-none font-black text-sm transition-all hover:-translate-y-1 active:scale-95">
                <Plus className={cn("h-4 w-4", language.dir === 'rtl' ? 'ml-1.5' : 'mr-1.5')} />
                {t.addIncome}
              </Button>
              <Button onClick={openExpenseDialog} className="rounded-[1.5rem] bg-destructive text-white hover:bg-destructive/90 h-12 px-5 shadow-[0_10px_30px_rgba(220,38,38,0.3)] border-none font-black text-sm transition-all hover:-translate-y-1 active:scale-95">
                <span className={cn("font-black text-lg", language.dir === 'rtl' ? 'ml-1.5' : 'mr-1.5')}>−</span>
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
        <DialogContent className="p-0 bg-transparent border-none shadow-none sm:max-w-xl w-[98vw] mx-auto overflow-hidden rounded-[2.8rem]">
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
