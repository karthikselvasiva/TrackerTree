'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { PAYMENT_MODES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Category, Transaction, PaymentMode, PaymentStatus, TransactionTag } from '@/types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    type: 'income' | 'expense';
    category_id: string;
    date: string;
    payment_mode: PaymentMode;
    upi_ref: string;
    status: PaymentStatus;
    notes: string;
    tags: TransactionTag | null;
  }) => Promise<boolean>;
  categories: Category[];
  editTransaction?: Transaction | null;
  initialType?: 'income' | 'expense';
}

export default function TransactionForm({
  isOpen, onClose, onSubmit, categories, editTransaction, initialType,
}: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialType || 'expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [upiRef, setUpiRef] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');
  const [tag, setTag] = useState<TransactionTag | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setCategoryId(editTransaction.category_id);
      setDate(editTransaction.date);
      setPaymentMode(editTransaction.payment_mode);
      setUpiRef(editTransaction.upi_ref || '');
      setStatus(editTransaction.status);
      setNotes(editTransaction.notes);
      setTag(editTransaction.tags);
    } else {
      setType(initialType || 'expense');
      setAmount('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('cash');
      setUpiRef('');
      setStatus('paid');
      setNotes('');
      setTag(null);
    }
  }, [editTransaction, initialType, isOpen]);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;
    setLoading(true);

    const success = await onSubmit({
      amount: parseFloat(amount),
      type,
      category_id: categoryId,
      date,
      payment_mode: paymentMode,
      upi_ref: upiRef || '',
      status,
      notes,
      tags: tag,
    });

    if (success) {
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Edit Transaction' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Toggle */}
        {!initialType && (
          <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl">
            <button
              type="button"
              onClick={() => { setType('income'); setCategoryId(''); }}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer',
                type === 'income' ? 'bg-[var(--success)] text-white shadow-sm' : 'text-[var(--text-muted)]'
              )}
            >
              + Income
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryId(''); }}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer',
                type === 'expense' ? 'bg-[var(--danger)] text-white shadow-sm' : 'text-[var(--text-muted)]'
              )}
            >
              - Expense
            </button>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full text-3xl font-extrabold text-center py-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            required
            min="0.01"
            step="0.01"
          />
        </div>

        {/* Category Grid */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all cursor-pointer border',
                  categoryId === cat.id
                    ? 'border-[var(--accent)] bg-[var(--accent-light)] shadow-sm'
                    : 'border-transparent hover:bg-[var(--bg-hover)]'
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: cat.color + '20' }}
                >
                  <DynamicIcon name={cat.icon} size={16} style={{ color: cat.color }} />
                </div>
                <span className="text-[10px] font-medium text-[var(--text-secondary)] truncate w-full text-center">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Payment Mode */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* UPI Ref (shown for UPI mode) */}
        {paymentMode === 'upi' && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="UPI Reference ID"
              type="text"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
              placeholder="e.g. 412345678901"
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        )}

        {/* Notes */}
        <Input
          label="Notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What was this for?"
        />

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Tag</label>
          <div className="flex gap-2">
            {(['personal', 'business'] as TransactionTag[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(tag === t ? null : t)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border',
                  tag === t
                    ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
          variant={type === 'income' ? 'success' : 'danger'}
        >
          {editTransaction ? 'Update' : 'Save'} {type === 'income' ? 'Income' : 'Expense'}
        </Button>
      </form>
    </Modal>
  );
}
