'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Bell, Clock, CheckCircle2, Trash2, Pencil } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getDaysUntil, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { PaymentReminder } from '@/types';
import toast from 'react-hot-toast';

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editR, setEditR] = useState<PaymentReminder | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState<PaymentReminder['recurring']>('none');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('payment_reminders').select('*').eq('user_id', user.id).order('due_date');
    setReminders(data || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditR(null); setTitle(''); setAmount(''); setDueDate(new Date().toISOString().split('T')[0]); setRecurring('none'); setNotes(''); setShowForm(true); };
  const openEdit = (r: PaymentReminder) => { setEditR(r); setTitle(r.title); setAmount(r.amount.toString()); setDueDate(r.due_date); setRecurring(r.recurring); setNotes(r.notes); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !amount) return;
    setSaving(true);
    const data = { title, amount: parseFloat(amount), due_date: dueDate, recurring, notes, user_id: user.id, is_paid: false };
    if (editR) { await supabase.from('payment_reminders').update(data).eq('id', editR.id); toast.success('Updated!'); }
    else { await supabase.from('payment_reminders').insert(data); toast.success('Reminder added!'); }
    setSaving(false); setShowForm(false); fetch();
  };

  const togglePaid = async (r: PaymentReminder) => {
    await supabase.from('payment_reminders').update({ is_paid: !r.is_paid }).eq('id', r.id);
    toast.success(r.is_paid ? 'Marked unpaid' : 'Marked paid');
    fetch();
  };

  const deleteR = async (id: string) => {
    if (!confirm('Delete reminder?')) return;
    await supabase.from('payment_reminders').delete().eq('id', id);
    toast.success('Deleted'); fetch();
  };

  const upcoming = reminders.filter(r => !r.is_paid);
  const completed = reminders.filter(r => r.is_paid);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Reminders</h1><p className="text-sm text-[var(--text-muted)]">Upcoming payments</p></div>
        <Button onClick={openAdd}><Plus size={18}/> Add</Button>
      </div>

      {loading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Card key={i} className="h-20 animate-shimmer"/>)}</div> : (
        <>
          {upcoming.length === 0 && completed.length === 0 && (
            <Card className="text-center py-12"><Bell size={32} className="mx-auto text-[var(--text-muted)] mb-3"/><p className="text-sm text-[var(--text-muted)]">No reminders yet</p></Card>
          )}

          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Upcoming</h2>
              {upcoming.map((r, i) => {
                const days = getDaysUntil(r.due_date);
                const urgent = days <= 3;
                const overdue = days < 0;
                return (
                  <Card key={r.id} className={cn('flex items-center gap-4 animate-fade-in', overdue && 'border-[var(--danger)]/30')} style={{ animationDelay: `${i*50}ms` }}>
                    <button onClick={() => togglePaid(r)} className="w-6 h-6 rounded-full border-2 border-[var(--border)] hover:border-[var(--accent)] flex-shrink-0 cursor-pointer transition-colors"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={12} className="text-[var(--text-muted)]"/>
                        <span className="text-xs text-[var(--text-muted)]">{formatDate(r.due_date)}</span>
                        {r.recurring !== 'none' && <span className="badge badge-info text-[10px]">{r.recurring}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(r.amount)}</p>
                      <span className={cn('text-xs font-semibold', overdue ? 'text-[var(--danger)]' : urgent ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]')}>
                        {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer"><Pencil size={14}/></button>
                      <button onClick={() => deleteR(r.id)} className="p-1.5 rounded-lg hover:bg-[var(--danger-light)] text-[var(--text-muted)] cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Completed</h2>
              {completed.map(r => (
                <Card key={r.id} className="flex items-center gap-4 opacity-60">
                  <button onClick={() => togglePaid(r)} className="w-6 h-6 rounded-full bg-[var(--success)] flex items-center justify-center flex-shrink-0 cursor-pointer"><CheckCircle2 size={16} className="text-white"/></button>
                  <div className="flex-1"><p className="text-sm font-semibold text-[var(--text-primary)] line-through">{r.title}</p></div>
                  <p className="text-sm font-bold">{formatCurrency(r.amount)}</p>
                  <button onClick={() => deleteR(r.id)} className="p-1.5 rounded-lg hover:bg-[var(--danger-light)] text-[var(--text-muted)] cursor-pointer"><Trash2 size={14}/></button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editR ? 'Edit Reminder' : 'New Reminder'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Electricity Bill"/>
          <Input label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1"/>
          <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required/>
          <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Recurring</label>
            <select value={recurring} onChange={e => setRecurring(e.target.value as PaymentReminder['recurring'])} className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)]">
              <option value="none">None</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
            </select>
          </div>
          <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional"/>
          <Button type="submit" loading={saving} className="w-full" size="lg">{editR ? 'Update' : 'Add'} Reminder</Button>
        </form>
      </Modal>
    </div>
  );
}
