'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Info, Phone } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';


const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    <path d="M14.05 14.05a7 7 0 1 0-9.9-9.9"></path>
  </svg>
);


export default function SupportPage() {
    const { language } = useApp();
    const openLink = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageCircle /> {language.key === 'ar' ? 'التواصل المباشر' : 'Direct Contact'}</CardTitle>
                    <CardDescription>{language.key === 'ar' ? 'للدعم الفني أو تقديم الاقتراحات' : 'For technical support or suggestions'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => openLink('https://wa.me/967777798804')}>
                        <WhatsAppIcon className="h-5 w-5 text-green-500" />
                        {language.key === 'ar' ? 'تواصل معنا عبر واتساب' : 'Contact us via WhatsApp'}
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => openLink('tel:+967777798804')}>
                        <Phone className="h-5 w-5" />
                        {language.key === 'ar' ? 'الاتصال المباشر' : 'Direct Call'}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info /> {language.key === 'ar' ? 'معلومات التطبيق' : 'App Information'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{language.key === 'ar' ? 'تطبيق الموازين - الإصدار v4.0' : 'Al-Mawazin App - Version v4.0'}</p>
                    <p className="text-sm text-muted-foreground">{language.key === 'ar' ? 'المطور: محمد عبدالواسع البعداني' : 'Developer: Mohammed Abdulwasea Al-Badani'}</p>
                </CardContent>
            </Card>
        </div>
    );
}
