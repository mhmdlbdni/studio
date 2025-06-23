
'use client';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useApp } from '@/contexts/AppContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { iconList, PotIconKey } from '@/lib/icons';
import { Check } from 'lucide-react';

const potSchema = (language: 'ar' | 'en') => z.object({
  name: z.string().min(2, language === 'ar' ? 'اسم الوعاء قصير جداً' : 'Pot name is too short'),
  percentage: z.coerce.number()
    .min(0, language === 'ar' ? 'النسبة لا يمكن أن تكون سالبة' : 'Percentage cannot be negative')
    .max(100, language === 'ar' ? 'النسبة لا يمكن أن تتجاوز 100' : 'Percentage cannot exceed 100'),
  color: z.string(),
  iconKey: z.string()
});

const PRESET_COLORS = ['#FF7B00', '#28A745', '#17A2B8', '#6F42C1', '#FFC107', '#E83E8C', '#DC3545', '#007BFF', '#6C757D', '#343A40', '#FD7E14', '#20C997'];

export function AddPotDialog({ open, onOpenChange, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (pot: { name: string; percentage: number; color: string; iconKey: string; }) => void }) {
  const { language } = useApp();
  const [iconSearch, setIconSearch] = useState('');
  const [isIconPopoverOpen, setIconPopoverOpen] = useState(false);
  
  const form = useForm<z.infer<ReturnType<typeof potSchema>>>({
    resolver: zodResolver(potSchema(language.key)),
    defaultValues: {
      name: '',
      percentage: 0,
      color: PRESET_COLORS[0],
      iconKey: 'custom'
    },
  });

  const handleSubmit = (values: z.infer<ReturnType<typeof potSchema>>) => {
    onSave(values);
    onOpenChange(false);
    form.reset();
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return iconList;
    const lowercasedSearch = iconSearch.toLowerCase();
    return iconList.filter(icon => 
        icon.name.en.toLowerCase().includes(lowercasedSearch) ||
        icon.name.ar.includes(lowercasedSearch)
    );
  }, [iconSearch]);

  const selectedIconKey = form.watch('iconKey');
  const SelectedIcon = iconList.find(i => i.key === selectedIconKey)?.icon || iconList.find(i => i.key === 'custom')!.icon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{language.key === 'ar' ? 'إضافة وعاء مخصص جديد' : 'Add New Custom Pot'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language.key === 'ar' ? 'اسم الوعاء' : 'Pot Name'}</FormLabel>
                    <FormControl>
                      <Input placeholder={language.key === 'ar' ? 'مثال: صندوق السفر' : 'e.g., Travel Fund'} {...field} />
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
                    <FormLabel>{language.key === 'ar' ? 'النسبة المئوية' : 'Percentage'}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language.key === 'ar' ? 'اختر لوناً' : 'Choose a color'}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-6 gap-2 pt-2"
                      >
                        {PRESET_COLORS.map(color => (
                           <RadioGroupItem key={color} value={color} className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: color, borderColor: field.value === color ? 'hsl(var(--primary))' : color }}>
                               {field.value === color && <Check className="h-4 w-4 text-white"/>}
                           </RadioGroupItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iconKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language.key === 'ar' ? 'اختر أيقونة' : 'Choose an icon'}</FormLabel>
                    <Popover open={isIconPopoverOpen} onOpenChange={setIconPopoverOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant="outline" role="combobox" className="w-full justify-start">
                                    <SelectedIcon className={`h-5 w-5 ${language.dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                                    {iconList.find(i => i.key === field.value)?.name[language.key] || 'Select icon'}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Input
                                placeholder={language.key === 'ar' ? 'ابحث عن أيقونة...' : 'Search icon...'}
                                className="m-2 w-[calc(100%-1rem)]"
                                value={iconSearch}
                                onChange={e => setIconSearch(e.target.value)}
                            />
                            <ScrollArea className="h-60">
                                <div className="grid grid-cols-4 gap-1 p-2">
                                    {filteredIcons.map(icon => {
                                        const IconComp = icon.icon;
                                        return (
                                            <Button
                                                key={icon.key}
                                                variant="ghost"
                                                className="flex h-auto flex-col gap-1 p-2"
                                                onClick={() => {
                                                    field.onChange(icon.key);
                                                    setIconPopoverOpen(false);
                                                }}
                                            >
                                                <IconComp className="h-6 w-6"/>
                                                <span className="text-xs">{icon.name[language.key]}</span>
                                            </Button>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="ghost">{language.key === 'ar' ? 'إلغاء' : 'Cancel'}</Button></DialogClose>
              <Button type="submit">{language.key === 'ar' ? 'إضافة الوعاء' : 'Add Pot'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
