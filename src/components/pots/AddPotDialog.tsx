
'use client';
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


export function AddPotDialog({ open, onOpenChange, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (pot: Omit<Pot, 'icon'>) => void }) {
  const { language } = useApp();
  
  const form = useForm<z.infer<ReturnType<typeof potSchema>>>({
    resolver: zodResolver(potSchema(language)),
    defaultValues: {
      name: '',
      percentage: 0,
    },
  });

  const handleSubmit = (values: z.infer<ReturnType<typeof potSchema>>) => {
    const newPot: Omit<Pot, 'icon'> = {
      id: `custom-${new Date().getTime()}`,
      name: {
        ar: values.name,
        en: values.name,
      },
      percentage: values.percentage,
      color: '#8884d8' // Default color for custom pots
    };
    onSave(newPot);
    onOpenChange(false);
    form.reset();
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{language === 'ar' ? 'إضافة وعاء مخصص جديد' : 'Add New Custom Pot'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'ar' ? 'اسم الوعاء' : 'Pot Name'}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'ar' ? 'مثال: صندوق السفر' : 'e.g., Travel Fund'} {...field} />
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
              <Button type="submit">{language === 'ar' ? 'إضافة الوعاء' : 'Add Pot'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
