'use client';

import { TrendingUp, TrendingDown, Wallet, CalendarDays } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  monthlyExpense: number;
  loading: boolean;
}

export default function SummaryCards({ totalIncome, totalExpense, monthlyExpense, loading }: SummaryCardsProps) {
  const balance = totalIncome - totalExpense;

  const cards = [
    {
      title: 'Total Income',
      value: totalIncome,
      icon: TrendingUp,
      color: 'var(--success)',
      bgColor: 'var(--success-light)',
    },
    {
      title: 'Total Expenses',
      value: totalExpense,
      icon: TrendingDown,
      color: 'var(--danger)',
      bgColor: 'var(--danger-light)',
    },
    {
      title: 'Net Balance',
      value: balance,
      icon: Wallet,
      color: balance >= 0 ? 'var(--success)' : 'var(--danger)',
      bgColor: balance >= 0 ? 'var(--success-light)' : 'var(--danger-light)',
    },
    {
      title: 'This Month',
      value: monthlyExpense,
      icon: CalendarDays,
      color: 'var(--accent)',
      bgColor: 'var(--accent-light)',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-shimmer h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: card.bgColor }}
            >
              <card.icon size={20} style={{ color: card.color }} />
            </div>
          </div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {card.title}
          </p>
          <p
            className="text-2xl font-extrabold mt-1 tracking-tight"
            style={{ color: card.color }}
          >
            {formatCurrency(card.value)}
          </p>
        </Card>
      ))}
    </div>
  );
}
