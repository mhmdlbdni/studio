
import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppProvider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'الموازين | Executive Vision',
  description: 'نظام حياة مالية ذكي لمستقبل آمن ومزدهر',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
