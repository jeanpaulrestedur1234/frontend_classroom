interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  warning: 'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20',
  danger: 'bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20',
  info: 'bg-sky-500/10 text-sky-400 ring-1 ring-inset ring-sky-500/20',
  default: 'bg-white/5 text-zinc-400 ring-1 ring-inset ring-white/10',
};

export default function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
