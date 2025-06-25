import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
    <svg
      width="1024"
      height="1024"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);
