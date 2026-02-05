'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { CURRENCIES, LanguageKey } from '@/lib/constants';
import { ChevronLeft, Palette, SlidersHorizontal, LogOut, Info, Loader2, Globe, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage({ searchParams }: { searchParams: Promise<any> }) {
  const router = useRouter();
  const { user, setUser, language, setLanguage, logout } = useApp();
  const [mounted, setMounted] = useState(false);
  
  // Next.js 15: Unwrap searchParams
  const _resolvedSearchParams = use(searchParams);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/onboarding');
  };

  const handleCurrencyChange = (newCurrency: string) => {
    if (user) setUser({ ...user, currency: newCurrency });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as LanguageKey);
  };

  if (!mounted || !user) {
    return (
      <div className="flex h-[70vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const t = language.key === 'ar' ? {
    customization: 'التخصيص والعرض',
    currency: 'العملة الأساسية',
    language: 'لغة التطبيق',
    management: 'إدارة الأموال',
    managePots: 'تعديل الموازين والنسب',
    support: 'الدعم والمعلومات',
    help: 'مركز المساعدة',
    account: 'الحساب',
    logout: 'تسجيل الخروج',
  } : {
    customization: 'Customization',
    currency: 'Currency',
    language: 'Language',
    management: 'Management',
    managePots: 'Manage Pots',
    support: 'Support',
    help: 'Help Center',
    account: 'Account',
    logout: 'Logout',
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      <Card className="glass-effect rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-black">
            <Palette className="h-5 w-5 text-primary" />
            {t.customization}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="font-black text-xs px-1">{t.currency}</Label>
            <Select dir={language.dir} value={user.currency || 'YER'} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="rounded-[1.5rem] h-14 bg-secondary/40 border-none font-black text-lg px-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl glass-effect">
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value} className="font-bold py-3">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="font-black text-xs px-1">{t.language}</Label>
            <Select dir={language.dir} value={language.key} onValueChange={handleLanguageChange}>
              <SelectTrigger className="rounded-[1.5rem] h-14 bg-secondary/40 border-none font-black text-lg px-6">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl glass-effect">
                <SelectItem value="ar" className="font-bold py-3">العربية</SelectItem>
                <SelectItem value="en" className="font-bold py-3">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden">
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-black">
                <SlidersHorizontal className="h-5 w-5 text-green-500" />
                {t.management}
            </CardTitle>
        </CardHeader>
        <CardContent>
             <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl font-black px-6" onClick={() => router.push('/manage-pots')}>
                <span className="text-lg">{t.managePots}</span>
                <ChevronLeft className={cn("h-6 w-6", language.dir === 'ltr' && "rotate-180")} />
            </Button>
        </CardContent>
      </Card>

      <Card className="glass-effect rounded-[2.5rem] border-destructive/20 bg-destructive/5 shadow-2xl overflow-hidden">
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-black text-destructive">
                <LogOut className="h-5 w-5" />
                {t.account}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" className="w-full h-14 rounded-[1.5rem] font-black text-lg" onClick={handleLogout}>
              {t.logout}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
