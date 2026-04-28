'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Smartphone, Plus, Trash2, Star, Send, QrCode, ArrowUpRight, ArrowDownRight,
  Copy, ExternalLink, Users, TrendingUp, IndianRupee, Link2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { createClient } from '@/lib/supabase/client';
import { UPI_PROVIDERS } from '@/lib/constants';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { UpiAccount, UpiContact, UpiProvider } from '@/types';
import toast from 'react-hot-toast';

export default function UpiPage() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const supabase = createClient();

  // ─── State ───
  const [accounts, setAccounts] = useState<UpiAccount[]>([]);
  const [contacts, setContacts] = useState<UpiContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'accounts' | 'pay' | 'contacts' | 'history'>('accounts');

  // Add Account Modal
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [newProvider, setNewProvider] = useState<UpiProvider>('gpay');
  const [newLabel, setNewLabel] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  // Quick Pay Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [payeeUpi, setPayeeUpi] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [showQR, setShowQR] = useState(false);

  // Add Contact Modal
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactUpi, setContactUpi] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  // ─── Fetch ───
  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('upi_accounts').select('*').eq('user_id', user.id).order('is_primary', { ascending: false });
    setAccounts(data || []);
  }, [user, supabase]);

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('upi_contacts').select('*').eq('user_id', user.id).order('transaction_count', { ascending: false });
    setContacts(data || []);
  }, [user, supabase]);

  useEffect(() => {
    Promise.all([fetchAccounts(), fetchContacts()]).then(() => setLoading(false));
  }, [fetchAccounts, fetchContacts]);

  // ─── UPI Transactions ───
  const upiTransactions = useMemo(() =>
    transactions.filter(t => t.payment_mode === 'upi').slice(0, 20),
  [transactions]);

  const upiStats = useMemo(() => {
    const upiTxns = transactions.filter(t => t.payment_mode === 'upi');
    const totalSent = upiTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalReceived = upiTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    return { count: upiTxns.length, totalSent, totalReceived };
  }, [transactions]);

  // ─── Handlers ───
  const addAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newUpiId) return;
    setSavingAccount(true);
    const isPrimary = accounts.length === 0;
    const { error } = await supabase.from('upi_accounts').insert({
      user_id: user.id, upi_id: newUpiId, provider: newProvider,
      label: newLabel || newUpiId, is_primary: isPrimary,
    });
    if (error) toast.error('Failed to add');
    else { toast.success('UPI account linked!'); setNewUpiId(''); setNewLabel(''); setShowAddAccount(false); fetchAccounts(); }
    setSavingAccount(false);
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('Remove this UPI account?')) return;
    await supabase.from('upi_accounts').delete().eq('id', id);
    toast.success('Removed'); fetchAccounts();
  };

  const setPrimary = async (id: string) => {
    if (!user) return;
    await supabase.from('upi_accounts').update({ is_primary: false }).eq('user_id', user.id);
    await supabase.from('upi_accounts').update({ is_primary: true }).eq('id', id);
    toast.success('Set as primary'); fetchAccounts();
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contactName || !contactUpi) return;
    setSavingContact(true);
    const { error } = await supabase.from('upi_contacts').insert({
      user_id: user.id, name: contactName, upi_id: contactUpi,
    });
    if (error) toast.error('Failed to add');
    else { toast.success('Contact added!'); setContactName(''); setContactUpi(''); setShowAddContact(false); fetchContacts(); }
    setSavingContact(false);
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Remove this contact?')) return;
    await supabase.from('upi_contacts').delete().eq('id', id);
    toast.success('Removed'); fetchContacts();
  };

  // ─── UPI Deep Link ───
  const generateUpiLink = (pa: string, pn: string, am: string, tn: string) => {
    const params = new URLSearchParams();
    params.set('pa', pa);
    if (pn) params.set('pn', pn);
    if (am) params.set('am', am);
    params.set('cu', 'INR');
    if (tn) params.set('tn', tn);
    return `upi://pay?${params.toString()}`;
  };

  const copyUpiLink = () => {
    const link = generateUpiLink(payeeUpi, payeeName, payAmount, payNote);
    navigator.clipboard.writeText(link);
    toast.success('UPI link copied!');
  };

  const openUpiApp = () => {
    const link = generateUpiLink(payeeUpi, payeeName, payAmount, payNote);
    window.location.href = link;
  };

  const getProviderInfo = (provider: string) =>
    UPI_PROVIDERS.find(p => p.value === provider) || UPI_PROVIDERS[4];

  // ─── Render ───
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Smartphone size={24} className="text-[var(--accent)]" /> UPI Tracker
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Link accounts, track payments, pay instantly</p>
        </div>
      </div>

      {/* UPI Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-[var(--info-light)] flex items-center justify-center mx-auto mb-2">
            <TrendingUp size={20} className="text-[var(--info)]" />
          </div>
          <p className="text-xs text-[var(--text-muted)]">UPI Transactions</p>
          <p className="text-xl font-extrabold text-[var(--text-primary)]">{upiStats.count}</p>
        </Card>
        <Card className="text-center animate-fade-in" style={{ animationDelay: '80ms' }}>
          <div className="w-10 h-10 rounded-xl bg-[var(--danger-light)] flex items-center justify-center mx-auto mb-2">
            <ArrowUpRight size={20} className="text-[var(--danger)]" />
          </div>
          <p className="text-xs text-[var(--text-muted)]">Total Sent</p>
          <p className="text-lg font-extrabold text-[var(--danger)]">{formatCurrency(upiStats.totalSent)}</p>
        </Card>
        <Card className="text-center animate-fade-in" style={{ animationDelay: '160ms' }}>
          <div className="w-10 h-10 rounded-xl bg-[var(--success-light)] flex items-center justify-center mx-auto mb-2">
            <ArrowDownRight size={20} className="text-[var(--success)]" />
          </div>
          <p className="text-xs text-[var(--text-muted)]">Total Received</p>
          <p className="text-lg font-extrabold text-[var(--success)]">{formatCurrency(upiStats.totalReceived)}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl">
        {(['accounts', 'pay', 'contacts', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer capitalize',
              activeTab === tab ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'
            )}
          >
            {tab === 'pay' ? 'Quick Pay' : tab}
          </button>
        ))}
      </div>

      {/* ─── TAB: Accounts ─── */}
      {activeTab === 'accounts' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-[var(--text-primary)]">Linked UPI Accounts</h2>
            <Button size="sm" onClick={() => setShowAddAccount(true)}><Link2 size={16} /> Link Account</Button>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Card key={i} className="h-20 animate-shimmer" />)}</div>
          ) : accounts.length === 0 ? (
            <Card className="text-center py-12">
              <Smartphone size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
              <p className="text-sm font-medium text-[var(--text-primary)]">No UPI accounts linked</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Link your GPay, PhonePe, or Paytm UPI ID to start tracking</p>
              <Button size="sm" className="mt-4" onClick={() => setShowAddAccount(true)}>
                <Plus size={16} /> Link Your First UPI ID
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc, i) => {
                const provider = getProviderInfo(acc.provider);
                return (
                  <Card key={acc.id} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: provider.color + '15' }}>
                      <Smartphone size={22} style={{ color: provider.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{acc.upi_id}</p>
                        {acc.is_primary && <span className="badge badge-warning text-[10px]">Primary</span>}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{provider.label} • {acc.label}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!acc.is_primary && (
                        <button onClick={() => setPrimary(acc.id)} className="p-2 rounded-lg hover:bg-[var(--warning-light)] text-[var(--text-muted)] hover:text-[var(--warning)] cursor-pointer transition-colors" title="Set primary">
                          <Star size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteAccount(acc.id)} className="p-2 rounded-lg hover:bg-[var(--danger-light)] text-[var(--text-muted)] hover:text-[var(--danger)] cursor-pointer transition-colors" title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: Quick Pay ─── */}
      {activeTab === 'pay' && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Send size={18} className="text-[var(--accent)]" /> Quick UPI Payment
            </h2>
            <div className="space-y-4">
              <Input label="Payee UPI ID" placeholder="name@upi or number@ybl" value={payeeUpi} onChange={e => setPayeeUpi(e.target.value)} icon={<Smartphone size={16} />} />
              <Input label="Payee Name" placeholder="Recipient name" value={payeeName} onChange={e => setPayeeName(e.target.value)} />
              <Input label="Amount (₹)" type="number" placeholder="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} icon={<IndianRupee size={16} />} />
              <Input label="Note" placeholder="Payment for..." value={payNote} onChange={e => setPayNote(e.target.value)} />

              <div className="flex gap-3">
                <Button onClick={openUpiApp} disabled={!payeeUpi} className="flex-1" size="lg">
                  <ExternalLink size={18} /> Open UPI App
                </Button>
                <Button variant="secondary" onClick={() => setShowQR(!showQR)} disabled={!payeeUpi}>
                  <QrCode size={18} />
                </Button>
                <Button variant="secondary" onClick={copyUpiLink} disabled={!payeeUpi}>
                  <Copy size={18} />
                </Button>
              </div>

              {/* QR Code */}
              {showQR && payeeUpi && (
                <div className="flex flex-col items-center gap-3 py-6 bg-[var(--bg-tertiary)] rounded-xl animate-scale-in">
                  <QRCodeSVG
                    value={generateUpiLink(payeeUpi, payeeName, payAmount, payNote)}
                    size={200}
                    bgColor="transparent"
                    fgColor="var(--text-primary)"
                    level="M"
                  />
                  <p className="text-xs text-[var(--text-muted)]">Scan with any UPI app</p>
                  {payAmount && <p className="text-lg font-bold text-[var(--accent)]">₹{parseFloat(payAmount).toLocaleString('en-IN')}</p>}
                </div>
              )}
            </div>
          </Card>

          {/* Quick Pay Contacts */}
          {contacts.length > 0 && (
            <Card>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">Quick Pay to Contacts</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {contacts.slice(0, 6).map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setPayeeUpi(c.upi_id); setPayeeName(c.name); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center text-white font-bold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-medium text-[var(--text-secondary)] truncate w-full text-center">{c.name}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB: Contacts ─── */}
      {activeTab === 'contacts' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-[var(--text-primary)]">UPI Contacts</h2>
            <Button size="sm" onClick={() => setShowAddContact(true)}><Plus size={16} /> Add Contact</Button>
          </div>

          {contacts.length === 0 ? (
            <Card className="text-center py-12">
              <Users size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No contacts yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Add people you frequently pay or receive from</p>
              <Button size="sm" className="mt-4" onClick={() => setShowAddContact(true)}><Plus size={16} /> Add Contact</Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {contacts.map((c, i) => (
                <Card key={c.id} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center text-white font-bold flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{c.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{c.upi_id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[var(--text-muted)]">{c.transaction_count} txns</p>
                    {c.total_paid > 0 && <p className="text-xs text-[var(--danger)]">Paid: {formatCurrency(c.total_paid)}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setPayeeUpi(c.upi_id); setPayeeName(c.name); setActiveTab('pay'); }} className="p-2 rounded-lg hover:bg-[var(--accent-light)] text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer transition-colors" title="Pay">
                      <Send size={14} />
                    </button>
                    <button onClick={() => deleteContact(c.id)} className="p-2 rounded-lg hover:bg-[var(--danger-light)] text-[var(--text-muted)] hover:text-[var(--danger)] cursor-pointer transition-colors" title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: History ─── */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-base font-bold text-[var(--text-primary)]">UPI Transaction History</h2>

          {upiTransactions.length === 0 ? (
            <Card className="text-center py-12">
              <Smartphone size={40} className="mx-auto text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">No UPI transactions yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Add transactions with UPI payment mode to see them here</p>
            </Card>
          ) : (
            <div className="glass-card overflow-hidden">
              {upiTransactions.map((t, i) => {
                const cat = categories.find(c => c.id === t.category_id);
                return (
                  <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (cat?.color || '#64748b') + '20' }}>
                      <Smartphone size={18} style={{ color: cat?.color || '#64748b' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{cat?.name || 'UPI Payment'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--text-muted)]">{formatDate(t.date)}</span>
                        {t.upi_ref && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] font-mono">Ref: {t.upi_ref}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn('text-sm font-bold flex items-center gap-1', t.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--danger)]')}>
                        {t.type === 'income' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                        {formatCurrency(t.amount)}
                      </p>
                      <span className={cn('text-[10px] font-semibold', t.status === 'paid' ? 'text-[var(--success)]' : t.status === 'pending' ? 'text-[var(--warning)]' : 'text-[var(--danger)]')}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ MODALS ═══ */}

      {/* Add Account Modal */}
      <Modal isOpen={showAddAccount} onClose={() => setShowAddAccount(false)} title="Link UPI Account">
        <form onSubmit={addAccount} className="space-y-4">
          <Input label="UPI ID" placeholder="yourname@okaxis" value={newUpiId} onChange={e => setNewUpiId(e.target.value)} required icon={<Smartphone size={16} />} />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">UPI Provider</label>
            <div className="grid grid-cols-5 gap-2">
              {UPI_PROVIDERS.map(p => (
                <button key={p.value} type="button" onClick={() => setNewProvider(p.value as UpiProvider)}
                  className={cn('flex flex-col items-center gap-1 p-3 rounded-xl transition-all cursor-pointer border',
                    newProvider === p.value ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-transparent hover:bg-[var(--bg-hover)]'
                  )}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                    <Smartphone size={16} style={{ color: p.color }} />
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-secondary)]">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <Input label="Label (optional)" placeholder="e.g. Personal, Business" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
          <Button type="submit" loading={savingAccount} className="w-full" size="lg"><Link2 size={18} /> Link Account</Button>
        </form>
      </Modal>

      {/* Add Contact Modal */}
      <Modal isOpen={showAddContact} onClose={() => setShowAddContact(false)} title="Add UPI Contact">
        <form onSubmit={addContact} className="space-y-4">
          <Input label="Name" placeholder="Contact name" value={contactName} onChange={e => setContactName(e.target.value)} required />
          <Input label="UPI ID" placeholder="contact@upi" value={contactUpi} onChange={e => setContactUpi(e.target.value)} required icon={<Smartphone size={16} />} />
          <Button type="submit" loading={savingContact} className="w-full" size="lg"><Plus size={18} /> Add Contact</Button>
        </form>
      </Modal>
    </div>
  );
}
