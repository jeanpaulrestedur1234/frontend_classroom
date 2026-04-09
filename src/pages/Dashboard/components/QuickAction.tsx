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
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:from-blue-400 hover:to-blue-500 hover:shadow-blue-500/30 active:scale-[0.98] font-[family-name:var(--font-display)]"
    >
      {icon}
      {label}
    </Link>
  );
}
