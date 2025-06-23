
'use client';
import { useState } from 'react';
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

export function AddTransactionDialog({ open, onOpenChange }) {
  const { addTransaction, pots } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('expense');

  const incomeForm = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: { description: '', amount: '' },
  });

  const expenseForm = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { description: '', amount: '', potId: '' },
  });

  const handleIncomeSubmit = (values) => {
    addTransaction({ ...values, type: 'income' });
    toast({ title: 'تمت الإضافة', description: 'تم توزيع الدخل بنجاح.' });
    onOpenChange(false);
    incomeForm.reset();
  };

  const handleExpenseSubmit = (values) => {
    addTransaction({ ...values, type: 'expense' });
    toast({ title: 'تمت الإضافة', description: 'تم تسجيل المصروف بنجاح.' });
    onOpenChange(false);
    expenseForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">إضافة مصروف</TabsTrigger>
            <TabsTrigger value="income">إضافة دخل</TabsTrigger>
          </TabsList>
          <TabsContent value="expense">
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>إضافة مصروف جديد</DialogTitle>
                </DialogHeader>
                <FormField
                  control={expenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: فاتورة الكهرباء، غداء عمل" {...field} />
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
                      <FormLabel>المبلغ</FormLabel>
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
                      <FormLabel>اختر الوعاء للخصم منه</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر وعاء..." />
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
                  <DialogClose asChild><Button type="button" variant="ghost">إلغاء</Button></DialogClose>
                  <Button type="submit">إتمام الخصم</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="income">
            <Form {...incomeForm}>
              <form onSubmit={incomeForm.handleSubmit(handleIncomeSubmit)} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>إضافة دخل جديد</DialogTitle>
                </DialogHeader>
                 <FormField
                  control={incomeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مصدر الدخل</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: الراتب الشهري، مشروع جانبي" {...field} />
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
                      <FormLabel>المبلغ</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="ghost">إلغاء</Button></DialogClose>
                  <Button type="submit">توزيع الدخل</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
