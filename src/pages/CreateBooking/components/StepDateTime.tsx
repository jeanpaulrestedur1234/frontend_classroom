import { Monitor, Building2, Users, Lock, CheckCircle2, Clock, Info, BadgeCheck } from 'lucide-react';
import type { TeacherBookingAvailabilityDTO, AvailabilitySlot } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = i + 7; // 07:00 to 21:00
  return `${h.toString().padStart(2, '0')}:00`;
});

const TIME_SLOTS = HOURS.map((h) => ({ value: h, label: h }));

/** Returns the Monday of the current week (or next Monday if today is Sunday). */
function getWeekStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay(); // 0=Sun
  const diff = day === 0 ? 1 : 1 - day; // advance to Monday
  today.setDate(today.getDate() + diff);
  return today;
}

/** Format a Date as YYYY-MM-DD without timezone shift. */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Get the ISO date for a given day_of_week (0=Mon … 6=Sun) in the current week. */
function calcDayDate(dayOfWeek: number): string {
  const base = getWeekStart();
  base.setDate(base.getDate() + dayOfWeek);
  return toISODate(base);
}


function formatTime(t: string) {
  return t.slice(0, 5);
}

// ─── Slot state resolution ────────────────────────────────────────────────────

type SlotState =
  | { kind: 'past' }
  | { kind: 'free' }
  | { kind: 'already_booked'; count: number }           // current user is already in this slot
  | { kind: 'virtual_booked'; count: number }           // virtual: show count, still bookable
  | { kind: 'presencial_available'; count: number; capacity: number; roomName: string } // same room, has space
  | { kind: 'presencial_full'; count: number; capacity: number; roomName: string }      // same room, full
  | { kind: 'wrong_room'; roomName: string }            // booked in a different room
  | { kind: 'wrong_type' }                              // slot is for different booking type
  | { kind: 'no_room_selected' };                       // presencial but no room chosen yet

function resolveSlotState(
  slot: AvailabilitySlot,
  isVirtual: boolean,
  roomId: string,
  isPast: boolean,
): SlotState {
  if (isPast) return { kind: 'past' };

  if (!slot.is_booked) {
    if (slot.is_virtual !== isVirtual) return { kind: 'wrong_type' };
    if (!isVirtual && !roomId) return { kind: 'no_room_selected' };
    return { kind: 'free' };
  }

  const booking = slot.booking!;

  // Backend tells us directly if the current user is enrolled
  if (booking.is_enrolled) {
    return { kind: 'already_booked', count: booking.student_count };
  }

  // Use booking.room to determine the actual booking type —
  // NOT slot.is_virtual, which reflects availability config, not the booking itself.
  const bookingIsPresencial = booking.room !== null;

  if (!bookingIsPresencial) {
    // Pure virtual: always joinable, just show occupancy
    return { kind: 'virtual_booked', count: booking.student_count };
  }

  // Presencial: check room match and capacity
  const room = booking.room!;
  const selectedRoomId = parseInt(roomId, 10);

  if (room.id !== selectedRoomId) {
    return { kind: 'wrong_room', roomName: room.name };
  }

  if (booking.student_count < room.capacity) {
    return {
      kind: 'presencial_available',
      count: booking.student_count,
      capacity: room.capacity,
      roomName: room.name,
    };
  }

  return {
    kind: 'presencial_full',
    count: booking.student_count,
    capacity: room.capacity,
    roomName: room.name,
  };
}

// ─── Slot cell ────────────────────────────────────────────────────────────────

interface SlotCellProps {
  slot: AvailabilitySlot;
  state: SlotState;
  selected: boolean;
  onClick: () => void;
}

