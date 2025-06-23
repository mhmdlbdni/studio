
'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense';
}

const getValidationSchemas = (t: any) => ({
  incomeSchema: z.object({
    description: z.string().min(2, { message: t.validation.descTooShort }),
    amount: z.coerce.number().positive({ message: t.validation.amountPositive }),
  }),
  expenseSchema: z.object({
    description: z.string().min(2, { message: t.validation.descTooShort }),
    amount: z.coerce.number().positive({ message: t.validation.amountPositive }),
    potId: z.string({ required_error: t.validation.potRequired }),
  }),
});


export function AddTransactionDialog({ open, onOpenChange, type }: AddTransactionDialogProps) {
  const { addTransaction, pots, language } = useApp();
  const { toast } = useToast();
  
  const { incomeSchema, expenseSchema } = getValidationSchemas(language.translations);

  const incomeForm = useForm<z.infer<typeof incomeSchema>>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { description: '', amount: '' as any },
  });

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { description: '', amount: '' as any, potId: '' },
  });
  
  useEffect(() => {
    if (!open) {
      incomeForm.reset({ description: '', amount: '' as any });
      expenseForm.reset({ description: '', amount: '' as any, potId: '' });
    }
  }, [open, language, incomeForm, expenseForm]);


  const handleIncomeSubmit = (values: z.infer<typeof incomeSchema>) => {
    addTransaction({ ...values, type: 'income' });
    toast({ title: language.translations.toast.added, description: language.translations.toast.incomeSuccess });
    onOpenChange(false);
  };

  const handleExpenseSubmit = (values: z.infer<typeof expenseSchema>) => {
    addTransaction({ ...values, type: 'expense' });
    toast({ title: language.translations.toast.added, description: language.translations.toast.expenseSuccess });
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };
  
  const t = language.translations.addTransactionDialog;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {type === 'income' && (
          <Form {...incomeForm}>
            <form onSubmit={incomeForm.handleSubmit(handleIncomeSubmit)} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <TrendingUp className="text-green-500"/> {t.income.title}
                </DialogTitle>
                <DialogDescription>{t.income.description}</DialogDescription>
              </DialogHeader>
              <FormField
                control={incomeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.income.sourceLabel}</FormLabel>
                    <FormControl><Input placeholder={t.income.sourcePlaceholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={incomeForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.income.amountLabel}</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">{t.cancel}</Button></DialogClose>
                <Button type="submit">{t.income.submitButton}</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
        {type === 'expense' && (
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <TrendingDown className="text-destructive"/> {t.expense.title}
                </DialogTitle>
                <DialogDescription>{t.expense.description}</DialogDescription>
              </DialogHeader>
              <FormField
                control={expenseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.expense.descLabel}</FormLabel>
                    <FormControl><Input placeholder={t.expense.descPlaceholder} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.expense.amountLabel}</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="potId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.expense.potLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={t.expense.potPlaceholder} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pots.map(pot => (
                          <SelectItem key={pot.id} value={pot.id}>{pot.name[language.key]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost">{t.cancel}</Button></DialogClose>
                <Button type="submit">{t.expense.submitButton}</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
