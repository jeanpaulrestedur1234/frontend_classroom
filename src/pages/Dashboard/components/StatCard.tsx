import Card from '@/components/ui/Card';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'sky' | 'emerald' | 'rose' | 'violet';
}

const colorMap: Record<StatCardProps['color'], { bg: string; text: string }> = {
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-500 dark:text-blue-400' },
  sky:     { bg: 'bg-sky-500/10',     text: 'text-sky-500 dark:text-sky-400' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-500 dark:text-rose-400' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-500 dark:text-violet-400' },
};

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <Card hover className="flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
          {value}
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-tight">{label}</p>
      </div>
    </Card>
  );
}
