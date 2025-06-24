import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
    <svg
      width="1024"
      height="1024"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
        <path
            d="M5 15C5 11.134 8.13401 8 12 8C15.866 8 19 11.134 19 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 8V4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="12" cy="2.5" r="1.5" fill="currentColor" />
        <line x1="5" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);
