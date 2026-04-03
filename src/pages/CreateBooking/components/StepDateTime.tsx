import { useMemo } from 'react';
import type { TeacherAvailabilityDTO } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 7; // 07:00 to 21:00
  const hh = hour.toString().padStart(2, '0');
  return { value: `${hh}:00`, label: `${hh}:00` };
});

const WEEK_DAYS: Array<{ apiDay: number; key: number }> = [
  { apiDay: 0, key: 0 },
  { apiDay: 1, key: 1 },
  { apiDay: 2, key: 2 },
  { apiDay: 3, key: 3 },
  { apiDay: 4, key: 4 },
  { apiDay: 5, key: 5 },
  { apiDay: 6, key: 6 },
];

function getWeekStart(date: Date): Date {
  const copy = new Date(date);
  const dow = copy.getDay();
  const diff = dow === 0 ? -6 : 1 - dow; // Monday first
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getDayFromApiDay(apiDay: number): string {
  const date = getWeekStart(new Date());
  date.setDate(date.getDate() + apiDay);
  return date.toISOString().split('T')[0];
}

function toOneHourSlots(start: string, end: string): string[] {
  const startHour = Number(start.split(':')[0]);
  const endHour = Number(end.split(':')[0]);
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h += 1) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

export function StepDateTime({ t, tc, teacherAvailability, loading, scheduledDate, setScheduledDate, startTime, setStartTime }: any) {
  const availabilityByDay = useMemo(() => {
    const grouped: Record<number, TeacherAvailabilityDTO[]> = {};
    teacherAvailability?.forEach((item: TeacherAvailabilityDTO) => {
      if (!grouped[item.day_of_week]) grouped[item.day_of_week] = [];
      grouped[item.day_of_week].push(item);
    });
    return grouped;
  }, [teacherAvailability]);

  const hasAvailability = Object.keys(availabilityByDay).length > 0;

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.datetime')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">
        {hasAvailability
          ? t('create.selectAvailability')
          : t('create.selectDate')}
      </p>

      {loading ? (
        <LoadingSpinner />
      ) : hasAvailability ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {WEEK_DAYS.map(({ apiDay }) => {
              const day = getDayFromApiDay(apiDay);
              const formatted = new Date(day).toLocaleDateString('es-CO', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              return (
                <div key={apiDay} className="rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-center text-xs font-semibold text-zinc-600">
                  {tc(`days.${apiDay}`)}
                  <div className="text-zinc-400">{formatted}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {WEEK_DAYS.flatMap(({ apiDay }) => {
              const ranges = availabilityByDay[apiDay] ?? [];
              return ranges.flatMap((range) => {
                const slots = toOneHourSlots(range.start_time, range.end_time);
                return slots.map((slot) => {
                  const dayDate = getDayFromApiDay(apiDay);
                  const selected = scheduledDate === dayDate && startTime === slot;
                  return (
                    <button
                      key={`${apiDay}-${slot}`}
                      type="button"
                      onClick={() => {
                        setScheduledDate(dayDate);
                        setStartTime(slot);
                      }}
                      className={`block rounded-lg border p-2 text-left text-xs transition ${
                        selected
                          ? 'border-amber-500 bg-amber-100 text-amber-700'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <div className="font-semibold">{tc(`days.${apiDay}`)} {slot}</div>
                      <div className="text-zinc-500">{range.is_virtual ? tc('bookingTypes.virtual') : tc('bookingTypes.presencial')}</div>
                    </button>
                  );
                });
              });
            })}
          </div>

          {scheduledDate && startTime && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {t('create.choice')} {scheduledDate} - {startTime}
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
