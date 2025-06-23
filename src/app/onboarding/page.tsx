
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

const Logo = (props: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 258.4 258.4"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      fill="currentColor"
      d="M124.9,139.3l-2.2,2.2c-0.8,0.8-1.8,1.2-2.9,1.2s-2.1-0.4-2.9-1.2l-1.2-1.2c-1.6-1.6-1.6-4.2,0-5.8l2.2-2.2 c0.8-0.8,1.8-1.2,2.9-1.2s2.1,0.4,2.9,1.2l1.2,1.2C126.5,135.1,126.5,137.7,124.9,139.3z M253.5,4.9 C249.2,0.6,242.9,0.6,238.6,4.9l-57.5,57.5c-4.3,4.3-4.3,11.3,0,15.6l2.1,2.1c0.8,0.8,1.8,1.2,2.8,1.2s2-0.4,2.8-1.2l20.3-20.3 c4.3-4.3,11.3-4.3,15.6,0l26.7,26.7c4.3,4.3,11.3,4.3,15.6,0l26.7-26.7C257.8,16.2,257.8,9.2,253.5,4.9z M222,128.5 c-0.6-5.8-5.4-10-11.2-9.4c-49.8,5.5-92.3,31.4-120.3,69.5c-4.5,6.1-3,14.5,3.1,19.1l2.4,1.8c6.1,4.5,14.5,3,19.1-3.1 c24.2-32.9,60.2-55.2,101.4-60.3c1.2-0.1,2.4-0.2,3.5-0.2C216.5,145.8,222.6,138.2,222,128.5z M107,242.1l-1.8,1.8 c-4.5,4.5-11.8,4.5-16.3,0L13,167.9c-4.5-4.5-4.5-11.8,0-16.3l1.8-1.8c4.5-4.5,11.8-4.5,16.3,0l75.9,75.9 C111.5,230.3,111.5,237.6,107,242.1z"
    />
  </svg>
);

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
                <Logo className="h-20 w-20 text-primary" />
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
