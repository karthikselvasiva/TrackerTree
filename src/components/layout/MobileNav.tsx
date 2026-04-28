'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { cn } from '@/lib/utils';

const MOBILE_NAV = [
  { name: 'Home', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Txns', href: '/transactions', icon: 'ArrowLeftRight' },
  { name: 'Reports', href: '/reports', icon: 'BarChart3' },
  { name: 'More', href: '/settings', icon: 'Menu' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--border)] px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] mobile-safe-bottom">
      <div className="flex items-center justify-around">
        {MOBILE_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-xl transition-all duration-200 min-w-[56px]',
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-muted)] active:scale-95'
              )}
            >
              <DynamicIcon name={item.icon} size={20} />
              <span className="text-[10px] font-medium">{item.name}</span>
              {isActive && (
                <div className="w-4 h-0.5 rounded-full bg-[var(--accent)] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
