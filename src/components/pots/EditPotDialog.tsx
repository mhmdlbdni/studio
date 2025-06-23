
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Pot } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';

const potSchema = (language: 'ar' | 'en') => z.object({
  name: z.string().min(2, language === 'ar' ? 'اسم الوعاء قصير جداً' : 'Pot name is too short'),
  percentage: z.coerce.number()
    .min(0, language === 'ar' ? 'النسبة لا يمكن أن تكون سالبة' : 'Percentage cannot be negative')
    .max(100, language === 'ar' ? 'النسبة لا يمكن أن تتجاوز 100' : 'Percentage cannot exceed 100'),
});


export function EditPotDialog({ open, onOpenChange, pot, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, pot: Pot, onSave: (pot: Pot) => void }) {
  const { language } = useApp();
  
  const form = useForm({
    resolver: zodResolver(potSchema(language)),
    defaultValues: {
      name: pot?.name || '',
      percentage: pot?.percentage || 0,
    },
  });

  useEffect(() => {
    if (pot) {
      form.reset({
        name: pot.name,
        percentage: pot.percentage,
      });
    }
  }, [pot, form]);

  useEffect(() => {
    form.trigger();
  }, [language, form]);

  const handleSubmit = (values) => {
    onSave({ ...pot, ...values });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{language === 'ar' ? `تعديل وعاء "${pot?.name}"` : `Edit Pot "${pot?.name}"`}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'اسم الوعاء' : 'Pot Name'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'النسبة المئوية' : 'Percentage'}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="ghost">{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button></DialogClose>
              <Button type="submit">{language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
