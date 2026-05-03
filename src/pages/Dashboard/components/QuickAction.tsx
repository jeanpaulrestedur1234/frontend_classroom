import { Link } from 'react-router-dom';

export interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

export default function QuickAction({ icon, label, to }: QuickActionProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:opacity-90 hover:shadow-black/20 active:scale-[0.98] font-[family-name:var(--font-display)]"
    >
      {icon}
      {label}
    </Link>
  );
}
