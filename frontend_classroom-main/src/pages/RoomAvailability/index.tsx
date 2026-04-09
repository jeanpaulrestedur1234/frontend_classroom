import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Building2,
  CalendarDays,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listRooms } from '@/services/rooms';
import { getRoomBookingAvailability } from '@/services/bookings';
import type {
  RoomDTO,
  RoomAvailabilityResponse,
  RoomAvailabilitySlot,
} from '@/types';
import { formatDate } from '@/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import RoomInfoCard from './components/RoomInfoCard';
import SlotCard from './components/SlotCard';

/* ────────────────────────── helpers ──────────────────────────────────────── */

function getDefaultDateRange(): { from: string; to: string } {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  return {
    from: today.toISOString().split('T')[0],
    to: nextWeek.toISOString().split('T')[0],
  };
}

function groupSlotsByDate(
  slots: RoomAvailabilitySlot[],
): Record<string, RoomAvailabilitySlot[]> {
  const grouped: Record<string, RoomAvailabilitySlot[]> = {};
  for (const slot of slots) {
    const date = slot.scheduled_date;
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(slot);
  }
  // Sort slots within each date by start_time
  for (const date of Object.keys(grouped)) {
    grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }
  return grouped;
}

/* ────────────────────────── component ───────────────────────────────────── */

export default function RoomAvailability() {
  const { t } = useTranslation('rooms');
  const { t: tc } = useTranslation('common');

  /* rooms list */
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  /* filter state */
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const defaults = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);

  /* availability response */
  const [availability, setAvailability] =
    useState<RoomAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  /* derived: group slots by date */
  const slotsByDate = useMemo(
    () => (availability ? groupSlotsByDate(availability.slots) : {}),
    [availability],
  );
  const sortedDates = useMemo(
    () => Object.keys(slotsByDate).sort(),
    [slotsByDate],
  );

  /* -- fetch rooms on mount -- */
  useEffect(() => {
    setRoomsLoading(true);
    listRooms()
      .then((data) => setRooms(data.filter((r) => r.is_active)))
      .catch(() => { })
      .finally(() => setRoomsLoading(false));
  }, []);

  /* -- query availability -- */
  const fetchAvailability = useCallback(async () => {
    if (!selectedRoomId || !dateFrom || !dateTo) return;

    if (dateFrom > dateTo) {
      setError(tc('validation.required'));
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await getRoomBookingAvailability(
        Number(selectedRoomId),
        dateFrom,
        dateTo,
      );
      setAvailability(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? tc('errors.generic'));
      setAvailability(null);
    } finally {
      setLoading(false);
    }
  }, [selectedRoomId, dateFrom, dateTo, tc]);

  /* ──── render ──── */

  return (
    <div className="space-y-6">
      {/* -- Page Header -- */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-950 font-[family-name:var(--font-display)]">
          {t('availability.title')}
        </h1>
      </div>

      {/* -- Filters -- */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {roomsLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="w-full sm:w-56">
              <Select
                label={t('availability.selectRoom')}
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                options={rooms.map((r) => ({
                  value: String(r.id),
                  label: `${r.name} (cap. ${r.capacity})`,
                }))}
              />
            </div>
          )}
          <Input
            label={t('availability.from')}
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label={t('availability.to')}
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Button
            onClick={fetchAvailability}
            disabled={!selectedRoomId || !dateFrom || !dateTo}
            loading={loading}
          >
            <Search className="w-4 h-4" />
            {t('availability.query')}
          </Button>
        </div>
      </Card>

      {/* -- Room Info Card (shown after a successful query) -- */}
      {availability && <RoomInfoCard availability={availability} />}

      {/* -- Content Area -- */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
            <p className="text-sm text-rose-400">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchAvailability}>
              {tc('actions.retry')}
            </Button>
          </div>
        </Card>
      ) : !hasSearched ? (
        <EmptyState
          icon={<Building2 className="h-12 w-12" />}
          title={t('availability.title')}
          description={tc('emptyState.noData')}
        />
      ) : availability && availability.total_slots === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title={t('availability.title')}
          description={t('availability.empty')}
        />
      ) : (
        /* -- Slots grouped by date -- */
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const daySlots = slotsByDate[date];

            return (
              <Card key={date}>
                {/* Date header */}
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-zinc-900 font-[family-name:var(--font-display)]">
                    {formatDate(date)}
                  </h3>
                  <Badge variant="info">
                    {daySlots.length}{' '}
                    {daySlots.length === 1 ? 'slot' : 'slots'}
                  </Badge>
                </div>

                {/* Slot list */}
                <div className="space-y-3">
                  {daySlots.map((slot) => (
                    <SlotCard
                      key={slot.booking_id}
                      slot={slot}
                      capacity={availability!.room_capacity}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
