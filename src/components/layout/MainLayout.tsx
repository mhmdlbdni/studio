
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, ArrowRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ThemeToggle } from '@/components/settings/ThemeToggle';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, theme, toggleTheme } = useApp();

  const getTitle = () => {
    if (pathname === '/dashboard') return `مرحباً، ${user?.name || ''}!`;
    if (pathname === '/manage-pots') return 'إدارة الموازين';
    if (pathname === '/settings') return 'الإعدادات';
    if (pathname === '/support') return 'الدعم';
    if (pathname.startsWith('/pots/')) return 'تفاصيل الوعاء';
    return 'الموازين';
  };

  const isDashboard = pathname === '/dashboard';
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-screen-md items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {!isDashboard ? (
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowRight className="h-5 w-5" />
                <span className="sr-only">العودة</span>
              </Button>
            ) : null}
            <h1 className="font-headline text-xl font-bold">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            {isDashboard && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">الإعدادات</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="w-full flex-1 overflow-y-auto">
        <div className="mx-auto max-w-screen-md p-4 sm:p-6">
            {children}
        </div>
      </main>
    </div>
  );
}
