'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { TreePine, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    }
    setLoading(false);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      toast.error(error.message);
    } else {
      setOtpSent(true);
      toast.success('Check your email for the login link!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-full blur-3xl" />

      <div className="w-full max-w-md mx-4 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-orange shadow-[var(--shadow-accent)] mb-4">
            <TreePine size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-[var(--text-secondary)] mt-1">Sign in to TrackerTree</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl mb-6">
            <button
              onClick={() => { setMode('password'); setOtpSent(false); }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${mode === 'password' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
            >
              Password
            </button>
            <button
              onClick={() => setMode('otp')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${mode === 'otp' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'}`}
            >
              Email OTP
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                required
              />
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Sign In <ArrowRight size={18} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                required
              />
              {otpSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-3">
                    <Mail size={24} className="text-[var(--success)]" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    We sent a login link to <strong>{email}</strong>. Check your inbox!
                  </p>
                </div>
              ) : (
                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Send Login Link <ArrowRight size={18} />
                </Button>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--accent)] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
