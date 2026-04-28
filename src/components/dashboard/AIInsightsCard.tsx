'use client';

import { Sparkles, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';

interface AIInsightsCardProps {
  insights: string[];
  loading: boolean;
  onRefresh: () => void;
}

export default function AIInsightsCard({ insights, loading, onRefresh }: AIInsightsCardProps) {
  return (
    <Card className="animate-fade-in border-[var(--accent)]/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">AI Insights</h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          title="Refresh insights"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="space-y-3">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-5 rounded-lg animate-shimmer" />
            ))}
          </>
        ) : insights.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Add more transactions to get insights</p>
        ) : (
          insights.map((insight, i) => (
            <div
              key={i}
              className="text-sm text-[var(--text-secondary)] leading-relaxed p-2.5 rounded-xl bg-[var(--bg-tertiary)] animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {insight}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
