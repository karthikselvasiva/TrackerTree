'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import type { Transaction, Category } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
}

export default function RecentTransactions({ transactions, categories, loading }: RecentTransactionsProps) {
  if (loading) {
    return (
      <Card className="animate-shimmer h-80" />
    );
  }

  return (
    <Card className="animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-base font-bold text-[var(--text-primary)]">Recent Transactions</h3>
        <Link
          href="/transactions"
          className="text-sm text-[var(--accent)] font-medium flex items-center gap-1 hover:gap-2 transition-all"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-muted)] text-sm">
          No transactions yet. Start adding!
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {transactions.slice(0, 6).map((t, i) => {
            const cat = categories.find(c => c.id === t.category_id);
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-tertiary)]/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: (cat?.color || '#64748b') + '20' }}
                >
                  <DynamicIcon name={cat?.icon || 'Circle'} size={18} style={{ color: cat?.color || '#64748b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {cat?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {t.notes || formatDateShort(t.date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold flex items-center gap-1 ${t.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {formatCurrency(t.amount)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDateShort(t.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
