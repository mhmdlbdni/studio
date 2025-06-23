import React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 7v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 21h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M5 7a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M19 7a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);