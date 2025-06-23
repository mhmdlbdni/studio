
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  potId?: string;
}

export interface Pot {
  id: string;
  name: string;
  percentage: number;
  color: string;
  icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
}

export interface User {
  name: string;
  currency: string;
}
