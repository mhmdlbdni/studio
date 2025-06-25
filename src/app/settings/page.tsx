
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { CURRENCIES } from '@/lib/constants';
import { ChevronLeft, Languages, Palette, SlidersHorizontal, LogOut, Info } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette/> {language.key === 'ar' ? 'التخصيص والعرض' : 'Customization & Display'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{language.key === 'ar' ? 'العملة' : 'Currency'}</Label>
            <Select value={user?.currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder={language.key === 'ar' ? "اختر العملة" : "Select Currency"} />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{language.key === 'ar' ? 'اللغة' : 'Language'}</Label>
            <Select value={language.key} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder={language.key === 'ar' ? "اختر اللغة" : "Select Language"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal /> {language.key === 'ar' ? 'إدارة الأموال' : 'Financial Management'}</CardTitle>
        </CardHeader>
        <CardContent>
             <Button variant="ghost" className="w-full justify-between" onClick={() => router.push('/manage-pots')}>
                <span>{language.key === 'ar' ? 'إدارة الموازين' : 'Manage Pots'}</span>
                <ChevronLeft />
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info /> {language.key === 'ar' ? 'الدعم والمعلومات' : 'Support & Information'}</CardTitle>
        </CardHeader>
        <CardContent>
             <Button variant="ghost" className="w-full justify-between" onClick={() => router.push('/support')}>
                <span>{language.key === 'ar' ? 'الدعم والمساعدة' : 'Support & Help'}</span>
                <ChevronLeft />
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><LogOut /> {language.key === 'ar' ? 'الحساب' : 'Account'}</CardTitle>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>{language.key === 'ar' ? 'تسجيل الخروج' : 'Logout'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
