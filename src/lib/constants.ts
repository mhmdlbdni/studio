
import type { Pot } from './types';

export const DEFAULT_POTS: Omit<Pot, 'icon' | 'balance'>[] = [
  {
    id: 'necessities',
    name: { ar: 'الضروريات', en: 'Necessities' },
    percentage: 55,
    color: '#FF7B00',
    iconKey: 'necessities',
  },
  {
    id: 'freedom',
    name: { ar: 'الحرية المالية', en: 'Financial Freedom' },
    percentage: 10,
    color: '#28A745',
    iconKey: 'freedom',
  },
  {
    id: 'saving',
    name: { ar: 'توفير طويل الأجل', en: 'Long-term Savings' },
    percentage: 10,
    color: '#17A2B8',
    iconKey: 'saving',
  },
  {
    id: 'education',
    name: { ar: 'التعليم', en: 'Education' },
    percentage: 10,
    color: '#6F42C1',
    iconKey: 'education',
  },
  {
    id: 'play',
    name: { ar: 'المرح والترفيه', en: 'Play & Fun' },
    percentage: 10,
    color: '#FFC107',
    iconKey: 'play',
  },
  {
    id: 'giving',
    name: { ar: 'العطاء', en: 'Giving' },
    percentage: 5,
    color: '#E83E8C',
    iconKey: 'giving',
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

export type LanguageKey = 'ar' | 'en';

const arTranslations = {
    dashboard: {
        netBalance: 'صافي الرصيد',
        financialPots: 'الموازين المالية',
        guide: 'مرشد الموازين',
        addTransaction: 'أضف معاملة',
        addIncome: 'إضافة دخل',
        addExpense: 'إضافة مصروف',
    },
    addTransactionDialog: {
        income: {
            title: 'إضافة دخل جديد',
            description: 'أدخل تفاصيل دخلك الجديد هنا. سيتم توزيعه تلقائياً على الموازين.',
            sourceLabel: 'مصدر الدخل',
            sourcePlaceholder: 'مثال: الراتب الشهري',
            amountLabel: 'المبلغ',
            submitButton: 'توزيع الدخل',
        },
        expense: {
            title: 'إضافة مصروف جديد',
            description: 'سجّل مصاريفك واختر من أي وعاء تريد الخصم.',
            descLabel: 'وصف المصروف',
            descPlaceholder: 'مثال: فاتورة الكهرباء',
            amountLabel: 'المبلغ',
            potLabel: 'اختر الوعاء',
            potPlaceholder: 'اختر من أي وعاء تريد الخصم',
            submitButton: 'إضافة المصروف',
        },
        cancel: 'إلغاء',
    },
    validation: {
        descTooShort: 'الوصف قصير جداً.',
        amountPositive: 'يجب أن يكون المبلغ أكبر من صفر.',
        potRequired: 'يرجى اختيار وعاء للمصروف.',
    },
    toast: {
        added: 'تمت الإضافة',
        incomeSuccess: 'تمت إضافة الدخل وتوزيعه بنجاح!',
        expenseSuccess: 'تم تسجيل المصروف بنجاح!',
    }
};

const enTranslations: typeof arTranslations = {
    dashboard: {
        netBalance: 'Net Balance',
        financialPots: 'Financial Pots',
        guide: 'Al-Mawazin Guide',
        addTransaction: 'Add Transaction',
        addIncome: 'Add Income',
        addExpense: 'Add Expense',
    },
    addTransactionDialog: {
        income: {
            title: 'Add New Income',
            description: 'Enter your new income details here. It will be automatically distributed to the pots.',
            sourceLabel: 'Income Source',
            sourcePlaceholder: 'e.g., Monthly Salary',
            amountLabel: 'Amount',
            submitButton: 'Distribute Income',
        },
        expense: {
            title: 'Add New Expense',
            description: 'Record your expenses and choose which pot to deduct from.',
            descLabel: 'Expense Description',
            descPlaceholder: 'e.g., Electricity Bill',
            amountLabel: 'Amount',
            potLabel: 'Choose Pot',
            potPlaceholder: 'Select which pot to deduct from',
            submitButton: 'Add Expense',
        },
        cancel: 'Cancel',
    },
    validation: {
        descTooShort: 'Description is too short.',
        amountPositive: 'Amount must be greater than zero.',
        potRequired: 'Please select a pot for the expense.',
    },
    toast: {
        added: 'Added',
        incomeSuccess: 'Income added and distributed successfully!',
        expenseSuccess: 'Expense recorded successfully!',
    }
};

export interface AppLanguage {
    key: LanguageKey;
    dir: 'rtl' | 'ltr';
    code: string;
    translations: typeof arTranslations;
}

const languagePacks: Record<LanguageKey, AppLanguage> = {
    ar: {
        key: 'ar',
        dir: 'rtl',
        code: 'ar-SA',
        translations: arTranslations,
    },
    en: {
        key: 'en',
        dir: 'ltr',
        code: 'en-US',
        translations: enTranslations,
    },
};

export const getLanguagePack = (key: LanguageKey): AppLanguage => {
    return languagePacks[key];
};
