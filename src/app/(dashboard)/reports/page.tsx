'use client';

import { useState, useMemo } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { generateMonthlySummary } from '@/lib/ai';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const { transactions, loading: tL } = useTransactions();
  const { categories, loading: cL } = useCategories();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const loading = tL || cL;

  const filtered = useMemo(() => {
    let t = transactions;
    if (dateFrom) t = t.filter(x => x.date >= dateFrom);
    if (dateTo) t = t.filter(x => x.date <= dateTo);
    return t;
  }, [transactions, dateFrom, dateTo]);

  const monthly = useMemo(() => generateMonthlySummary(filtered), [filtered]);
  const totalInc = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExp = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const catBreakdown = useMemo(() => {
    const m: Record<string, { value: number; color: string }> = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      const c = categories.find(x => x.id === t.category_id);
      if (c) { if (!m[c.name]) m[c.name] = { value: 0, color: c.color }; m[c.name].value += t.amount; }
    });
    return Object.entries(m).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.value - a.value);
  }, [filtered, categories]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1><p className="text-sm text-[var(--text-muted)]">Financial analytics & export</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportToCSV(filtered, categories)}><Download size={16}/> CSV</Button>
          <Button variant="secondary" size="sm" onClick={() => exportToExcel(filtered, categories)}><FileSpreadsheet size={16}/> Excel</Button>
        </div>
      </div>

      {/* Date Filters */}
      <Card className="flex flex-wrap gap-3 items-end">
        <div><label className="block text-xs font-medium text-[var(--text-muted)] mb-1">From</label><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="px-3 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"/></div>
        <div><label className="block text-xs font-medium text-[var(--text-muted)] mb-1">To</label><input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="px-3 py-2 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]"/></div>
        {(dateFrom||dateTo)&&<Button variant="ghost" size="sm" onClick={()=>{setDateFrom('');setDateTo('');}}>Clear</Button>}
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card><p className="text-xs text-[var(--text-muted)]">Total Income</p><p className="text-xl font-bold text-[var(--success)]">{formatCurrency(totalInc)}</p></Card>
        <Card><p className="text-xs text-[var(--text-muted)]">Total Expenses</p><p className="text-xl font-bold text-[var(--danger)]">{formatCurrency(totalExp)}</p></Card>
        <Card><p className="text-xs text-[var(--text-muted)]">Net Balance</p><p className={`text-xl font-bold ${totalInc-totalExp>=0?'text-[var(--success)]':'text-[var(--danger)]'}`}>{formatCurrency(totalInc-totalExp)}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Table */}
        <Card>
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Monthly Summary</h3>
          {loading ? <div className="h-40 animate-shimmer rounded-xl"/> : monthly.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No data</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--border)]"><th className="text-left py-2 text-xs text-[var(--text-muted)]">Month</th><th className="text-right py-2 text-xs text-[var(--text-muted)]">Income</th><th className="text-right py-2 text-xs text-[var(--text-muted)]">Expense</th><th className="text-right py-2 text-xs text-[var(--text-muted)]">Balance</th></tr></thead>
                <tbody>{monthly.map(m=>{const d=new Date(m.month+'-01');return(<tr key={m.month} className="border-b border-[var(--border)] last:border-0"><td className="py-2.5 font-medium">{d.toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</td><td className="py-2.5 text-right text-[var(--success)]">{formatCurrency(m.income)}</td><td className="py-2.5 text-right text-[var(--danger)]">{formatCurrency(m.expense)}</td><td className={`py-2.5 text-right font-bold ${m.balance>=0?'text-[var(--success)]':'text-[var(--danger)]'}`}>{formatCurrency(m.balance)}</td></tr>);})}</tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Category Pie */}
        <Card>
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Category Breakdown</h3>
          {catBreakdown.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No expense data</p> : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={catBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">{catBreakdown.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={(v)=>[formatCurrency(Number(v)),'']} contentStyle={{background:'var(--bg-secondary)',border:'1px solid var(--border)',borderRadius:'12px',fontSize:'13px'}}/></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 w-full">{catBreakdown.map(item=><div key={item.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:item.color}}/><span className="text-xs text-[var(--text-secondary)]">{item.name}</span></div><span className="text-xs font-bold">{formatCurrency(item.value)}</span></div>)}</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
