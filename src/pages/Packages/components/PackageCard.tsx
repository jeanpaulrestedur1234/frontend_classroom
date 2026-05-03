import { Clock, CalendarDays, Percent } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { PackageDTO, ClassType } from '@/types';
import { formatCurrency } from '@/utils';

interface PackageCardProps {
  pkg: PackageDTO;
  children?: React.ReactNode;
}

function classTypeBadgeVariant(ct: ClassType): 'info' | 'success' | 'warning' {
  switch (ct) {
    case 'open_group': return 'info';
    case 'closed_group': return 'success';
    case 'private': return 'warning';
  }
}

export default function PackageCard({ pkg, children }: PackageCardProps) {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const finalPrice =
    pkg.discount_pct > 0 ? pkg.base_price * (1 - pkg.discount_pct / 100) : pkg.base_price;

  return (
    <Card hover className="flex flex-col gap-4 relative overflow-hidden">
      {/* Subtle gold accent line at top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="flex items-center justify-between">
        <Badge variant={classTypeBadgeVariant(pkg.class_type)}>{tc(`classTypes.${pkg.class_type}`)}</Badge>
        {pkg.discount_pct > 0 && (
          <Badge variant="danger">
            <Percent className="mr-1 h-3 w-3 inline" />
            {pkg.discount_pct}% OFF
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Clock className="h-4 w-4 text-zinc-400" />
          <span>{t('catalog.hoursPerWeek', { hours: pkg.hours_per_week })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <CalendarDays className="h-4 w-4 text-zinc-400" />
          <span>{t('catalog.weeks', { weeks: pkg.duration_weeks })}</span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-zinc-100">
        {pkg.discount_pct > 0 ? (
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-400 font-[family-name:var(--font-display)]">
              {formatCurrency(finalPrice)}
            </span>
            <span className="text-sm text-zinc-400 line-through">{formatCurrency(pkg.base_price)}</span>
          </div>
        ) : (
          <span className="text-xl font-bold text-zinc-950 font-[family-name:var(--font-display)]">
            {formatCurrency(pkg.base_price)}
          </span>
        )}
      </div>

      {children && <div className="mt-2">{children}</div>}
    </Card>
  );
}
