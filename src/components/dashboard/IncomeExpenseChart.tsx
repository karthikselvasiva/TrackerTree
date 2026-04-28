'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Card from '@/components/ui/Card';
import type { MonthlySummary } from '@/types';

interface IncomeExpenseChartProps {
  data: MonthlySummary[];
  loading: boolean;
}

export default function IncomeExpenseChart({ data, loading }: IncomeExpenseChartProps) {
  if (loading) {
    return <Card className="animate-shimmer h-80" />;
  }

  const chartData = data.slice(-6).map(d => {
    const date = new Date(d.month + '-01');
    return {
      name: date.toLocaleDateString('en-IN', { month: 'short' }),
      Income: d.income,
      Expense: d.expense,
    };
  });

  return (
    <Card className="animate-fade-in">
      <h3 className="text-base font-bold text-[var(--text-primary)] px-5 pt-5 pb-2">
        Income vs Expense
      </h3>
      <div className="h-64 px-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
            No data to display yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  boxShadow: 'var(--shadow-lg)',
                }}
                formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
              />
              <Legend />
              <Area type="monotone" dataKey="Income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
