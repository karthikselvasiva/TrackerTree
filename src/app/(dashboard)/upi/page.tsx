'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ScanLine, X, CheckCircle2, ExternalLink, ArrowUpRight,
  Smartphone, IndianRupee, Clock, AlertCircle, Camera
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { createClient } from '@/lib/supabase/client';
import { autoCategorizeTxn, findCategoryByName } from '@/lib/ai';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import toast from 'react-hot-toast';

// ─── Types ───
interface ParsedUPI {
  pa: string;   // payee address (UPI ID)
  pn: string;   // payee name
  am: string;   // amount
  tn: string;   // transaction note
  cu: string;   // currency
  mc: string;   // merchant code
  tr: string;   // transaction ref
  url: string;  // original UPI deep link
}

type ScanStep = 'idle' | 'scanning' | 'parsed' | 'confirmed' | 'error';

// ─── UPI Parser ───
function parseUpiUrl(raw: string): ParsedUPI | null {
  let url = raw.trim();
  // Handle both upi:// and upi:/ formats
  if (!url.toLowerCase().startsWith('upi://') && !url.toLowerCase().startsWith('upi:/')) return null;

  try {
    // Normalize to standard URL for parsing
    const normalized = url.replace(/^upi:\/\/?/i, 'https://upi.placeholder/');
    const parsed = new URL(normalized);
    return {
      pa: parsed.searchParams.get('pa') || '',
      pn: decodeURIComponent(parsed.searchParams.get('pn') || ''),
      am: parsed.searchParams.get('am') || '',
      tn: decodeURIComponent(parsed.searchParams.get('tn') || ''),
      cu: parsed.searchParams.get('cu') || 'INR',
      mc: parsed.searchParams.get('mc') || '',
      tr: parsed.searchParams.get('tr') || '',
      url: url,
    };
  } catch {
    return null;
  }
}

// ─── Build UPI intent URL ───
function buildUpiIntent(data: ParsedUPI, overrideAmount?: string): string {
  const params = new URLSearchParams();
  params.set('pa', data.pa);
  if (data.pn) params.set('pn', data.pn);
  const amount = overrideAmount || data.am;
  if (amount) params.set('am', amount);
  params.set('cu', data.cu || 'INR');
  if (data.tn) params.set('tn', data.tn);
  if (data.tr) params.set('tr', data.tr);
  if (data.mc) params.set('mc', data.mc);
  return `upi://pay?${params.toString()}`;
}

