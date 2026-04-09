interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'virtual' | 'presencial';
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  success:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  warning:    'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/30',
  danger:     'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-500/20',
  info:       'bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-inset ring-sky-500/20',
  default:    'bg-[var(--bg-subtle)] text-[var(--text-muted)] ring-1 ring-inset ring-[var(--border-strong)]',
  virtual:    'bg-[var(--virtual-bg)] text-[var(--virtual)] ring-1 ring-inset ring-[var(--virtual-border)]',
  presencial: 'bg-[var(--presencial-bg)] text-[var(--presencial)] ring-1 ring-inset ring-[var(--presencial-border)]',
};

export default function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
