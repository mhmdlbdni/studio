
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Pot, Transaction } from '@/lib/types';
import { DEFAULT_POTS } from '@/lib/constants';
import { useIsMounted } from '@/hooks/use-is-mounted';

interface AppState {
  user: User | null;
  pots: Pot[];
  transactions: Transaction[];
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updatePots: (pots: Pot[]) => void;
  toggleTheme: () => void;
  getPotBalance: (potId: string) => number;
  totalIncome: number;
  totalExpenses: number;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [pots, setPots] = useState<Pot[]>(DEFAULT_POTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) {
      const storedUser = localStorage.getItem('al-mawazin-user');
      const storedPots = localStorage.getItem('al-mawazin-pots');
      const storedTransactions = localStorage.getItem('al-mawazin-transactions');
      const storedTheme = localStorage.getItem('al-mawazin-theme') as 'light' | 'dark' | null;

      if (storedUser) setUserState(JSON.parse(storedUser));
      if (storedPots) setPots(JSON.parse(storedPots));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, [isMounted]);

  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('al-mawazin-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('al-mawazin-user');
    }
  };
  
  const updatePots = (updatedPots: Pot[]) => {
    setPots(updatedPots);
    localStorage.setItem('al-mawazin-pots', JSON.stringify(updatedPots));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().toISOString() + Math.random(),
      date: new Date().toISOString(),
    };
    
    setTransactions(prev => {
        const newTransactions = [newTransaction, ...prev];
        localStorage.setItem('al-mawazin-transactions', JSON.stringify(newTransactions));
        return newTransactions;
    });
  };

  const getPotBalance = (potId: string) => {
    const pot = pots.find(p => p.id === potId);
    if (!pot) return 0;

    const incomeForPot = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount * (pot.percentage / 100)), 0);

    const expensesForPot = transactions
        .filter(t => t.type === 'expense' && t.potId === potId)
        .reduce((sum, t) => sum + t.amount, 0);

    return incomeForPot - expensesForPot;
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);


  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('al-mawazin-theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  };

  const value = {
    user,
    pots,
    transactions,
    theme,
    setUser,
    addTransaction,
    updatePots,
    toggleTheme,
    getPotBalance,
    totalIncome,
    totalExpenses
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
