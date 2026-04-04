import { Monitor, Building2 } from 'lucide-react';
import type { TeacherAvailabilityDTO } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 7; // 07:00 to 21:00
  return `${h.toString().padStart(2, '0')}:00`;
});

const TIME_SLOTS = HOURS.map((h) => ({ value: h, label: h }));

function getWeekStart(date: Date): Date {
  const copy = new Date(date);
  const dow = copy.getDay(); // 0=Sun, 1=Mon … 6=Sat
  // Days until next Monday: (1 - dow + 7) % 7, but if result is 0 (today is Monday) use 7
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

function getSlot(day: number, hour: string, avail: TeacherAvailabilityDTO[]): TeacherAvailabilityDTO | undefined {
  return avail.find((s) => s.day_of_week === day && s.start_time <= hour && s.end_time > hour);
}

export function StepDateTime({
  t, tc, teacherAvailability, loading, scheduledDate, setScheduledDate, startTime, setStartTime,
}: any) {
  const hasAvailability = (teacherAvailability?.length ?? 0) > 0;

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.datetime')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">
        {hasAvailability ? t('create.selectAvailability') : t('create.selectDate')}
      </p>

      {loading ? (
        <LoadingSpinner />
      ) : hasAvailability ? (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-zinc-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-white/[0.04]">
                  <th className="sticky left-0 z-10 w-16 bg-white px-4 py-3 text-left font-medium text-zinc-400 font-[family-name:var(--font-display)]" />
                  {Array.from({ length: 7 }, (_, idx) => (
                    <th key={idx} className="min-w-[110px] px-2 py-3 text-center font-medium text-zinc-400 font-[family-name:var(--font-display)]">
                      {tc(`days.${idx}`)}
                      <div className="text-xs font-normal text-zinc-400/70">
                        {new Date(getDayDate(idx) + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="border-b border-white/[0.04] bg-zinc-50/50 transition-colors hover:bg-white/[0.04]">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2 font-mono text-xs text-zinc-500">
                      {hour}
                    </td>
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      const slot = getSlot(dayIdx, hour, teacherAvailability);
                      const dayDate = getDayDate(dayIdx);
                      const selected = scheduledDate === dayDate && startTime === hour;
                      const slotTime = new Date(`${dayDate}T${hour}:00`);
                      const isPast = slotTime.getTime() - Date.now() < 24 * 60 * 60 * 1000;
                      return (
                        <td key={dayIdx} className="px-2 py-2 text-center">
                          {slot ? (
                            <button
                              type="button"
                              disabled={isPast}
                              onClick={() => { setScheduledDate(dayDate); setStartTime(hour); }}
                              className={`w-full rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                                isPast
                                  ? 'cursor-not-allowed bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200'
                                  : selected
                                  ? slot.is_virtual
                                    ? 'bg-sky-500/30 text-sky-700 ring-2 ring-sky-500 ring-offset-1'
                                    : 'bg-amber-500/30 text-amber-700 ring-2 ring-amber-500 ring-offset-1'
                                  : slot.is_virtual
                                    ? 'bg-sky-400/15 text-sky-400 ring-1 ring-sky-500/20 hover:bg-sky-400/30'
                                    : 'bg-amber-400/15 text-amber-400 ring-1 ring-amber-500/20 hover:bg-amber-400/30'
                              }`}
                            >
                              <span className="flex items-center justify-center gap-1">
                                {slot.is_virtual ? (
                                  <><Monitor className="w-3 h-3" />{tc('bookingTypes.virtual')}</>
                                ) : (
                                  <><Building2 className="w-3 h-3" />{tc('bookingTypes.presencial')}</>
                                )}
                              </span>
                            </button>
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

          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-sky-400/15 ring-1 ring-sky-500/20" />
              <span>{tc('bookingTypes.virtual')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-amber-400/15 ring-1 ring-amber-500/20" />
              <span>{tc('bookingTypes.presencial')}</span>
            </div>
          </div>

          {scheduledDate && startTime && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {t('create.choice')} {scheduledDate} — {startTime}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <Input
            label={t('create.selectDate')}
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
          <Select
            label={t('create.selectTime')}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            options={TIME_SLOTS}
          />
        </div>
      )}
    </div>
  );
}