export default function UpiScanPage() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const supabase = createClient();

  // ─── State ───
  const [step, setStep] = useState<ScanStep>('idle');
  const [upiData, setUpiData] = useState<ParsedUPI | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [recentScans, setRecentScans] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

  // ─── Fetch recent UPI scans ───
  const fetchRecent = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('payment_mode', 'upi')
      .eq('type', 'expense')
      .order('created_at', { ascending: false })
      .limit(10);
    setRecentScans(data || []);
    setLoadingHistory(false);
  }, [user, supabase]);

  useEffect(() => { fetchRecent(); }, [fetchRecent]);

  // ─── Start Camera Scanner ───
  const startScanner = async () => {
    setStep('scanning');

    // Wait for DOM
    await new Promise(r => setTimeout(r, 300));

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          // QR scanned!
          const parsed = parseUpiUrl(decodedText);
          if (parsed && parsed.pa) {
            handleScanned(parsed);
            stopScanner();
          } else {
            toast.error('Not a valid UPI QR code');
          }
        },
        () => { /* ignore scan failures */ }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      toast.error('Camera access denied or unavailable');
      setStep('idle');
    }
  };

  // ─── Stop Camera ───
  const stopScanner = async () => {
    try {
      const scanner = html5QrCodeRef.current as { stop: () => Promise<void>; clear: () => void } | null;
      if (scanner) {
        await scanner.stop();
        scanner.clear();
        html5QrCodeRef.current = null;
      }
    } catch {
      // already stopped
    }
  };

  // ─── Handle successful scan ───
  const handleScanned = (data: ParsedUPI) => {
    setUpiData(data);
    setEditAmount(data.am || '');
    setStep('parsed');
  };

  // ─── Confirm & Pay ───
  const confirmAndPay = async () => {
    if (!user || !upiData || !upiData.pa) return;
    const amount = parseFloat(editAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    // 1. INSTANTLY open UPI app — no waiting
    const intentUrl = buildUpiIntent(upiData, editAmount);
    window.location.href = intentUrl;

    // 2. Update UI immediately
    setStep('confirmed');
    toast.success('Transaction tracked!');

    // 3. Save transaction in background (non-blocking)
    const catName = autoCategorizeTxn(upiData.pn + ' ' + upiData.tn);
    const cat = catName ? findCategoryByName(catName, categories) : null;
    const fallback = categories.find(c => c.type === 'expense');

    supabase.from('transactions').insert({
      user_id: user.id,
      amount: amount,
      type: 'expense' as const,
      category_id: cat?.id || fallback?.id || categories[0]?.id,
      date: new Date().toISOString().split('T')[0],
      payment_mode: 'upi' as const,
      status: 'pending' as const,
      notes: `${upiData.pn || 'UPI Payment'} ${upiData.tn ? '- ' + upiData.tn : ''}`.trim(),
      upi_ref: upiData.tr || '',
      tags: null,
    }).then(({ error }) => {
      if (error) console.error('Failed to save transaction:', error);
      fetchRecent();
    });
  };

  // ─── Cancel ───
  const resetFlow = () => {
    stopScanner();
    setStep('idle');
    setUpiData(null);
    setEditAmount('');
  };

  // ─── Cleanup scanner on unmount ───
  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">

      {/* ══════════ STEP: IDLE ══════════ */}
      {step === 'idle' && (
        <div className="animate-fade-in space-y-6">
          {/* Hero Scan Button */}
          <div className="text-center pt-4 pb-2">
            <div className="w-20 h-20 mx-auto rounded-3xl gradient-orange flex items-center justify-center shadow-lg shadow-[var(--accent)]/30 mb-5">
              <ScanLine size={36} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Scan & Pay</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
              Scan any UPI QR code. TrackerTree will track the payment, then open your UPI app to complete it.
            </p>
          </div>

          <Button
            onClick={startScanner}
            size="lg"
            className="w-full py-4 text-base gap-3"
          >
            <Camera size={22} /> Open Scanner
          </Button>

          {/* How it works */}
          <Card>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">How it works</h3>
            <div className="space-y-3">
              {[
                { num: '1', text: 'Scan any UPI QR code with your camera', icon: <ScanLine size={16} className="text-[var(--accent)]" /> },
                { num: '2', text: 'Review payment details & amount', icon: <IndianRupee size={16} className="text-[var(--accent)]" /> },
                { num: '3', text: 'TrackerTree logs the transaction automatically', icon: <CheckCircle2 size={16} className="text-[var(--success)]" /> },
                { num: '4', text: 'Choose GPay, PhonePe, Paytm etc. to pay', icon: <ExternalLink size={16} className="text-[var(--info)]" /> },
              ].map(item => (
                <div key={item.num} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent UPI Payments */}
          {!loadingHistory && recentScans.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Clock size={14} className="text-[var(--text-muted)]" /> Recent UPI Payments
              </h3>
              <div className="space-y-2">
                {recentScans.map((t, i) => (
                  <Card key={t.id} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="w-10 h-10 rounded-xl bg-[var(--danger-light)] flex items-center justify-center flex-shrink-0">
                      <ArrowUpRight size={18} className="text-[var(--danger)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{t.notes || 'UPI Payment'}</p>
                      <p className="text-xs text-[var(--text-muted)]">{formatDate(t.date)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[var(--danger)]">{formatCurrency(t.amount)}</p>
                      <span className={cn(
                        'text-[10px] font-semibold',
                        t.status === 'paid' ? 'text-[var(--success)]' : t.status === 'pending' ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
                      )}>{t.status}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ STEP: SCANNING ══════════ */}
      {step === 'scanning' && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Scanning...</h2>
            <button onClick={resetFlow} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Camera View */}
          <div className="relative overflow-hidden rounded-2xl bg-black aspect-square">
            <div id="qr-reader" ref={scannerRef} className="w-full h-full" />
            {/* Overlay corners */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-8 w-12 h-12 border-t-3 border-l-3 border-[var(--accent)] rounded-tl-xl" />
              <div className="absolute top-8 right-8 w-12 h-12 border-t-3 border-r-3 border-[var(--accent)] rounded-tr-xl" />
              <div className="absolute bottom-8 left-8 w-12 h-12 border-b-3 border-l-3 border-[var(--accent)] rounded-bl-xl" />
              <div className="absolute bottom-8 right-8 w-12 h-12 border-b-3 border-r-3 border-[var(--accent)] rounded-br-xl" />
              {/* Scan line animation */}
              <div className="absolute left-8 right-8 h-0.5 bg-[var(--accent)] animate-scan-line" />
            </div>
          </div>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Point your camera at any UPI QR code
          </p>
        </div>
      )}

      {/* ══════════ STEP: PARSED (Review) ══════════ */}
      {step === 'parsed' && upiData && (
        <div className="animate-slide-up space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Payment Details</h2>
            <button onClick={resetFlow} className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Payee Card */}
          <Card className="text-center py-6 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl gradient-orange flex items-center justify-center shadow-md">
              <Smartphone size={28} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {upiData.pn || 'Merchant'}
              </p>
              <p className="text-sm text-[var(--text-muted)] font-mono mt-0.5">
                {upiData.pa}
              </p>
            </div>
            {upiData.tn && (
              <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-lg inline-block">
                {upiData.tn}
              </p>
            )}
          </Card>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[var(--text-primary)]">₹</span>
              <input
                type="number"
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-4 text-3xl font-extrabold text-center bg-[var(--bg-tertiary)] border-2 border-[var(--border)] rounded-2xl focus:border-[var(--accent)] focus:outline-none transition-colors text-[var(--text-primary)]"
                readOnly={!!upiData.am}
              />
            </div>
            {upiData.am && (
              <p className="text-xs text-[var(--text-muted)] mt-1 text-center">Amount fixed by merchant</p>
            )}
          </div>

          {/* Confirm Button */}
          <Button
            onClick={confirmAndPay}
            loading={saving}
            size="lg"
            className="w-full py-4 text-base gap-2"
          >
            <ExternalLink size={20} /> Track & Pay via UPI App
          </Button>

          <p className="text-[11px] text-center text-[var(--text-muted)]">
            TrackerTree will save this transaction, then open your UPI app (GPay, PhonePe, Paytm) to complete the payment.
          </p>
        </div>
      )}

      {/* ══════════ STEP: CONFIRMED ══════════ */}
      {step === 'confirmed' && upiData && (
        <div className="animate-scale-in text-center space-y-5 pt-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-[var(--success-light)] flex items-center justify-center">
            <CheckCircle2 size={40} className="text-[var(--success)]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Transaction Tracked!</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              ₹{parseFloat(editAmount).toLocaleString('en-IN')} to {upiData.pn || upiData.pa}
            </p>
          </div>
          <Card className="text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Payee</span><span className="font-semibold">{upiData.pn || upiData.pa}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">UPI ID</span><span className="font-mono text-xs">{upiData.pa}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Amount</span><span className="font-bold text-[var(--danger)]">{formatCurrency(parseFloat(editAmount))}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Status</span><span className="badge badge-warning">Pending</span></div>
          </Card>
          <p className="text-xs text-[var(--text-muted)]">
            Opening your UPI app... If it didn&apos;t open automatically:
          </p>
          <Button
            onClick={() => {
              if (upiData) window.location.href = buildUpiIntent(upiData, editAmount);
            }}
            size="lg"
            className="w-full gap-2"
          >
            <ExternalLink size={18} /> Open UPI App Manually
          </Button>
          <Button variant="ghost" onClick={resetFlow} className="w-full">
            Scan Another QR
          </Button>
        </div>
      )}
    </div>
  );
}
