'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionFiltersBar from '@/components/transactions/TransactionFilters';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import type { Transaction } from '@/types';

export default function TransactionsPage() {
  const {
    transactions, loading: txnLoading, filters, setFilters,
    addTransaction, updateTransaction, deleteTransaction,
  } = useTransactions();
  const { categories, loading: catLoading } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [initialType, setInitialType] = useState<'income' | 'expense'>('expense');

  const loading = txnLoading || catLoading;

  const handleSubmit = async (data: Parameters<typeof addTransaction>[0]): Promise<boolean> => {
    if (editTransaction) {
      return (await updateTransaction(editTransaction.id, data)) ?? false;
    }
    return (await addTransaction(data)) ?? false;
  };

  const handleEdit = (t: Transaction) => {
    setEditTransaction(t);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transactions</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your income & expenses</p>
      </div>

      {/* Filters */}
      <TransactionFiltersBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
      />

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        categories={categories}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Floating Action Bar */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none px-4">
        <div className="flex gap-3 w-full max-w-md pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full p-2 bg-[var(--bg-secondary)]/80 border border-[var(--border)] backdrop-blur-2xl">
          <button
            onClick={() => { setInitialType('expense'); setEditTransaction(null); setShowForm(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[var(--danger)] text-white font-semibold text-sm hover:bg-red-600 transition-all active:scale-95 cursor-pointer"
          >
            <Minus size={18} /> Cash Out
          </button>
          <button
            onClick={() => { setInitialType('income'); setEditTransaction(null); setShowForm(true); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[var(--success)] text-white font-semibold text-sm hover:bg-emerald-600 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={18} /> Cash In
          </button>
        </div>
      </div>

      {/* Form */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTransaction(null); }}
        onSubmit={handleSubmit}
        categories={categories}
        editTransaction={editTransaction}
        initialType={editTransaction ? undefined : initialType}
      />
    </div>
  );
}
