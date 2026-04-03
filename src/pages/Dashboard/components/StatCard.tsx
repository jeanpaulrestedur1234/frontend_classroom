import Card from '@/components/ui/Card';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'amber' | 'sky' | 'emerald' | 'rose' | 'violet';
}

const colorMap: Record<StatCardProps['color'], { bg: string; text: string }> = {
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400' },
  sky:     { bg: 'bg-sky-500/10',      text: 'text-sky-400' },
  emerald: { bg: 'bg-emerald-500/10',  text: 'text-emerald-400' },
  rose:    { bg: 'bg-rose-500/10',     text: 'text-rose-400' },
  violet:  { bg: 'bg-violet-500/10',   text: 'text-violet-400' },
};

export default function StatCard({ icon, label, value, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <Card hover className="flex items-center gap-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-zinc-900 font-[family-name:var(--font-display)]">
          {value}
        </p>
        <p className="text-sm text-zinc-500 truncate">{label}</p>
      </div>
    </Card>
  );
}
