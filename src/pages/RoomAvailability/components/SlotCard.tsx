import { Clock, User, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RoomAvailabilitySlot } from '@/types';
import Badge from '@/components/ui/Badge';

/* ── helpers ── */

function occupancyPct(studentCount: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(Math.round((studentCount / capacity) * 100), 100);
}

function occupancyBarColor(pct: number): string {
  if (pct >= 90) return 'bg-rose-500';
  if (pct >= 60) return 'bg-blue-500';
  return 'bg-emerald-500';
}

function occupancyTextColor(pct: number): string {
  if (pct >= 90) return 'text-rose-400';
  if (pct >= 60) return 'text-blue-400';
  return 'text-emerald-400';
}

/* ── types ── */

function statusBadgeVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    case 'completed':
      return 'info';
    default:
      return 'default';
  }
}

function bookingTypeBadgeVariant(
  type: string,
): 'info' | 'warning' {
  return type === 'virtual' ? 'info' : 'warning';
}

/* ── component ── */

interface SlotCardProps {
  slot: RoomAvailabilitySlot;
  capacity: number;
}

export default function SlotCard({ slot, capacity }: SlotCardProps) {
  const { t } = useTranslation('rooms');
  const { t: tc } = useTranslation('common');

  const pct = occupancyPct(slot.student_count, capacity);
  const remaining = Math.max(capacity - slot.student_count, 0);
  const isFull = remaining === 0;

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-colors"
    >
      {/* Time range */}
      <div className="flex items-center gap-3 sm:w-40 shrink-0">
        <div
          className={`w-1.5 h-10 rounded-full ${occupancyBarColor(pct)}`}
        />
        <div>
          <p className="text-sm font-medium text-zinc-900 font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            {slot.start_time} - {slot.end_time}
          </p>
        </div>
      </div>

      {/* Teacher */}
      <div className="sm:w-44 shrink-0">
        <p className="text-xs text-zinc-500 mb-0.5">
          {tc('roles.teacher')}
        </p>
        <p className="text-sm text-zinc-700 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-zinc-500" />
          {slot.teacher_name ?? slot.teacher_id}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 sm:w-44 shrink-0">
        <Badge variant={bookingTypeBadgeVariant(slot.booking_type)}>
          {tc(`bookingTypes.${slot.booking_type}`)}
        </Badge>
        <Badge variant={statusBadgeVariant(slot.status)}>
          {tc(`status.${slot.status}`)}
        </Badge>
      </div>

      {/* Occupancy progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Users className="w-3 h-3" />
            <span>
              {slot.student_count} / {capacity}
            </span>
          </div>
          <span
            className={`text-xs font-semibold ${occupancyTextColor(pct)}`}
          >
            {pct}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${occupancyBarColor(pct)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={`text-xs mt-1 ${occupancyTextColor(pct)}`}>
          {isFull
            ? t('availability.full')
            : `${remaining} ${t('availability.remaining')}`}
        </p>
      </div>
    </div>
  );
}
