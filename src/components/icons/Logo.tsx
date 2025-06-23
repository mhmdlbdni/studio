import React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 7.5H20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 7.5L9.5 2.5H14.5L17.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 18C6.65685 18 8 16.6569 8 15C8 13.3431 6.65685 12 5 12C3.34315 12 2 13.3431 2 15C2 16.6569 3.34315 18 5 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 18C20.6569 18 22 16.6569 22 15C22 13.3431 20.6569 12 19 12C17.3431 12 16 13.3431 16 15C16 16.6569 17.3431 18 19 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 12V7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M19 12V7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
