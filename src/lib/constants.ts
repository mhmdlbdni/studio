
import type { Pot } from './types';
import { potIcons } from './icons';

export const DEFAULT_POTS: Omit<Pot, 'balance'>[] = [
  {
    id: 'necessities',
    name: 'الضروريات',
    percentage: 55,
    color: '#FF7B00',
    icon: potIcons.necessities,
  },
  {
    id: 'freedom',
    name: 'الحرية المالية',
    percentage: 10,
    color: '#28A745',
    icon: potIcons.freedom,
  },
  {
    id: 'saving',
    name: 'توفير طويل الأجل',
    percentage: 10,
    color: '#17A2B8',
    icon: potIcons.saving,
  },
  {
    id: 'education',
    name: 'التعليم',
    percentage: 10,
    color: '#6F42C1',
    icon: potIcons.education,
  },
  {
    id: 'play',
    name: 'المرح والترفيه',
    percentage: 10,
    color: '#FFC107',
    icon: potIcons.play,
  },
  {
    id: 'giving',
    name: 'العطاء',
    percentage: 5,
    color: '#E83E8C',
    icon: potIcons.giving,
  },
];

export const CURRENCIES = [
    { value: 'YER', label: 'ريال يمني (YER)' },
    { value: 'SAR', label: 'ريال سعودي (SAR)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
];
