'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { User, Pot, Transaction } from '@/lib/types';
import { DEFAULT_POTS, AppLanguage, getLanguagePack, LanguageKey } from '@/lib/constants';
import { useIsMounted } from '@/hooks/use-is-mounted';
import { potIcons, PotIconKey } from '@/lib/icons';

interface AppState {
  user: User | null;
  pots: Pot[];
  transactions: Transaction[];
  theme: 'light' | 'dark';
  language: AppLanguage;
  setUser: (user: User | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updatePots: (pots: Omit<Pot, 'icon'>[]) => void;
  toggleTheme: () => void;
  setLanguage: (language: LanguageKey) => void;
  getPotBalance: (potId: string) => number;
  totalIncome: number;
  totalExpenses: number;
  logout: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const addDynamicPotData = (pots: Omit<Pot, 'icon'>[]): Pot[] => {
    return pots.map(pot => ({
        ...pot,
        icon: potIcons[pot.iconKey as PotIconKey] || potIcons.custom
    }));
};

const getDefaultPots = () => addDynamicPotData(DEFAULT_POTS.map(p => ({
    ...p,
    name: { ar: p.name.ar, en: p.name.en }
})));

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [pots, setPots] = useState<Pot[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguageState] = useState<AppLanguage>(getLanguagePack('ar'));
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted) {
      const storedUser = localStorage.getItem('al-mawazin-user');
      const storedPots = localStorage.getItem('al-mawazin-pots');
      const storedTransactions = localStorage.getItem('al-mawazin-transactions');
      const storedTheme = localStorage.getItem('al-mawazin-theme') as 'light' | 'dark' | null;
      const storedLanguage = localStorage.getItem('al-mawazin-language') as LanguageKey | null;

      if (storedUser) setUserState(JSON.parse(storedUser));
      
      if (storedPots) {
        setPots(addDynamicPotData(JSON.parse(storedPots)));
      } else {
        setPots(getDefaultPots());
      }

      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      
      if (storedTheme) {
        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      }

      const effectiveLanguageKey = storedLanguage || 'ar';
      const langPack = getLanguagePack(effectiveLanguageKey);
      setLanguageState(langPack);
      document.documentElement.lang = langPack.key;
      document.documentElement.dir = langPack.dir;
    }
  }, [isMounted]);

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser);
    if (newUser) localStorage.setItem('al-mawazin-user', JSON.stringify(newUser));
    else localStorage.removeItem('al-mawazin-user');
  }, []);
  
  const updatePots = useCallback((updatedPots: Omit<Pot, 'icon'>[]) => {
    setPots(addDynamicPotData(updatedPots));
    localStorage.setItem('al-mawazin-pots', JSON.stringify(updatedPots));
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    
    setTransactions(prev => {
        const newTransactions = [newTransaction, ...prev];
        localStorage.setItem('al-mawazin-transactions', JSON.stringify(newTransactions));
        return newTransactions;
    });
  }, []);

  const getPotBalance = useCallback((potId: string) => {
    const pot = pots.find(p => p.id === potId);
    if (!pot) return 0;

    const incomeForPot = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount * (pot.percentage / 100)), 0);

    const expensesForPot = transactions
        .filter(t => t.type === 'expense' && t.potId === potId)
        .reduce((sum, t) => sum + t.amount, 0);

    return incomeForPot - expensesForPot;
  }, [pots, transactions]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('al-mawazin-theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  }, []);

  const setLanguage = useCallback((langKey: LanguageKey) => {
    const langPack = getLanguagePack(langKey);
    setLanguageState(langPack);
    localStorage.setItem('al-mawazin-language', langKey);
    document.documentElement.lang = langPack.key;
    document.documentElement.dir = langPack.dir;
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUserState(null);
    setPots(getDefaultPots());
    setTransactions([]);
    setTheme('dark');
    document.documentElement.classList.add('dark');
    setLanguage('ar');
  }, [setLanguage]);

  return (
    <AppContext.Provider value={{
      user, pots, transactions, theme, language,
      setUser, addTransaction, updatePots, toggleTheme,
      setLanguage, getPotBalance, totalIncome, totalExpenses, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
