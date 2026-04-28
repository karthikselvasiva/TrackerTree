'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, className, hoverable = false, style }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card p-5',
        hoverable && 'hover:shadow-lg cursor-pointer',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
