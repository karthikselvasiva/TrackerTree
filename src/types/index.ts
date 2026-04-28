export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  currency: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_default: boolean;
  created_at: string;
}

export type PaymentMode = 'cash' | 'upi' | 'card' | 'bank_transfer';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export type TransactionTag = 'business' | 'personal';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  category?: Category;
  date: string;
  payment_mode: PaymentMode;
  upi_ref: string | null;
  status: PaymentStatus;
  notes: string;
  tags: TransactionTag | null;
  receipt_url: string | null;
  created_at: string;
}

export interface TransactionFilters {
  search: string;
  type: 'all' | 'income' | 'expense';
  category_id: string;
  payment_mode: string;
  status: string;
  date_from: string;
  date_to: string;
  tag: string;
}

export interface PaymentReminder {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  due_date: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  is_paid: boolean;
  notes: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'reminder' | 'insight' | 'system' | 'import';
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  month: string;
  insights: string[];
  created_at: string;
}

export interface BankImport {
  id: string;
  user_id: string;
  filename: string;
  row_count: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdownItem {
  name: string;
  value: number;
  color: string;
  icon: string;
}

export type UpiProvider = 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other';

export interface UpiAccount {
  id: string;
  user_id: string;
  upi_id: string;
  provider: UpiProvider;
  label: string;
  is_primary: boolean;
  created_at: string;
}

export interface UpiContact {
  id: string;
  user_id: string;
  name: string;
  upi_id: string;
  total_paid: number;
  total_received: number;
  transaction_count: number;
  last_transaction_date: string | null;
  created_at: string;
}
