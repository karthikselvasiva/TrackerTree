'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TreePine, ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-300 z-20',
        collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[var(--topbar-height)] border-b border-[var(--border)]">
        <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center flex-shrink-0">
          <TreePine size={20} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-[var(--text-primary)] whitespace-nowrap">
            TrackerTree
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <DynamicIcon
                name={item.icon}
                size={20}
                className={cn(isActive && 'text-[var(--accent)]')}
              />
              {!collapsed && <span>{item.name}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
