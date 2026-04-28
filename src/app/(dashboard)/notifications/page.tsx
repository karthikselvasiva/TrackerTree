'use client';

import { useState, useEffect, useCallback } from 'react';
import { BellRing, Check, CheckCheck, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { getRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetch(); }, [fetch]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    fetch();
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    fetch();
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    fetch();
  };

  const unread = notifications.filter(n => !n.is_read).length;

  const typeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return '⏰';
      case 'insight': return '💡';
      case 'import': return '📥';
      default: return '🔔';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)]">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}><CheckCheck size={16}/> Mark all read</Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Card key={i} className="h-16 animate-shimmer"/>)}</div>
      ) : notifications.length === 0 ? (
        <Card className="text-center py-16">
          <BellRing size={40} className="mx-auto text-[var(--text-muted)] mb-3"/>
          <p className="text-sm text-[var(--text-muted)]">No notifications yet</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">You&apos;ll see payment reminders and insights here</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <Card
              key={n.id}
              className={cn('flex items-start gap-3 animate-fade-in', !n.is_read && 'border-l-4 border-l-[var(--accent)]')}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="text-xl mt-0.5">{typeIcon(n.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', n.is_read ? 'text-[var(--text-secondary)]' : 'font-semibold text-[var(--text-primary)]')}>{n.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.message}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{getRelativeTime(n.created_at)}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer" title="Mark read">
                    <Check size={14}/>
                  </button>
                )}
                <button onClick={() => deleteNotif(n.id)} className="p-1.5 rounded-lg hover:bg-[var(--danger-light)] text-[var(--text-muted)] cursor-pointer" title="Delete">
                  <Trash2 size={14}/>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
