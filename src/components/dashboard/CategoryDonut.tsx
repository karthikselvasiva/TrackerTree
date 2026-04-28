'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '@/components/ui/Card';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { formatCurrency } from '@/lib/utils';
import type { CategoryBreakdownItem } from '@/types';

interface CategoryDonutProps {
  data: CategoryBreakdownItem[];
  loading: boolean;
}

export default function CategoryDonut({ data, loading }: CategoryDonutProps) {
  if (loading) {
    return <Card className="animate-shimmer h-80" />;
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="animate-fade-in">
      <h3 className="text-base font-bold text-[var(--text-primary)] px-5 pt-5 pb-2">
        Category Breakdown
      </h3>
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No expense data yet
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-4 px-5 pb-5">
          <div className="w-44 h-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2 w-full">
            {data.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color + '20' }}>
                  <DynamicIcon name={item.icon} size={14} style={{ color: item.color }} />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] flex-1 truncate">{item.name}</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
