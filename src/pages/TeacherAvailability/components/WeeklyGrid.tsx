import { Monitor, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TeacherAvailabilityDTO } from '@/types';

interface WeeklyGridProps {
  availability: TeacherAvailabilityDTO[];
}

const HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 6; // 06:00 to 21:00
  return `${h.toString().padStart(2, '0')}:00`;
});

function isSlotCovered(day: number, hour: string, slots: TeacherAvailabilityDTO[]): TeacherAvailabilityDTO | undefined {
  return slots.find((s) => s.day_of_week === day && s.start_time <= hour && s.end_time > hour);
}

export default function WeeklyGrid({ availability }: WeeklyGridProps) {
  const { t } = useTranslation('availability');
  const { t: tc } = useTranslation('common');

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-main)] bg-[var(--bg-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-main)] bg-[var(--bg-subtle)]">
              <th className="sticky left-0 z-10 px-4 py-3 text-left font-medium text-[var(--text-muted)] w-20 bg-[var(--bg-subtle)] font-[family-name:var(--font-display)]">
                {t('hours')}
              </th>
              {Array.from({ length: 7 }, (_, idx) => (
                <th
                  key={idx}
                  className="px-2 py-3 text-center font-medium text-[var(--text-muted)] min-w-[110px] font-[family-name:var(--font-display)]"
                >
                  {tc(`days.${idx}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr
                key={hour}
                className="border-b border-[var(--border-main)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                <td className="sticky left-0 z-10 px-4 py-2 text-xs text-[var(--text-dim)] font-mono bg-[var(--bg-surface)]">
                  {hour}
                </td>
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const slot = isSlotCovered(dayIdx, hour, availability);
                  return (
                    <td key={dayIdx} className="px-2 py-2 text-center">
                      {slot ? (
                        <div
                          className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                            slot.is_virtual
                              ? 'bg-[var(--virtual-bg)] text-[var(--virtual)] ring-1 ring-[var(--virtual-border)]'
                              : 'bg-[var(--presencial-bg)] text-[var(--presencial)] ring-1 ring-[var(--presencial-border)]'
                          }`}
                          title={`${slot.start_time} - ${slot.end_time} (${slot.is_virtual ? tc('bookingTypes.virtual') : tc('bookingTypes.presencial')})`}
                        >
                          {slot.is_virtual ? (
                            <span className="flex items-center justify-center gap-1">
                              <Monitor className="w-3 h-3" /> {tc('bookingTypes.virtual')}
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              <Building2 className="w-3 h-3" /> {tc('bookingTypes.presencial')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="h-7" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
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
