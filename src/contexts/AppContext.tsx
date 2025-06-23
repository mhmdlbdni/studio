
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Pot, Transaction } from '@/lib/types';
import { DEFAULT_POTS } from '@/lib/constants';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { potIcons } from '@/lib/icons';

type Language = 'ar' | 'en';

interface AppState {
  user: User | null;
  pots: Pot[];
  transactions: Transaction[];
  theme: 'light' | 'dark';
  language: Language;
  setUser: (user: User | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updatePots: (pots: Pot[]) => void;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  getPotBalance: (potId: string) => number;
  totalIncome: number;
  totalExpenses: number;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [pots, setPots] = useState<Pot[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguageState] = useState<Language>('ar');
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) {
      const storedUser = localStorage.getItem('al-mawazin-user');
      const storedPots = localStorage.getItem('al-mawazin-pots');
      const storedTransactions = localStorage.getItem('al-mawazin-transactions');
      const storedTheme = localStorage.getItem('al-mawazin-theme') as 'light' | 'dark' | null;
      const storedLanguage = localStorage.getItem('al-mawazin-language') as Language | null;

      if (storedUser) setUserState(JSON.parse(storedUser));
      
      if (storedPots) {
        let needsMigration = false;
        const parsedPots = JSON.parse(storedPots);
        const migratedPotsData = parsedPots.map(p => {
            if (typeof p.name === 'string') {
                needsMigration = true;
                const defaultPotData = DEFAULT_POTS.find(dp => dp.id === p.id);
                const newName = defaultPotData ? defaultPotData.name : { ar: p.name, en: p.name };
                return { ...p, name: newName };
            }
            return p;
        });

        const potsWithIcons = migratedPotsData.map(pot => ({
            ...pot,
            icon: potIcons[pot.id as keyof typeof potIcons] || potIcons.custom
        }));
        
        setPots(potsWithIcons);

        if (needsMigration) {
            const potsToStore = migratedPotsData.map(({ icon, ...rest }) => rest);
            localStorage.setItem('al-mawazin-pots', JSON.stringify(potsToStore));
        }
      } else {
        setPots(DEFAULT_POTS);
      }

      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }

      const effectiveLanguage = storedLanguage || 'ar';
      setLanguageState(effectiveLanguage);
      document.documentElement.lang = effectiveLanguage;
      document.documentElement.dir = effectiveLanguage === 'ar' ? 'rtl' : 'ltr';

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
    const potsWithIcons = updatedPots.map(pot => ({
        ...pot,
        icon: potIcons[pot.id as keyof typeof potIcons] || potIcons.custom
    }));
    setPots(potsWithIcons);
    const potsToStore = updatedPots.map(({ icon, ...rest }) => rest);
    localStorage.setItem('al-mawazin-pots', JSON.stringify(potsToStore));
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

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('al-mawazin-language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const value = {
    user,
    pots,
    transactions,
    theme,
    language,
    setUser,
    addTransaction,
    updatePots,
    toggleTheme,
    setLanguage,
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
