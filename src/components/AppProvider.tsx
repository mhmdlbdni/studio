
'use client';
import { AppContextProvider } from '@/contexts/AppContext';
import { usePathname } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ReactNode } from 'react';
import { useIsMounted } from '@/hooks/use-is-mounted';

export function AppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMounted = useIsMounted();

  const mainLayoutRoutes = ['/dashboard', '/manage-pots', '/settings', '/support'];
  const isMainLayout = mainLayoutRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/pots/');
  
  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <AppContextProvider>
      {isMainLayout ? <MainLayout>{children}</MainLayout> : children}
    </AppContextProvider>
  );
}
