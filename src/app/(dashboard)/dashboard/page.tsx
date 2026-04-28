'use client';

import { useState, useMemo } from 'react';
import { Plus, Minus } from 'lucide-react';
import SummaryCards from '@/components/dashboard/SummaryCards';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import CategoryDonut from '@/components/dashboard/CategoryDonut';
import AIInsightsCard from '@/components/dashboard/AIInsightsCard';
import TransactionForm from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { generateMonthlySummary, generateInsights } from '@/lib/ai';
import type { CategoryBreakdownItem } from '@/types';

export default function DashboardPage() {
  const { transactions, loading: txnLoading, addTransaction } = useTransactions();
  const { categories, loading: catLoading } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [initialType, setInitialType] = useState<'income' | 'expense'>('expense');
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const loading = txnLoading || catLoading;

  // Calculations
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions]);

  const now = new Date();
  const monthlyExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((s, t) => s + t.amount, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  const monthlySummary = useMemo(() => generateMonthlySummary(transactions), [transactions]);

  const categoryBreakdown: CategoryBreakdownItem[] = useMemo(() => {
    const map: Record<string, { value: number; color: string; icon: string }> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = categories.find(c => c.id === t.category_id);
      if (cat) {
        if (!map[cat.name]) map[cat.name] = { value: 0, color: cat.color, icon: cat.icon };
        map[cat.name].value += t.amount;
      }
    });
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const refreshInsights = () => {
    setInsightsLoading(true);
    setTimeout(() => {
      const result = generateInsights(transactions, categories);
      setInsights(result);
      setInsightsLoading(false);
    }, 500);
  };

  // Auto-generate insights on first load
  useMemo(() => {
    if (!loading && transactions.length > 0 && insights.length === 0) {
      const result = generateInsights(transactions, categories);
      setInsights(result);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleSubmit = async (data: Parameters<typeof addTransaction>[0]) => {
    return await addTransaction(data);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">Your financial overview</p>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        monthlyExpense={monthlyExpense}
        loading={loading}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={monthlySummary} loading={loading} />
        <CategoryDonut data={categoryBreakdown} loading={loading} />
      </div>

      {/* AI Insights + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsightsCard insights={insights} loading={insightsLoading} onRefresh={refreshInsights} />
        <RecentTransactions transactions={transactions} categories={categories} loading={loading} />
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none px-4">
        <div className="flex gap-3 w-full max-w-md pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full p-2 bg-[var(--bg-secondary)]/80 border border-[var(--border)] backdrop-blur-2xl">
          <button
            onClick={() => { setInitialType('expense'); setShowForm(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[var(--danger)] text-white font-semibold text-sm hover:bg-red-600 transition-all active:scale-95 cursor-pointer"
          >
            <Minus size={18} /> Cash Out
          </button>
          <button
            onClick={() => { setInitialType('income'); setShowForm(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[var(--success)] text-white font-semibold text-sm hover:bg-emerald-600 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> Cash In
          </button>
        </div>
      </div>

      {/* Transaction Form */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        categories={categories}
        initialType={initialType}
      />
    </div>
  );
}
