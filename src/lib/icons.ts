import React from 'react';
import { Home, TrendingUp, PiggyBank, BookOpen, Gamepad2, Gift } from 'lucide-react';

export const potIcons = {
  necessities: Home,
  freedom: TrendingUp,
  saving: PiggyBank,
  education: BookOpen,
  play: Gamepad2,
  giving: Gift,
  custom: (props: React.ComponentProps<'svg'>) => (
    React.createElement(
      'svg',
      {
        ...props,
        xmlns: 'http://www.w3.org/2000/svg',
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      React.createElement('path', { d: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
    )
  ),
};
