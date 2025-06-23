'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { CURRENCIES } from '@/lib/constants';
import { ChevronLeft, Languages, Palette, SlidersHorizontal, LogOut, Info } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser } = useApp();

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/onboarding');
  };

  const handleCurrencyChange = (newCurrency: string) => {
    if (user) {
      setUser({ ...user, currency: newCurrency });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette/> التخصيص والعرض</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>العملة</Label>
            <Select value={user?.currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العملة" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>اللغة</Label>
            <Select defaultValue="ar">
              <SelectTrigger>
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en" disabled>English (قريباً)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal /> إدارة الأموال</CardTitle>
        </CardHeader>
        <CardContent>
             <Button variant="ghost" className="w-full justify-between" onClick={() => router.push('/manage-pots')}>
                <span>إدارة الموازين</span>
                <ChevronLeft />
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info /> الدعم والمعلومات</CardTitle>
        </CardHeader>
        <CardContent>
             <Button variant="ghost" className="w-full justify-between" onClick={() => router.push('/support')}>
                <span>الدعم والمساعدة</span>
                <ChevronLeft />
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><LogOut /> الحساب</CardTitle>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>تسجيل الخروج</Button>
        </CardContent>
      </Card>
    </div>
  );
}
