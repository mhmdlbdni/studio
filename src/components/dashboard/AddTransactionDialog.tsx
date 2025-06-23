
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

const incomeSchema = z.object({
  description: z.string().min(2, 'الوصف قصير جداً'),
  amount: z.coerce.number().positive('المبلغ يجب أن يكون إيجابياً'),
});

const expenseSchema = z.object({
  description: z.string().min(2, 'الوصف قصير جداً'),
  amount: z.coerce.number().positive('المبلغ يجب أن يكون إيجابياً'),
  potId: z.string({ required_error: 'الرجاء اختيار وعاء' }),
});

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'income' | 'expense';
}

export function AddTransactionDialog({ open, onOpenChange, initialTab = 'expense' }: AddTransactionDialogProps) {
  const { addTransaction, pots, language } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      incomeForm.reset();
      expenseForm.reset();
    }
  }, [open, initialTab]);
  
  const getValidationMessages = (lang: 'ar' | 'en') => ({
    incomeSchema: z.object({
        description: z.string().min(2, lang === 'ar' ? 'الوصف قصير جداً' : 'Description is too short'),
        amount: z.coerce.number().positive(lang === 'ar' ? 'المبلغ يجب أن يكون إيجابياً' : 'Amount must be positive'),
    }),
    expenseSchema: z.object({
        description: z.string().min(2, lang === 'ar' ? 'الوصف قصير جداً' : 'Description is too short'),
        amount: z.coerce.number().positive(lang === 'ar' ? 'المبلغ يجب أن يكون إيجابياً' : 'Amount must be positive'),
        potId: z.string({ required_error: lang === 'ar' ? 'الرجاء اختيار وعاء' : 'Please select a pot' }),
    }),
  });

  const { incomeSchema: currentIncomeSchema, expenseSchema: currentExpenseSchema } = getValidationMessages(language);

  const incomeForm = useForm({
    resolver: zodResolver(currentIncomeSchema),
    defaultValues: { description: '', amount: '' },
  });

  const expenseForm = useForm({
    resolver: zodResolver(currentExpenseSchema),
    defaultValues: { description: '', amount: '', potId: '' },
  });

  useEffect(() => {
    incomeForm.reset();
    expenseForm.reset();
  }, [language, incomeForm, expenseForm]);


  const handleIncomeSubmit = (values) => {
    addTransaction({ ...values, type: 'income' });
    toast({ title: language === 'ar' ? 'تمت الإضافة' : 'Added', description: language === 'ar' ? 'تم توزيع الدخل بنجاح.' : 'Income distributed successfully.' });
    onOpenChange(false);
    incomeForm.reset();
  };

  const handleExpenseSubmit = (values) => {
    addTransaction({ ...values, type: 'expense' });
    toast({ title: language === 'ar' ? 'تمت الإضافة' : 'Added', description: language === 'ar' ? 'تم تسجيل المصروف بنجاح.' : 'Expense recorded successfully.' });
    onOpenChange(false);
    expenseForm.reset();
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      incomeForm.reset();
      expenseForm.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">{language === 'ar' ? 'إضافة مصروف' : 'Add Expense'}</TabsTrigger>
            <TabsTrigger value="income">{language === 'ar' ? 'إضافة دخل' : 'Add Income'}</TabsTrigger>
          </TabsList>
          <TabsContent value="expense">
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4 pt-4">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'إضافة مصروف جديد' : 'Add New Expense'}</DialogTitle>
                </DialogHeader>
                <FormField
                  control={expenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'الوصف' : 'Description'}</FormLabel>
                      <FormControl>
                        <Input placeholder={language === 'ar' ? "مثال: فاتورة الكهرباء، غداء عمل" : "e.g., Electricity bill, business lunch"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'المبلغ' : 'Amount'}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="potId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'اختر الوعاء للخصم منه' : 'Select pot to deduct from'}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر وعاء...' : 'Select a pot...'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pots.map(pot => (
                            <SelectItem key={pot.id} value={pot.id}>{pot.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="ghost">{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button></DialogClose>
                  <Button type="submit">{language === 'ar' ? 'إتمام الخصم' : 'Confirm Expense'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="income">
            <Form {...incomeForm}>
              <form onSubmit={incomeForm.handleSubmit(handleIncomeSubmit)} className="space-y-4 pt-4">
                <DialogHeader>
                  <DialogTitle>{language === 'ar' ? 'إضافة دخل جديد' : 'Add New Income'}</DialogTitle>
                </DialogHeader>
                 <FormField
                  control={incomeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'مصدر الدخل' : 'Income Source'}</FormLabel>
                      <FormControl>
                        <Input placeholder={language === 'ar' ? 'مثال: الراتب الشهري، مشروع جانبي' : 'e.g., Monthly salary, side project'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={incomeForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ar' ? 'المبلغ' : 'Amount'}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="ghost">{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button></DialogClose>
                  <Button type="submit">{language === 'ar' ? 'توزيع الدخل' : 'Distribute Income'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
