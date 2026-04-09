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
      <div className="overflow-x-auto rounded-2xl border border-zinc-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-white/[0.04]">
              <th className="sticky left-0 z-10 px-4 py-3 text-left font-medium text-zinc-400 w-20 bg-white font-[family-name:var(--font-display)]">
                {t('hours')}
              </th>
              {Array.from({ length: 7 }, (_, idx) => (
                <th
                  key={idx}
                  className="px-2 py-3 text-center font-medium text-zinc-400 min-w-[110px] font-[family-name:var(--font-display)]"
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
                className="border-b border-white/[0.04] bg-zinc-50/50 hover:bg-white/[0.04] transition-colors"
              >
                <td className="sticky left-0 z-10 px-4 py-2 text-xs text-zinc-500 font-mono bg-white">
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
                              ? 'bg-sky-400/15 text-sky-400 ring-1 ring-sky-500/20'
                              : 'bg-blue-400/15 text-blue-400 ring-1 ring-blue-500/20'
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
        <div className="flex items-center gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-sky-400/15 ring-1 ring-sky-500/20" />
            <span>{t('legend.virtual')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-400/15 ring-1 ring-blue-500/20" />
            <span>{t('legend.presencial')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
