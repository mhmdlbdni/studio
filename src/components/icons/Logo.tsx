import React from 'react';
import Image from 'next/image';

export const Logo = ({ className }: { className?: string }) => (
    <Image
        src="/logo.png"
        alt="Executive Vision Logo"
        width={1024}
        height={1024}
        className={className}
        priority
    />
);