function SlotCell({ slot, state, selected, onClick }: SlotCellProps) {
  const isVirtual = slot.is_virtual;

  switch (state.kind) {
    case 'already_booked':
      return (
        <div
          title={`You are enrolled · ${state.count} student${state.count !== 1 ? 's' : ''} total`}
          className="w-full rounded-lg px-1.5 py-2 text-xs font-semibold bg-emerald-500/15 text-emerald-500 ring-2 ring-emerald-500/50 flex flex-col items-center gap-0.5 cursor-default"
        >
          <BadgeCheck className="w-3.5 h-3.5" />
          <span className="leading-tight text-center">You're in</span>
        </div>
      );

    case 'past':
      return (
        <div className="w-full rounded-lg px-1.5 py-2 text-xs font-medium cursor-not-allowed bg-[var(--bg-subtle)] text-[var(--text-dim)] ring-1 ring-[var(--border-main)] flex flex-col items-center gap-0.5">
          <Clock className="w-3 h-3" />
          <span>Past</span>
        </div>
      );

    case 'wrong_room':
      return (
        <div
          title={`Booked in: ${state.roomName}`}
          className="w-full rounded-lg px-1.5 py-2 text-xs font-medium cursor-not-allowed bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/30 flex flex-col items-center gap-0.5 overflow-hidden"
        >
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate w-full text-center leading-tight">{state.roomName}</span>
        </div>
      );

    case 'presencial_full':
      return (
        <div
          title={`${state.roomName} · ${state.count}/${state.capacity} students`}
          className="w-full rounded-lg px-1.5 py-2 text-xs font-medium cursor-not-allowed bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/30 flex flex-col items-center gap-0.5"
        >
          <Lock className="w-3 h-3" />
          <span className="flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {state.count}/{state.capacity}
          </span>
        </div>
      );

    case 'presencial_available':
      return (
        <button
          type="button"
          onClick={onClick}
          title={`${state.roomName} · ${state.count}/${state.capacity} students`}
          className={`w-full rounded-lg px-1.5 py-2 text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${selected
              ? 'bg-amber-500/30 text-amber-700 ring-2 ring-amber-500 ring-offset-1'
              : 'bg-amber-400/15 text-amber-600 ring-1 ring-amber-500/20 hover:bg-amber-400/30 hover:ring-amber-500/40'
            }`}
        >
          {selected ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <Building2 className="w-3 h-3" />
          )}
          <span className="flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {state.count}/{state.capacity}
          </span>
        </button>
      );

    case 'virtual_booked':
      return (
        <button
          type="button"
          onClick={onClick}
          title={`${state.count} student${state.count !== 1 ? 's' : ''} already booked`}
          className={`w-full rounded-lg px-1.5 py-2 text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${selected
              ? 'bg-sky-500/30 text-sky-700 ring-2 ring-sky-500 ring-offset-1'
              : 'bg-sky-400/15 text-sky-500 ring-1 ring-sky-500/20 hover:bg-sky-400/30 hover:ring-sky-500/40'
            }`}
        >
          {selected ? <CheckCircle2 className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
          <span className="flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {state.count}
          </span>
        </button>
      );

    case 'no_room_selected':
      return (
        <div className="w-full rounded-lg px-1.5 py-2 text-xs font-medium cursor-default bg-[var(--bg-subtle)] text-[var(--text-dim)] ring-1 ring-[var(--border-main)] flex flex-col items-center gap-0.5">
          <Building2 className="w-3 h-3" />
          <span>—</span>
        </div>
      );

    case 'wrong_type':
      return (
        <div className="w-full rounded-lg px-1.5 py-2 text-xs cursor-not-allowed opacity-30 bg-[var(--bg-subtle)] text-[var(--text-dim)] ring-1 ring-dashed ring-[var(--border-main)] flex flex-col items-center gap-0.5">
          <span>·</span>
        </div>
      );

    case 'free':
    default:
      return (
        <button
          type="button"
          onClick={onClick}
          className={`w-full rounded-lg px-1.5 py-2 text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${selected
              ? isVirtual
                ? 'bg-sky-500/30 text-sky-700 ring-2 ring-sky-500 ring-offset-1'
                : 'bg-amber-500/30 text-amber-700 ring-2 ring-amber-500 ring-offset-1'
              : isVirtual
                ? 'bg-sky-400/15 text-sky-500 ring-1 ring-sky-500/20 hover:bg-sky-400/30 hover:ring-sky-500/40'
                : 'bg-amber-400/15 text-amber-600 ring-1 ring-amber-500/20 hover:bg-amber-400/30 hover:ring-amber-500/40'
            }`}
        >
          {selected ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : isVirtual ? (
            <Monitor className="w-3 h-3" />
          ) : (
            <Building2 className="w-3 h-3" />
          )}
          <span>{selected ? 'Selected' : 'Free'}</span>
        </button>
      );
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

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
  roomId = '',
}: any) {
  const isVirtual = bookingType === 'virtual';

  // Show ALL availability (both virtual and presencial) so the calendar always has
  // consistent columns. resolveSlotState handles whether individual slots are bookable.
  const filteredAvailability: TeacherBookingAvailabilityDTO[] = teacherAvailability;

  const hasAvailability = filteredAvailability.length > 0;

  // Compute stats
  const allSlots = filteredAvailability.flatMap((a) => a.slots);
  const freeCount = allSlots.filter((s) => !s.is_booked).length;
  const bookedCount = allSlots.filter((s) => s.is_booked).length;

  // Show a hint when presencial without a room selected
  const showRoomHint = !isVirtual && !roomId && hasAvailability;

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.datetime')}
      </h2>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        {hasAvailability ? t('create.selectAvailability') : t('create.selectDate')}
      </p>

      {showRoomHint && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-500">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Go back and select a room first — availability depends on your chosen room's capacity.</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : hasAvailability ? (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-500 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>{freeCount} slot{freeCount !== 1 ? 's' : ''} free</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-rose-500 ring-1 ring-rose-500/30">
              <Lock className="w-3 h-3" />
              <span>{bookedCount} occupied</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] ml-auto">
              {isVirtual ? (
                <><Monitor className="w-3 h-3" /><span>Virtual sessions</span></>
              ) : (
                <><Building2 className="w-3 h-3" /><span>In-person sessions</span></>
              )}
            </div>
          </div>

          {/* Calendar grid */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-main)] shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-main)] bg-[var(--bg-subtle)]">
                  <th className="sticky left-0 z-10 w-14 bg-[var(--bg-subtle)] px-3 py-3 text-left font-medium text-[var(--text-muted)] font-[family-name:var(--font-display)]" />
                  {Array.from({ length: 7 }, (_, dayIdx) => {
                    // Use the date from the API if this day has availability, else compute it
                    const avail = filteredAvailability.find((a) => a.day_of_week === dayIdx);
                    const date = avail ? avail.date : calcDayDate(dayIdx);
                    return (
                      <th
                        key={dayIdx}
                        className="min-w-[100px] px-2 py-3 text-center font-medium text-[var(--text-body)] font-[family-name:var(--font-display)]"
                      >
                        {tc(`days.${dayIdx}`)}
                        <div className="text-xs font-normal text-[var(--text-muted)] mt-0.5">
                          {new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => {
                  const rowHasAny = filteredAvailability.some((avail) =>
                    avail.slots.some((s) => s.start_time <= hour && s.end_time > hour),
                  );

                  if (!rowHasAny) return null;

                  return (
                    <tr
                      key={hour}
                      className="border-b border-[var(--border-main)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors"
                    >
                      <td className="sticky left-0 z-10 bg-[var(--bg-surface)] px-3 py-2 font-mono text-xs text-[var(--text-muted)] border-r border-[var(--border-main)]">
                        {hour}
                      </td>
                      {Array.from({ length: 7 }, (_, dayIdx) => {
                        const availsForDay = filteredAvailability.filter((a) => a.day_of_week === dayIdx);
                        let slot: AvailabilitySlot | undefined;
                        let parentAvail: TeacherBookingAvailabilityDTO | undefined;

                        for (const a of availsForDay) {
                          const s = a.slots.find((s) => s.start_time <= hour && s.end_time > hour);
                          if (s) {
                            slot = s;
                            parentAvail = a;
                            break;
                          }
                        }

                        const slotDate = slot?.date ?? parentAvail?.date ?? calcDayDate(dayIdx);
                        const selected = scheduledDate === slotDate && startTime === hour;
                        const slotTime = new Date(`${slotDate}T${hour}:00`);
                        const isPast = slotTime.getTime() - Date.now() < 24 * 60 * 60 * 1000;

                        if (!slot)
                          return <td key={dayIdx} className="px-1.5 py-1.5"><div className="h-10" /></td>;

                        const state = resolveSlotState(slot, isVirtual, roomId, isPast);
                        const isClickable =
                          state.kind === 'free' ||
                          state.kind === 'virtual_booked' ||
                          state.kind === 'presencial_available';

                        return (
                          <td key={dayIdx} className="px-1.5 py-1.5 text-center">
                            <SlotCell
                              slot={slot}
                              state={state}
                              selected={selected}
                              onClick={() => {
                                if (!isClickable) return;
                                setScheduledDate(slotDate);
                                setStartTime(hour);
                              }}
                            />
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--text-muted)] pt-1">
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-amber-400/20 ring-1 ring-amber-400/40" />
              <span>Free — presencial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-sky-400/20 ring-1 ring-sky-400/40" />
              <span>Free — virtual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-rose-500/15 ring-1 ring-rose-500/30" />
              <span>Full</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-orange-500/15 ring-1 ring-orange-500/30" />
              <span>Different room in use</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded bg-[var(--bg-subtle)] ring-1 ring-[var(--border-main)]" />
              <span>Past / unavailable</span>
            </div>
          </div>

          {/* Selection confirmation */}
          {scheduledDate && startTime && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-500">{t('create.choice')}</p>
                <p className="text-xs text-emerald-500/80 mt-0.5">
                  {new Date(scheduledDate + 'T12:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' '}·{' '}
                  {formatTime(startTime + ':00')}
                  {isVirtual ? ' — Virtual' : ' — Presencial'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback: teacher has no availability configured */
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
