import React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 12V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
        <path d="M12 12C10.8954 12 10 12.8954 10 14C10 15.1046 10.8954 16 12 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
