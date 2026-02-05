'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { cn } from '@/lib/utils';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, theme, toggleTheme, language } = useApp();

  const getTitle = () => {
    if (language.key === 'en') {
      if (pathname === '/dashboard') return `Hello, ${user?.name || ''}!`;
      if (pathname === '/manage-pots') return 'Manage Pots';
      if (pathname === '/settings') return 'Settings';
      if (pathname === '/support') return 'Support';
      if (pathname === '/transactions') return 'History';
      if (pathname.startsWith('/pots/')) return 'Pot Detail';
      return 'Mawazin';
    }
    if (pathname === '/dashboard') return `مرحباً، ${user?.name || ''}!`;
    if (pathname === '/manage-pots') return 'إدارة الموازين';
    if (pathname === '/settings') return 'الإعدادات';
    if (pathname === '/support') return 'الدعم';
    if (pathname === '/transactions') return 'السجلات';
    if (pathname.startsWith('/pots/')) return 'التفاصيل';
    return 'الموازين';
  };

  const isDashboard = pathname === '/dashboard';
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground overflow-x-hidden">
      <header className="sticky top-0 z-20 border-b bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-screen-md items-center justify-between px-5 md:px-6">
          <div className="flex items-center gap-3">
            {!isDashboard ? (
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-xl hover:bg-secondary">
                {language.dir === 'rtl' ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                <span className="sr-only">{language.key === 'ar' ? 'العودة' : 'Back'}</span>
              </Button>
            ) : null}
            <h1 className="font-headline text-lg md:text-xl font-black tracking-tight truncate max-w-[180px] md:max-w-none">
              {getTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            {isDashboard && (
              <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl">
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{language.key === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="w-full flex-1">
        <div className="mx-auto max-w-screen-md p-5 md:p-6">
            {children}
        </div>
      </main>
    </div>
  );
}
