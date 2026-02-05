
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { CURRENCIES, LanguageKey } from '@/lib/constants';
import { ChevronLeft, Palette, SlidersHorizontal, LogOut, Info, Loader2, Globe, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, language, setLanguage, logout } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/onboarding');
  };

  const handleCurrencyChange = (newCurrency: string) => {
    if (user) {
      setUser({ ...user, currency: newCurrency });
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as LanguageKey);
  };

  if (!mounted || !user) {
    return (
      <div className="flex h-[70vh] items-center justify-center flex-col gap-4">
        <div className="p-4 rounded-3xl bg-primary/10 animate-pulse">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground font-black animate-pulse">
            {language?.key === 'ar' ? 'جاري تحميل الإعدادات...' : 'Loading settings...'}
        </p>
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
    logout: 'تسجيل الخروج من النظام',
    selectCurrency: 'اختر العملة',
    selectLanguage: 'اختر اللغة'
  } : {
    customization: 'Customization & Display',
    currency: 'Primary Currency',
    language: 'App Language',
    management: 'Financial Management',
    managePots: 'Manage Pots & Ratios',
    support: 'Support & Information',
    help: 'Help Center',
    account: 'Account',
    logout: 'Logout from System',
    selectCurrency: 'Select Currency',
    selectLanguage: 'Select Language'
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Customization Card */}
      <Card className="glass-effect rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-xl font-black">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary">
                <Palette className="h-5 w-5" />
            </div>
            {t.customization}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label className="font-black text-sm flex items-center gap-2 px-1">
                <Coins className="h-4 w-4 text-muted-foreground" />
                {t.currency}
            </Label>
            <Select 
              dir={language.dir}
              value={user.currency || 'YER'} 
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="rounded-[1.5rem] h-14 bg-secondary/40 border-white/5 font-black text-lg px-6 focus:ring-primary/40">
                <SelectValue placeholder={t.selectCurrency} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl glass-effect border-white/10 shadow-2xl">
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value} className="font-bold py-3 px-4 focus:bg-primary/20">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="font-black text-sm flex items-center gap-2 px-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {t.language}
            </Label>
            <Select 
              dir={language.dir}
              value={language.key} 
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="rounded-[1.5rem] h-14 bg-secondary/40 border-white/5 font-black text-lg px-6 focus:ring-primary/40">
                <SelectValue placeholder={t.selectLanguage} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl glass-effect border-white/10 shadow-2xl">
                <SelectItem value="ar" className="font-bold py-3 px-4 focus:bg-primary/20">العربية</SelectItem>
                <SelectItem value="en" className="font-bold py-3 px-4 focus:bg-primary/20">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Management Card */}
      <Card className="glass-effect rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <div className="p-2.5 rounded-2xl bg-green-500/20 text-green-500">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              {t.management}
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
             <Button 
                variant="ghost" 
                className="w-full justify-between h-16 rounded-2xl hover:bg-white/5 font-black px-6 group transition-all" 
                onClick={() => router.push('/manage-pots')}
              >
                <span className="text-lg">{t.managePots}</span>
                <ChevronLeft className={cn(
                    "h-6 w-6 transition-transform group-hover:-translate-x-1",
                    language.dir === 'ltr' && "rotate-180 group-hover:translate-x-1"
                )} />
            </Button>
        </CardContent>
      </Card>

      {/* Support Card */}
      <Card className="glass-effect rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500">
                <Info className="h-5 w-5" />
              </div>
              {t.support}
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
             <Button 
                variant="ghost" 
                className="w-full justify-between h-16 rounded-2xl hover:bg-white/5 font-black px-6 group transition-all" 
                onClick={() => router.push('/support')}
              >
                <span className="text-lg">{t.help}</span>
                <ChevronLeft className={cn(
                    "h-6 w-6 transition-transform group-hover:-translate-x-1",
                    language.dir === 'ltr' && "rotate-180 group-hover:translate-x-1"
                )} />
            </Button>
        </CardContent>
      </Card>

      {/* Logout Card */}
      <Card className="glass-effect rounded-[2.5rem] border-destructive/20 bg-destructive/5 shadow-2xl overflow-hidden">
        <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3 text-xl font-black text-destructive">
              <div className="p-2.5 rounded-2xl bg-destructive/20">
                <LogOut className="h-5 w-5" />
              </div>
              {t.account}
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-6">
            <Button 
              variant="destructive" 
              className="w-full h-16 rounded-[1.5rem] font-black text-lg shadow-[0_10px_30px_rgba(220,38,38,0.3)] active:scale-95 transition-all hover:bg-destructive/90" 
              onClick={handleLogout}
            >
              {t.logout}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
