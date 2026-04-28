'use client';

import { useState } from 'react';
import { User, Palette, LogOut } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { profile, signOut, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ name }).eq('id', profile.id);
    if (error) toast.error('Failed to update');
    else { toast.success('Profile updated!'); refreshProfile(); }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1><p className="text-sm text-[var(--text-muted)]">Manage your account</p></div>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl gradient-orange flex items-center justify-center"><User size={24} className="text-white"/></div>
          <div><p className="text-sm font-semibold text-[var(--text-primary)]">{profile?.name}</p><p className="text-xs text-[var(--text-muted)]">{profile?.email}</p></div>
        </div>
        <div className="space-y-4">
          <Input label="Display Name" value={name} onChange={e => setName(e.target.value)} />
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Palette size={20} className="text-[var(--accent)]"/>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Appearance</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { if(theme==='dark') toggleTheme(); }} className={cn('flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer text-center', theme==='light' ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] hover:border-[var(--accent)]')}>
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 mx-auto mb-2"/>
            <span className="text-sm font-medium">Light</span>
          </button>
          <button onClick={() => { if(theme==='light') toggleTheme(); }} className={cn('flex-1 p-4 rounded-xl border-2 transition-all cursor-pointer text-center', theme==='dark' ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] hover:border-[var(--accent)]')}>
            <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-700 mx-auto mb-2"/>
            <span className="text-sm font-medium">Dark</span>
          </button>
        </div>
      </Card>

      {/* Sign Out */}
      <Card>
        <Button variant="danger" onClick={handleSignOut} className="w-full"><LogOut size={18}/> Sign Out</Button>
      </Card>
    </div>
  );
}
