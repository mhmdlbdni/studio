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
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 md:h-20 max-w-screen-md items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3 md:gap-4">
            {!isDashboard ? (
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 md:h-12 md:w-12 rounded-[1rem] md:rounded-2xl hover:bg-secondary active:scale-90 transition-all">
                {language.dir === 'rtl' ? <ArrowRight className="h-5 w-5 md:h-6 md:w-6" /> : <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />}
                <span className="sr-only">{language.key === 'ar' ? 'العودة' : 'Back'}</span>
              </Button>
            ) : null}
            <h1 className="font-headline text-lg md:text-2xl font-black tracking-tight truncate max-w-[160px] xs:max-w-[220px] md:max-w-none">
              {getTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            {isDashboard && (
              <Button variant="ghost" size="icon" asChild className="h-10 w-10 md:h-12 md:w-12 rounded-[1rem] md:rounded-2xl active:scale-90 transition-all">
                <Link href="/settings">
                  <Settings className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="sr-only">{language.key === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="w-full flex-1">
        <div className="mx-auto max-w-screen-md p-4 md:p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
