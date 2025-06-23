
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, LayoutDashboard, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useApp();

  const getTitle = () => {
    if (pathname === '/dashboard') return `مرحباً، ${user?.name || ''}!`;
    if (pathname === '/manage-pots') return 'إدارة الموازين';
    if (pathname === '/settings') return 'الإعدادات';
    if (pathname === '/support') return 'الدعم';
    if (pathname.startsWith('/pots/')) return 'تفاصيل الوعاء';
    return 'الموازين';
  };
  
  const navItems = [
    { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { href: '/manage-pots', label: 'الموازين', icon: SlidersHorizontal },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-screen-md items-center justify-between px-4 sm:px-6">
          <h1 className="font-headline text-xl font-bold">{getTitle()}</h1>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">الإعدادات</span>
            </Link>
          </Button>
        </div>
      </header>
      <main className="w-full flex-1 overflow-y-auto">
        <div className="mx-auto max-w-screen-md p-4 pb-24 sm:p-6">
            {children}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto grid h-16 max-w-md grid-cols-2 items-center gap-4 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}
