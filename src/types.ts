export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  date: string; // ISO string
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
