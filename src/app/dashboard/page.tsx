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
    <div className="space-y-10 pb-20">
      {/* Futuristic Hero Section */}
      <Card className="relative overflow-hidden border-none shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-3xl min-h-[280px] flex flex-col justify-center rounded-[3rem]">
        {/* Animated Bioluminescent Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="futuristic-card-glow" />
          <div 
            className="absolute bottom-0 left-0 right-0 liquid-gradient-bioluminescent transition-all duration-1000 ease-in-out"
            style={{ height: `${Math.max(10, balanceRatio)}%` }}
          >
            <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic opacity-40" />
            <div className="absolute -top-32 left-0 w-[400%] h-64 liquid-wave-futuristic-slow opacity-20" />
          </div>
          {/* Top light beam */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
        </div>

        <CardHeader className="pb-2 relative z-10 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">{t.netBalance}</CardTitle>
            </div>
            <Link href="/transactions">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-primary hover:bg-primary hover:text-white transition-all backdrop-blur-2xl">
                <Wallet className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pb-8">
          <div className="flex flex-col gap-1">
            <div className="text-6xl font-black tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] text-white">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance)}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <Zap className="h-3 w-3 fill-primary" />
                  {Math.round(balanceRatio)}% {language.key === 'ar' ? 'مستوى الطاقة المالية' : 'Financial Energy Level'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="group relative overflow-hidden flex items-center gap-4 p-4 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-3xl glass-effect-hover">
              <div className="p-3 rounded-2xl bg-green-500/20 text-green-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{language.key === 'ar' ? 'الدفق الوارد' : 'Incoming Flow'}</p>
                <p className="text-base font-black text-green-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden flex items-center gap-4 p-4 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-3xl glass-effect-hover">
              <div className="p-3 rounded-2xl bg-destructive/20 text-destructive">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{language.key === 'ar' ? 'الدفق الصادر' : 'Outgoing Flow'}</p>
                <p className="text-base font-black text-destructive">{new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Pots Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <h2 className={cn("font-headline text-3xl font-black tracking-tighter", language.dir === 'rtl' ? 'text-right' : 'text-left')}>
              {t.financialPots}
            </h2>
            <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
          </div>
          <Droplets className="h-6 w-6 text-primary/50 animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {potDetails.map(pot => {
            const PotIcon = pot.icon;
            const totalAllocated = totalIncome * (pot.percentage / 100);
            const remainingBalance = getPotBalance(pot.id);
            const liquidLevel = totalAllocated > 0 ? (remainingBalance / totalAllocated) * 100 : 0;
            const safeLevel = Math.max(0, Math.min(liquidLevel, 100));
            
            return (
              <Link href={`/pots/${pot.id}`} key={pot.id}>
                <Card className="group relative overflow-hidden glass-effect glass-effect-hover rounded-[2.5rem] border-white/5 hover:border-primary/30">
                  <CardContent className="p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="p-4 rounded-[1.5rem] bg-secondary/50 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-500">
                            <PotIcon className="h-7 w-7" style={{ color: pot.color }}/>
                          </div>
                          {/* Pulse effect on hover */}
                          <div className="absolute inset-0 rounded-[1.5rem] bg-primary/20 scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-0 transition-all duration-700" />
                        </div>
                        <div>
                          <p className="font-black text-xl tracking-tight text-foreground/90">{pot.name[language.key]}</p>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pot.color }} />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{pot.percentage}% {language.key === 'ar' ? 'تخصيص' : 'Allocation'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black tabular-nums" style={{ color: pot.color }}>
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(pot.balance)}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{language.key === 'ar' ? 'الرصيد المتاح' : 'Available'}</p>
                      </div>
                    </div>

                    {/* Futuristic Liquid Progress Bar */}
                    <div className="relative w-full h-3 rounded-full bg-black/20 border border-white/5 overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 top-0 transition-all duration-1000 ease-in-out"
                        style={{ 
                          width: `${safeLevel}%`, 
                          backgroundColor: pot.color,
                          boxShadow: `0 0 25px ${pot.color}80`
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

      {/* Floating Action Buttons */}
      <Button
        variant="outline"
        className={cn(
          "fixed bottom-40 z-20 h-16 w-16 rounded-[1.5rem] glass-effect border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all hover:scale-110 active:scale-95 group",
          language.dir === 'rtl' ? 'left-6 lg:left-12' : 'right-6 lg:right-12'
        )}
        size="icon"
        onClick={() => setChatOpen(true)}
      >
        <Bot className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
        <span className="sr-only">{t.guide}</span>
      </Button>
      
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "fixed bottom-20 z-20 h-20 w-20 rounded-[2rem] shadow-[0_10px_40px_rgba(var(--primary),0.5)] transition-all hover:scale-110 active:scale-95 bg-primary hover:bg-primary/90",
              language.dir === 'rtl' ? 'left-6 lg:left-12 lg:bottom-12' : 'right-6 lg:right-12 lg:bottom-12'
            )}
            size="icon"
          >
            <Plus className="h-10 w-10" />
            <span className="sr-only">{t.addTransaction}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none bg-transparent shadow-none" side="top" align={language.dir === 'rtl' ? 'start' : 'end'} sideOffset={20}>
          <div className="flex flex-col items-end gap-4 p-2">
            <Button onClick={openIncomeDialog} className="justify-center rounded-[1.2rem] bg-green-500 text-white hover:bg-green-600 h-14 px-8 shadow-2xl border-none font-black text-base transition-all hover:-translate-y-1">
              <Plus className={cn("h-5 w-5", language.dir === 'rtl' ? 'ml-3' : 'mr-3')} />
              {t.addIncome}
            </Button>
            <Button onClick={openExpenseDialog} className="justify-center rounded-[1.2rem] bg-destructive text-destructive-foreground hover:bg-destructive/90 h-14 px-8 shadow-2xl border-none font-black text-base transition-all hover:-translate-y-1">
              <span className={cn("font-black text-2xl", language.dir === 'rtl' ? 'ml-3' : 'mr-3')}>−</span>
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
        <DialogContent className="p-0 bg-transparent border-none shadow-none sm:max-w-xl w-full">
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
