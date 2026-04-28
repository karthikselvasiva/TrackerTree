'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl text-sm',
              'bg-[var(--bg-tertiary)] border border-[var(--border)]',
              'text-[var(--text-primary)] placeholder-[var(--text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-[var(--danger)] focus:ring-[var(--danger)]',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
