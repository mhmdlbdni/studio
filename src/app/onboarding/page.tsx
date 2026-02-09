'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { CURRENCIES, DEFAULT_POTS } from '@/lib/constants';
import { potIcons } from '@/lib/icons';
import { Logo } from '@/components/icons/Logo';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('YER');
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const { setUser, updatePots, language } = useApp();

  useEffect(() => {
    // Check if user already exists to skip onboarding
    const storedUser = localStorage.getItem('al-mawazin-user');
    if (storedUser) {
      router.replace('/dashboard');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleNext = () => setStep(s => s + 1);

  const handleFinish = () => {
    if (name.trim()) {
      setUser({ name, currency });
      const potsWithEnglishNames = DEFAULT_POTS.map(p => ({
            ...p,
            name: {
                ar: p.name.ar,
                en: p.name.en,
            }
        }));
      updatePots(potsWithEnglishNames);
      router.push('/dashboard');
    }
  };

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md rounded-[2.5rem] border-white/10 glass-effect">
        {step === 1 && (
          <>
            <CardHeader className="text-center pt-10">
              <div className="mb-6 flex justify-center">
                <div className="p-6 rounded-[2rem] bg-primary/10 animate-pulse">
                  <Logo className="h-16 w-16 text-primary" />
                </div>
              </div>
              <CardTitle className="font-black text-3xl tracking-tighter">أهلاً بك في الموازين</CardTitle>
              <CardDescription className="text-lg font-medium mt-4 leading-relaxed">
                غيّر علاقتك بالمال إلى الأبد. نحن هنا لنبني لك نظاماً مالياً ذكياً، مع مرشد ذكي يدعمك في كل خطوة.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pb-10 pt-6">
              <Button onClick={handleNext} className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl active:scale-95 transition-all">ابدأ الآن</Button>
            </CardFooter>
          </>
        )}
        {step === 2 && (
          <>
            <CardHeader className="text-center pt-10">
              <CardTitle className="font-black text-3xl tracking-tighter">نظام ذكي.. وليس مجرد أرقام</CardTitle>
              <CardDescription className="text-lg font-medium mt-4">
                سيتم تقسيم دخلك على 6 أوعية ذكية، بالإضافة إلى وصول كامل ومجاني إلى "مرشد الموازين" للمساعدة في فهم وتحسين عاداتك المالية.
              </CardDescription>
            </CardHeader>
             <CardContent className="grid grid-cols-3 gap-6 text-center py-6">
                {DEFAULT_POTS.map(pot => {
                    const Icon = potIcons[pot.id as keyof typeof potIcons] || potIcons.custom;
                    return (
                        <div key={pot.id} className="flex flex-col items-center gap-2 group">
                            <div className="rounded-[1.2rem] bg-secondary/50 p-4 transition-all group-hover:bg-primary/20 group-hover:scale-110">
                                <Icon className="h-7 w-7" style={{color: pot.color}}/>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider">{pot.name.ar}</p>
                        </div>
                    )
                })}
            </CardContent>
            <CardFooter className="pb-10 pt-6">
              <Button onClick={handleNext} className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl active:scale-95 transition-all">التالي</Button>
            </CardFooter>
          </>
        )}
        {step === 3 && (
          <>
            <CardHeader className="text-center pt-10">
              <CardTitle className="font-black text-3xl tracking-tighter">على وشك الانتهاء!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 py-6 px-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="font-black text-sm mr-1">بماذا نناديك؟</Label>
                <Input 
                  id="name" 
                  placeholder="أدخل اسمك هنا" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="h-14 rounded-2xl bg-secondary/50 border-white/5 font-bold text-lg px-6"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-black text-sm mr-1">عملتك الأساسية</Label>
                 <Select value={currency} onValueChange={setCurrency} dir="rtl">
                    <SelectTrigger className="h-14 rounded-2xl bg-secondary/50 border-white/5 font-bold text-lg px-6">
                        <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl glass-effect border-white/10">
                        {CURRENCIES.map(c => (
                            <SelectItem key={c.value} value={c.value} className="font-bold py-3 px-6">{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mr-1 font-medium">اختر العملة التي تستخدمها يوميًا.</p>
              </div>
            </CardContent>
            <CardFooter className="pb-10 pt-6">
              <Button onClick={handleFinish} disabled={!name.trim()} className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl active:scale-95 transition-all">احفظ وانطلق!</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
