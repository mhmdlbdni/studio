
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { CURRENCIES, DEFAULT_POTS } from '@/lib/constants';
import { potIcons } from '@/lib/icons';
import { Scale } from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('YER');
  const router = useRouter();
  const { setUser, updatePots } = useApp();

  const handleNext = () => setStep(s => s + 1);

  const handleFinish = () => {
    if (name.trim()) {
      setUser({ name, currency });
      updatePots(DEFAULT_POTS);
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md">
        {step === 1 && (
          <>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <Scale className="h-20 w-20 text-primary" />
              </div>
              <CardTitle className="font-headline text-2xl font-bold">أهلاً بك في الموازين</CardTitle>
              <CardDescription className="text-base">
                غيّر علاقتك بالمال إلى الأبد. نحن هنا لنبني لك نظاماً مالياً ذكياً، مع مرشد ذكي يدعمك في كل خطوة.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleNext} className="w-full text-lg">ابدأ الآن</Button>
            </CardFooter>
          </>
        )}
        {step === 2 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl font-bold">نظام ذكي.. وليس مجرد أرقام</CardTitle>
              <CardDescription className="text-base">
                سيتم تقسيم دخلك على 6 أوعية ذكية، بالإضافة إلى وصول كامل ومجاني إلى "مرشد الموازين" للمساعدة في فهم وتحسين عاداتك المالية.
              </CardDescription>
            </CardHeader>
             <CardContent className="grid grid-cols-3 gap-4 text-center">
                {DEFAULT_POTS.map(pot => {
                    const Icon = potIcons[pot.id as keyof typeof potIcons] || potIcons.custom;
                    return (
                        <div key={pot.id} className="flex flex-col items-center gap-1">
                            <div className="rounded-full bg-secondary p-3">
                                <Icon className="h-6 w-6" style={{color: pot.color}}/>
                            </div>
                            <p className="text-xs">{pot.name}</p>
                        </div>
                    )
                })}
            </CardContent>
            <CardFooter>
              <Button onClick={handleNext} className="w-full text-lg">التالي</Button>
            </CardFooter>
          </>
        )}
        {step === 3 && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl font-bold">على وشك الانتهاء!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">بماذا نناديك؟</Label>
                <Input id="name" placeholder="أدخل اسمك هنا" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>عملتك الأساسية</Label>
                 <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر العملة التي تستخدمها يوميًا." />
                    </SelectTrigger>
                    <SelectContent>
                        {CURRENCIES.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">اختر العملة التي تستخدمها يوميًا.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleFinish} disabled={!name.trim()} className="w-full text-lg">احفظ وانطلق!</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
