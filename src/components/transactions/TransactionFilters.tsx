'use client';

import { Search, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { TransactionFilters } from '@/types';
import type { Category } from '@/types';
import { PAYMENT_MODES } from '@/lib/constants';

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  categories: Category[];
}

export default function TransactionFiltersBar({ filters, onChange, categories }: TransactionFiltersBarProps) {
  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.category_id || filters.payment_mode || filters.date_from || filters.date_to || filters.tag;

  const clearFilters = () => {
    onChange({
      search: '',
      type: 'all',
      category_id: '',
      payment_mode: '',
      status: '',
      date_from: '',
      date_to: '',
      tag: '',
    });
  };

  return (
    <div className="glass-card p-4 space-y-3">
      {/* Search */}
      <Input
        placeholder="Search transactions..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        icon={<Search size={16} />}
      />

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2">
        {/* Type */}
        <select
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value as 'all' | 'income' | 'expense' })}
          className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Category */}
        <select
          value={filters.category_id}
          onChange={(e) => onChange({ ...filters, category_id: e.target.value })}
          className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Payment Mode */}
        <select
          value={filters.payment_mode}
          onChange={(e) => onChange({ ...filters, payment_mode: e.target.value })}
          className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">All Modes</option>
          {PAYMENT_MODES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        {/* Date Range */}
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => onChange({ ...filters, date_from: e.target.value })}
          className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder="From"
        />
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => onChange({ ...filters, date_to: e.target.value })}
          className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          placeholder="To"
        />

        {/* Tag */}
        <select
          value={filters.tag}
          onChange={(e) => onChange({ ...filters, tag: e.target.value })}
          className="px-3 py-2 rounded-xl text-xs bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <option value="">All Tags</option>
          <option value="personal">Personal</option>
          <option value="business">Business</option>
        </select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
