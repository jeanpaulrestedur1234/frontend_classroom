import { Monitor, Building2, Users, Lock, CheckCircle2, Clock } from 'lucide-react';
import type { TeacherBookingAvailabilityDTO, AvailabilitySlot } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 7; // 07:00 to 21:00
  return `${h.toString().padStart(2, '0')}:00`;
});

const TIME_SLOTS = HOURS.map((h) => ({ value: h, label: h }));

/** Returns the start-of-next-week Monday */
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

/**
 * For a given (day, hour) cell, find the matching slot in the new API response.
 * The new shape: availability[] → .slots[] with start_time/end_time ranges.
 */
function findSlot(
  day: number,
  hour: string,
  availability: TeacherBookingAvailabilityDTO[],
): AvailabilitySlot | undefined {
  for (const avail of availability) {
    if (avail.day_of_week !== day) continue;
    const slot = avail.slots.find(
      (s) => s.start_time <= hour && s.end_time > hour,
    );
    if (slot) return slot;
  }
  return undefined;
}

function formatTime(t: string) {
  return t.slice(0, 5); // "08:00:00" → "08:00"
}

interface SlotCellProps {
  slot: AvailabilitySlot;
  selected: boolean;
  isPast: boolean;
  onClick: () => void;
}

function SlotCell({ slot, selected, isPast, onClick }: SlotCellProps) {
  const isBooked = slot.is_booked;
  const studentCount = slot.booking?.student_count ?? 0;

  if (isPast) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-lg px-1.5 py-2 text-xs font-medium cursor-not-allowed bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200 flex flex-col items-center gap-0.5"
      >
        <Clock className="w-3 h-3" />
        <span>Past</span>
      </button>
    );
  }

  if (isBooked) {
    return (
      <div
        className="w-full rounded-lg px-1.5 py-2 text-xs font-medium bg-rose-50 text-rose-600 ring-1 ring-rose-200 flex flex-col items-center gap-0.5 cursor-not-allowed"
        title={slot.booking?.students.map((s) => s.student_name).join(', ')}
      >
        <Lock className="w-3 h-3" />
        <span className="flex items-center gap-0.5">
          <Users className="w-2.5 h-2.5" />
          {studentCount}
        </span>
      </div>
    );
  }

  // Free slot
  const isVirtual = slot.is_virtual;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg px-1.5 py-2 text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
        selected
          ? isVirtual
            ? 'bg-sky-500/30 text-sky-700 ring-2 ring-sky-500 ring-offset-1'
            : 'bg-amber-500/30 text-amber-700 ring-2 ring-amber-500 ring-offset-1'
          : isVirtual
          ? 'bg-sky-400/15 text-sky-500 ring-1 ring-sky-500/20 hover:bg-sky-400/30 hover:ring-sky-500/40'
          : 'bg-amber-400/15 text-amber-600 ring-1 ring-amber-500/20 hover:bg-amber-400/30 hover:ring-amber-500/40'
      }`}
    >
      {selected ? (
        <>
          <CheckCircle2 className="w-3 h-3" />
          <span>Selected</span>
        </>
      ) : isVirtual ? (
        <>
          <Monitor className="w-3 h-3" />
          <span>Free</span>
        </>
      ) : (
        <>
          <Building2 className="w-3 h-3" />
          <span>Free</span>
        </>
      )}
    </button>
  );
}

export function StepDateTime({
  t,
  tc,
  teacherAvailability,
  loading,
  scheduledDate,
  setScheduledDate,
  startTime,
  setStartTime,
  bookingType,
}: any) {
  const filteredAvailability: TeacherBookingAvailabilityDTO[] = teacherAvailability.filter(
    (a: TeacherBookingAvailabilityDTO) => a.is_virtual === (bookingType === 'virtual'),
  );

  const hasAvailability = filteredAvailability.length > 0;

  // Stats for the legend
  const allSlots = filteredAvailability.flatMap((a) => a.slots);
  const freeCount = allSlots.filter((s) => !s.is_booked).length;
  const bookedCount = allSlots.filter((s) => s.is_booked).length;

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
        <div className="space-y-4">
          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              <span>{freeCount} slot{freeCount !== 1 ? 's' : ''} free</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-rose-600 ring-1 ring-rose-200">
              <Lock className="w-3 h-3" />
              <span>{bookedCount} booked</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 ml-auto">
              {bookingType === 'virtual' ? (
                <><Monitor className="w-3 h-3" /><span>Virtual sessions</span></>
              ) : (
                <><Building2 className="w-3 h-3" /><span>In-person sessions</span></>
              )}
            </div>
          </div>

          {/* Calendar grid */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="sticky left-0 z-10 w-14 bg-zinc-50 px-3 py-3 text-left font-medium text-zinc-400 font-[family-name:var(--font-display)]" />
                  {Array.from({ length: 7 }, (_, idx) => (
                    <th
                      key={idx}
                      className="min-w-[100px] px-2 py-3 text-center font-medium text-zinc-600 font-[family-name:var(--font-display)]"
                    >
                      {tc(`days.${idx}`)}
                      <div className="text-xs font-normal text-zinc-400 mt-0.5">
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
                  // Only render rows that have at least one slot across all days
                  const rowHasAny = Array.from({ length: 7 }, (_, d) =>
                    findSlot(d, hour, filteredAvailability),
                  ).some(Boolean);

                  if (!rowHasAny) return null;

                  return (
                    <tr key={hour} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 transition-colors">
                      <td className="sticky left-0 z-10 bg-white px-3 py-2 font-mono text-xs text-zinc-400 border-r border-zinc-100">
                        {hour}
                      </td>
                      {Array.from({ length: 7 }, (_, dayIdx) => {
                        const slot = findSlot(dayIdx, hour, filteredAvailability);
                        const dayDate = getDayDate(dayIdx);
                        const selected = scheduledDate === dayDate && startTime === hour;
                        const slotTime = new Date(`${dayDate}T${hour}:00`);
                        const isPast = slotTime.getTime() - Date.now() < 24 * 60 * 60 * 1000;

                        return (
                          <td key={dayIdx} className="px-1.5 py-1.5 text-center">
                            {slot ? (
                              <SlotCell
                                slot={slot}
                                selected={selected}
                                isPast={isPast}
                                onClick={() => {
                                  setScheduledDate(dayDate);
                                  setStartTime(hour);
                                }}
                              />
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-amber-400/20 ring-1 ring-amber-400/40" />
              <span>Free — presencial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-sky-400/20 ring-1 ring-sky-400/40" />
              <span>Free — virtual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-rose-100 ring-1 ring-rose-200" />
              <span>Booked (shows student count)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-zinc-100 ring-1 ring-zinc-200" />
              <span>Past / unavailable</span>
            </div>
          </div>

          {/* Selection confirmation */}
          {scheduledDate && startTime && (
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  {t('create.choice')}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {new Date(scheduledDate + 'T12:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' '}·{' '}
                  {formatTime(startTime + ':00')}
                  {bookingType === 'virtual' ? ' — Virtual' : ' — Presencial'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback: no availability configured, manual entry */
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
