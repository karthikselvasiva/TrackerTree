'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { autoCategorizeTxn, findCategoryByName } from '@/lib/ai';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface ParsedRow { date: string; amount: number; description: string; type: 'income' | 'expense'; }

export default function ImportPage() {
  const { categories } = useCategories();
  const { user } = useAuth();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState('');
  const supabase = createClient();

  const parseFile = useCallback((file: File) => {
    setFileName(file.name);
    setDone(false);
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = (results.data as Record<string,string>[]).map(row => {
            const keys = Object.keys(row);
            const dateKey = keys.find(k => /date/i.test(k)) || keys[0];
            const amountKey = keys.find(k => /amount|debit|credit/i.test(k)) || keys[1];
            const descKey = keys.find(k => /desc|narr|particular|remark/i.test(k)) || keys[2];
            const amt = parseFloat(String(row[amountKey]).replace(/[^0-9.-]/g, '')) || 0;
            return { date: row[dateKey] || new Date().toISOString().split('T')[0], amount: Math.abs(amt), description: row[descKey] || '', type: (amt < 0 ? 'expense' : 'income') as 'income' | 'expense' };
          }).filter(r => r.amount > 0);
          setRows(parsed);
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string,string>>(ws);
        const parsed = json.map(row => {
          const keys = Object.keys(row);
          const dateKey = keys.find(k => /date/i.test(k)) || keys[0];
          const amountKey = keys.find(k => /amount|debit|credit/i.test(k)) || keys[1];
          const descKey = keys.find(k => /desc|narr|particular/i.test(k)) || keys[2];
          const amt = parseFloat(String(row[amountKey]).replace(/[^0-9.-]/g, '')) || 0;
          return { date: row[dateKey] || new Date().toISOString().split('T')[0], amount: Math.abs(amt), description: row[descKey] || '', type: (amt < 0 ? 'expense' : 'income') as 'income' | 'expense' };
        }).filter(r => r.amount > 0);
        setRows(parsed);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Unsupported file type. Use CSV or Excel.');
    }
  }, []);

  const handleImport = async () => {
    if (!user || rows.length === 0) return;
    setImporting(true);
    const txns = rows.map(r => {
      const catName = autoCategorizeTxn(r.description);
      const cat = catName ? findCategoryByName(catName, categories) : null;
      const fallback = categories.find(c => c.type === r.type);
      return {
        user_id: user.id, amount: r.amount, type: r.type,
        category_id: cat?.id || fallback?.id || categories[0]?.id,
        date: r.date, payment_mode: 'bank_transfer' as const, status: 'paid' as const,
        notes: r.description, upi_ref: '', tags: null,
      };
    });

    const { error } = await supabase.from('transactions').insert(txns);
    if (error) { toast.error('Import failed'); console.error(error); }
    else { toast.success(`${txns.length} transactions imported!`); setDone(true); }
    setImporting(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Import</h1><p className="text-sm text-[var(--text-muted)]">Upload bank statements (CSV/Excel)</p></div>

      {/* Dropzone */}
      <Card className="border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-colors">
        <label className="flex flex-col items-center gap-3 py-12 cursor-pointer">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center">
            <Upload size={28} className="text-[var(--accent)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Drop your file here or click to browse</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Supports CSV, XLSX, XLS</p>
          </div>
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => e.target.files?.[0] && parseFile(e.target.files[0])} />
        </label>
      </Card>

      {/* Preview */}
      {rows.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-[var(--accent)]" />
              <span className="text-sm font-semibold">{fileName}</span>
              <span className="badge badge-info">{rows.length} rows</span>
            </div>
            {!done && <Button onClick={handleImport} loading={importing} size="sm">Import All</Button>}
            {done && <span className="flex items-center gap-1 text-sm text-[var(--success)] font-semibold"><Check size={16}/> Done</span>}
          </div>
          <div className="overflow-x-auto max-h-60">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[var(--border)]"><th className="text-left py-2 text-[var(--text-muted)]">Date</th><th className="text-right py-2 text-[var(--text-muted)]">Amount</th><th className="text-left py-2 text-[var(--text-muted)]">Description</th><th className="text-center py-2 text-[var(--text-muted)]">Type</th></tr></thead>
              <tbody>{rows.slice(0,50).map((r,i)=><tr key={i} className="border-b border-[var(--border)] last:border-0"><td className="py-2">{r.date}</td><td className="py-2 text-right font-medium">₹{r.amount.toLocaleString('en-IN')}</td><td className="py-2 truncate max-w-[200px]">{r.description}</td><td className="py-2 text-center"><span className={`badge ${r.type==='income'?'badge-success':'badge-danger'}`}>{r.type}</span></td></tr>)}</tbody>
            </table>
            {rows.length>50&&<p className="text-xs text-[var(--text-muted)] text-center py-2">Showing 50 of {rows.length} rows</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
