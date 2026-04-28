'use client';

import { ArrowUpRight, ArrowDownRight, Pencil, Trash2 } from 'lucide-react';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Transaction, Category } from '@/types';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, categories, loading, onEdit, onDelete }: TransactionListProps) {
  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-shimmer border-b border-[var(--border)] last:border-0" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card text-center py-16">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-[var(--text-muted)] text-sm">No transactions found</p>
        <p className="text-[var(--text-muted)] text-xs mt-1">Start by adding your first transaction</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header — Desktop */}
      <div className="hidden sm:grid grid-cols-[1fr_100px_100px_80px_90px_60px] gap-4 px-5 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
        <span>Transaction</span>
        <span>Amount</span>
        <span>Date</span>
        <span>Mode</span>
        <span>Status</span>
        <span></span>
      </div>

      {/* Rows */}
      {transactions.map((t, index) => {
        const cat = categories.find(c => c.id === t.category_id);
        return (
          <div
            key={t.id}
            className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_80px_90px_60px] gap-2 sm:gap-4 items-center px-5 py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]/50 transition-colors group animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Transaction Info */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: (cat?.color || '#64748b') + '20' }}
              >
                <DynamicIcon name={cat?.icon || 'Circle'} size={18} style={{ color: cat?.color || '#64748b' }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{cat?.name || 'Unknown'}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{t.notes || '—'}</p>
              </div>
            </div>

            {/* Amount */}
            <div className={cn('text-sm font-bold flex items-center gap-1', t.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--danger)]')}>
              {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatCurrency(t.amount)}
            </div>

            {/* Date */}
            <span className="text-xs text-[var(--text-secondary)]">{formatDate(t.date)}</span>

            {/* Payment Mode */}
            <span className="text-xs text-[var(--text-muted)] capitalize">{t.payment_mode.replace('_', ' ')}</span>

            {/* Status */}
            <span className={cn(
              'badge text-xs',
              t.status === 'paid' && 'badge-success',
              t.status === 'pending' && 'badge-warning',
              t.status === 'failed' && 'badge-danger',
            )}>
              {t.status}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(t)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="p-1.5 rounded-lg hover:bg-[var(--danger-light)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
