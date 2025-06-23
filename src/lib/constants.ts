
import type { Pot } from './types';
import { potIcons } from './icons';

export const DEFAULT_POTS: Omit<Pot, 'balance'>[] = [
  {
    id: 'necessities',
    name: { ar: 'الضروريات', en: 'Necessities' },
    percentage: 55,
    color: '#FF7B00',
    icon: potIcons.necessities,
  },
  {
    id: 'freedom',
    name: { ar: 'الحرية المالية', en: 'Financial Freedom' },
    percentage: 10,
    color: '#28A745',
    icon: potIcons.freedom,
  },
  {
    id: 'saving',
    name: { ar: 'توفير طويل الأجل', en: 'Long-term Savings' },
    percentage: 10,
    color: '#17A2B8',
    icon: potIcons.saving,
  },
  {
    id: 'education',
    name: { ar: 'التعليم', en: 'Education' },
    percentage: 10,
    color: '#6F42C1',
    icon: potIcons.education,
  },
  {
    id: 'play',
    name: { ar: 'المرح والترفيه', en: 'Play & Fun' },
    percentage: 10,
    color: '#FFC107',
    icon: potIcons.play,
  },
  {
    id: 'giving',
    name: { ar: 'العطاء', en: 'Giving' },
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
    { value: 'AED', label: 'درهم إماراتي (AED)' },
    { value: 'EGP', label: 'جنيه مصري (EGP)' },
    { value: 'QAR', label: 'ريال قطري (QAR)' },
    { value: 'KWD', label: 'دينار كويتي (KWD)' },
    { value: 'BHD', label: 'دينار بحريني (BHD)' },
    { value: 'OMR', label: 'ريال عماني (OMR)' },
    { value: 'GBP', label: 'جنيه استرليني (GBP)' },
];
