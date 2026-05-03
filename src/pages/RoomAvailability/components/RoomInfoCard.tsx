import { Building2, CalendarDays, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RoomAvailabilityResponse } from '@/types';
import { formatDate } from '@/utils';
import Badge from '@/components/ui/Badge';

interface RoomInfoCardProps {
  availability: RoomAvailabilityResponse;
}

export default function RoomInfoCard({ availability }: RoomInfoCardProps) {
  const { t } = useTranslation('rooms');

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-main)]">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
            {availability.room_name}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            <Users className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
            {t('capacity')}: {availability.room_capacity} {t('students')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="text-[var(--text-muted)]">
          <CalendarDays className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5 text-blue-400" />
          {formatDate(availability.start_date)} &ndash;{' '}
          {formatDate(availability.end_date)}
        </div>
        <Badge variant={availability.total_slots > 0 ? 'info' : 'default'}>
          {availability.total_slots}{' '}
          {availability.total_slots === 1 ? 'slot' : 'slots'}
        </Badge>
      </div>
    </div>
  );
}
