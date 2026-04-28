'use client';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LogOut, User, Sun, Moon, Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Topbar() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="h-[var(--topbar-height)] border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      {/* Left — Mobile Logo */}
      <div className="md:hidden flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
          <span className="text-white font-bold text-sm">TT</span>
        </div>
        <span className="font-bold text-[var(--text-primary)]">TrackerTree</span>
      </div>

      {/* Left — Desktop empty or breadcrumb */}
      <div className="hidden md:block" />

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="p-2.5 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all relative"
        >
          <Bell size={18} />
        </Link>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-xl hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
          >
            <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">
              {profile?.name || 'User'}
            </span>
            <div className="w-8 h-8 rounded-xl gradient-orange flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 glass-card py-2 animate-scale-in shadow-lg">
              <div className="px-4 py-2 border-b border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{profile?.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{profile?.email}</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <User size={16} />
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--danger-light)] w-full transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
