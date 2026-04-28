'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { X, Menu } from 'lucide-react';

const MAIN_TABS = [
  { name: 'Home', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Txns', href: '/transactions', icon: 'ArrowLeftRight' },
  { name: 'UPI', href: '/upi', icon: 'Smartphone' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  // Close menu when navigating
  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (showMore) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMore]);

  return (
    <>
      {/* ─── FULL MENU OVERLAY (Bottom Sheet) ─── */}
      {showMore && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
          onClick={() => setShowMore(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-[var(--bg-primary)] rounded-t-[32px] p-6 pb-28 animate-slide-up shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-[var(--border)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Menu</h2>
              <button 
                onClick={() => setShowMore(false)} 
                className="w-8 h-8 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Grid of all navigation links */}
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200",
                      isActive 
                        ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30 scale-105" 
                        : "bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] active:scale-95"
                    )}>
                      <DynamicIcon name={item.icon} size={24} />
                    </div>
                    <span className={cn(
                      "text-[11px] font-medium text-center truncate w-full px-1 transition-colors",
                      isActive ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-muted)]"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── BOTTOM NAVIGATION BAR ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--border)] px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] mobile-safe-bottom">
        <div className="flex items-center justify-around relative">
          {MAIN_TABS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl transition-all duration-200 min-w-[64px]',
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)] active:scale-95'
                )}
              >
                <DynamicIcon name={item.icon} size={22} className={cn(isActive && "animate-scale-in")} />
                <span className="text-[10px] font-medium">{item.name}</span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-0.5 rounded-b-full bg-[var(--accent)] animate-fade-in" />
                )}
              </Link>
            );
          })}
          
          {/* More Menu Toggle Button */}
          <button
            onClick={() => setShowMore(true)}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl transition-all duration-200 min-w-[64px] cursor-pointer',
              showMore ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] active:scale-95'
            )}
          >
            <Menu size={22} className={cn(showMore && "animate-scale-in")} />
            <span className="text-[10px] font-medium">Menu</span>
            {showMore && (
               <div className="absolute top-0 w-8 h-0.5 rounded-b-full bg-[var(--accent)] animate-fade-in" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
