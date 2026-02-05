'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { CURRENCIES } from '@/lib/constants';
import { ChevronLeft, Palette, SlidersHorizontal, LogOut, Info, Loader2 } from 'lucide-react';

type Language = 'ar' | 'en';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, language, setLanguage, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/onboarding');
  };

  const handleCurrencyChange = (newCurrency: string) => {
    if (user) {
      setUser({ ...user, currency: newCurrency });
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect rounded-[2rem] border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-black">
            <Palette className="text-primary" /> 
            {language.key === 'ar' ? 'التخصيص والعرض' : 'Customization & Display'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="font-black text-sm">{language.key === 'ar' ? 'العملة' : 'Currency'}</Label>
            <Select 
              dir={language.dir}
              value={user.currency || 'YER'} 
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="rounded-2xl h-12 bg-secondary/50 border-white/5 font-bold">
                <SelectValue placeholder={language.key === 'ar' ? "اختر العملة" : "Select Currency"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl glass-effect border-white/10">
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value} className="font-bold py-3">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="font-black text-sm">{language.key === 'ar' ? 'اللغة' : 'Language'}</Label>
            <Select 
              dir={language.dir}
              value={language.key} 
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="rounded-2xl h-12 bg-secondary/50 border-white/5 font-bold">
                <SelectValue placeholder={language.key === 'ar' ? "اختر اللغة" : "Select Language"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl glass-effect border-white/10">
                <SelectItem value="ar" className="font-bold py-3">العربية</SelectItem>
                <SelectItem value="en" className="font-bold py-3">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect rounded-[2rem] border-white/10">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <SlidersHorizontal className="text-primary" /> 
              {language.key === 'ar' ? 'إدارة الأموال' : 'Financial Management'}
            </CardTitle>
        </CardHeader>
        <CardContent>
             <Button 
                variant="ghost" 
                className="w-full justify-between h-14 rounded-2xl hover:bg-white/5 font-bold px-4" 
                onClick={() => router.push('/manage-pots')}
              >
                <span>{language.key === 'ar' ? 'إدارة الموازين' : 'Manage Pots'}</span>
                {language.dir === 'rtl' ? <ChevronLeft className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5 rotate-180" />}
            </Button>
        </CardContent>
      </Card>

      <Card className="glass-effect rounded-[2rem] border-white/10">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <Info className="text-primary" /> 
              {language.key === 'ar' ? 'الدعم والمعلومات' : 'Support & Information'}
            </CardTitle>
        </CardHeader>
        <CardContent>
             <Button 
                variant="ghost" 
                className="w-full justify-between h-14 rounded-2xl hover:bg-white/5 font-bold px-4" 
                onClick={() => router.push('/support')}
              >
                <span>{language.key === 'ar' ? 'الدعم والمساعدة' : 'Support & Help'}</span>
                {language.dir === 'rtl' ? <ChevronLeft className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5 rotate-180" />}
            </Button>
        </CardContent>
      </Card>

      <Card className="glass-effect rounded-[2rem] border-destructive/20 bg-destructive/5">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-black text-destructive">
              <LogOut /> 
              {language.key === 'ar' ? 'الحساب' : 'Account'}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Button 
              variant="destructive" 
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all" 
              onClick={handleLogout}
            >
              {language.key === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}