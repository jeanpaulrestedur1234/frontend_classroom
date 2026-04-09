interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 ring-1 ring-inset ring-rose-500/20',
  info: 'bg-[var(--virtual-bg)] text-[var(--virtual)] ring-1 ring-inset ring-[var(--virtual)]/20',
  default: 'bg-[var(--presencial-bg)] text-[var(--presencial)] ring-1 ring-inset ring-[var(--presencial)]/20',
};

export default function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
