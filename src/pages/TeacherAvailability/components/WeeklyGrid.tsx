import { Monitor, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TeacherAvailabilityDTO } from '@/types';

interface WeeklyGridProps {
  availability: TeacherAvailabilityDTO[];
  onSlotClick?: (id: string) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 6; // 06:00 to 21:00
  return `${h.toString().padStart(2, '0')}:00`;
});

function getWeekStart(date: Date): Date {
  const copy = new Date(date);
  const dow = copy.getDay();
  const daysUntilNextMonday = (1 - dow + 7) % 7 || 7;
  copy.setDate(copy.getDate() + daysUntilNextMonday);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getDayDate(apiDay: number): string {
  const date = getWeekStart(new Date());
  date.setDate(date.getDate() + apiDay);
  return date.toISOString().split('T')[0];
}

function formatTime(t: string | undefined): string {
  return t ? t.slice(0, 5) : '';
}

function isSlotCovered(day: number, hour: string, slots: TeacherAvailabilityDTO[]): TeacherAvailabilityDTO | undefined {
  return slots.find((s) => s.day_of_week === day && formatTime(s.start_time) <= hour && formatTime(s.end_time) > hour);
}

export default function WeeklyGrid({ availability, onSlotClick }: WeeklyGridProps) {
  const { t } = useTranslation('availability');
  const { t: tc } = useTranslation('common');

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-main)] bg-[var(--bg-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-main)] bg-[var(--bg-subtle)]">
              <th className="sticky left-0 z-10 w-14 bg-[var(--bg-subtle)] px-3 py-3 text-left font-medium text-[var(--text-muted)] font-[family-name:var(--font-display)]" />
              {Array.from({ length: 7 }, (_, idx) => (
                <th
                  key={idx}
                  className="min-w-[100px] px-2 py-3 text-center font-medium text-[var(--text-body)] font-[family-name:var(--font-display)]"
                >
                  {tc(`days.${idx}`)}
                  <div className="text-xs font-normal text-[var(--text-muted)] mt-0.5">
                    {new Date(getDayDate(idx) + 'T12:00:00').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => {
              const rowHasAny = Array.from({ length: 7 }, (_, d) =>
                isSlotCovered(d, hour, availability)
              ).some(Boolean);

              if (!rowHasAny) return null;

              return (
                <tr
                  key={hour}
                  className="border-b border-[var(--border-main)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <td className="sticky left-0 z-10 bg-[var(--bg-surface)] px-3 py-2 font-mono text-xs text-[var(--text-muted)] border-r border-[var(--border-main)]">
                    {formatTime(hour)}
                  </td>
                  {Array.from({ length: 7 }, (_, dayIdx) => {
                    const slot = isSlotCovered(dayIdx, hour, availability);
                    return (
                      <td key={dayIdx} className="px-1.5 py-1.5 text-center">
                        {slot ? (
                          <div
                            onClick={() => onSlotClick && onSlotClick(slot.id)}
                            className={`w-full rounded-lg px-1.5 py-2 text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${onSlotClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'} ${slot.is_virtual
                                ? 'bg-sky-400/15 text-sky-500 ring-1 ring-sky-500/20'
                                : 'bg-amber-400/15 text-amber-600 ring-1 ring-amber-500/20'
                              }`}
                            title={`${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)} (${slot.is_virtual ? tc('bookingTypes.virtual') : tc('bookingTypes.presencial')})`}
                          >
                            {slot.is_virtual ? (
                              <Monitor className="w-3 h-3" />
                            ) : (
                              <Building2 className="w-3 h-3" />
                            )}
                            <span className="flex items-center justify-center gap-0.5 leading-tight">
                              {slot.is_virtual ? tc('bookingTypes.virtual') : tc('bookingTypes.presencial')}
                            </span>
                          </div>
                        ) : (
                          <div className="h-10" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {availability.length > 0 && (
        <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[var(--virtual-bg)] ring-1 ring-[var(--virtual-border)]" />
            <span>{t('legend.virtual')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[var(--presencial-bg)] ring-1 ring-[var(--presencial-border)]" />
            <span>{t('legend.presencial')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
