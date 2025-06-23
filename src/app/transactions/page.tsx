
'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subDays, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';

type FilterType = 'day' | 'week' | 'month' | 'all';

export default function TransactionsPage() {
  const { transactions, user, language, pots } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const currency = user?.currency || 'YER';

  const potMap = useMemo(() => {
    const map = new Map<string, {name: {ar: string, en: string}}>();
    pots.forEach(pot => map.set(pot.id, {name: pot.name}));
    return map;
  }, [pots]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    // Sort transactions once before filtering
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let interval: Interval | null = null;
    
    switch (filter) {
      case 'day':
        interval = { start: subDays(now, 1), end: now };
        break;
      case 'week':
        interval = { start: startOfWeek(now), end: now };
        break;
      case 'month':
        interval = { start: startOfMonth(now), end: now };
        break;
      case 'all':
      default:
        return sortedTransactions;
    }

    return sortedTransactions.filter(t => isWithinInterval(new Date(t.date), interval as Interval));
  }, [transactions, filter]);
  
  const { totalIncome, totalExpenses } = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpenses += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );
  }, [filteredTransactions]);

  const t = language.translations.transactionsPage;
  const dateLocale = language.key === 'ar' ? language.code : 'en-US';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t.all}</TabsTrigger>
              <TabsTrigger value="month">{t.monthly}</TabsTrigger>
              <TabsTrigger value="week">{t.weekly}</TabsTrigger>
              <TabsTrigger value="day">{t.daily}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.type}</TableHead>
                  <TableHead>{t.table.description}</TableHead>
                  <TableHead>{t.table.pot}</TableHead>
                  <TableHead className="text-right">{t.table.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(transaction => {
                    const isExpense = transaction.type === 'expense';
                    const potName = isExpense && transaction.potId ? potMap.get(transaction.potId)?.name[language.key] : '—';
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isExpense ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                                {isExpense ? 
                                    <TrendingDown className="h-5 w-5 text-destructive" /> : 
                                    <TrendingUp className="h-5 w-5 text-green-500" />}
                            </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </TableCell>
                        <TableCell>{potName}</TableCell>
                        <TableCell className={`text-right font-medium ${isExpense ? 'text-destructive' : 'text-green-500'}`}>
                          {isExpense ? '-' : '+'}
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {t.noTransactions}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={3}>{t.table.totalIncome}</TableCell>
                  <TableCell className="text-right text-green-500">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={3}>{t.table.totalExpenses}</TableCell>
                  <TableCell className="text-right text-destructive">
                    - {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
