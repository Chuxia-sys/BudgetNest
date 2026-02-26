export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: number;
}

export interface UserSettings {
  spendingLimit: number;
  notificationsEnabled: boolean;
  currency: string;
  profilePicture?: string;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalSpent: number;
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  highestCategory: { category: string; amount: number };
  totalEntries: number;
  dailyExpenses: { date: string; amount: number }[];
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
