
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

const potSchema = z.object({
  name: z.string().min(2, 'اسم الوعاء قصير جداً'),
  percentage: z.coerce.number().min(0, 'النسبة لا يمكن أن تكون سالبة').max(100, 'النسبة لا يمكن أن تتجاوز 100'),
});

export function EditPotDialog({ open, onOpenChange, pot, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, pot: Pot, onSave: (pot: Pot) => void }) {
  const form = useForm({
    resolver: zodResolver(potSchema),
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
              <DialogTitle>تعديل وعاء "{pot?.name}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الوعاء</FormLabel>
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
                    <FormLabel>النسبة المئوية</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="ghost">إلغاء</Button></DialogClose>
              <Button type="submit">حفظ التغييرات</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
