import { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  CalendarDays,
  Users,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listRooms } from '../services/rooms';
import { getRoomBookingAvailability } from '../services/bookings';
import type { RoomDTO, StudentBookingDetailDto } from '../types';
import { formatDate } from '../utils';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

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

function occupancyPct(current: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(Math.round((current / capacity) * 100), 100);
}

function occupancyColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 60) return 'bg-amber-500';
  return 'bg-green-500';
}

function occupancyTextColor(pct: number): string {
  if (pct >= 90) return 'text-red-700';
  if (pct >= 60) return 'text-amber-700';
  return 'text-green-700';
}

/* ────────────────────────── component ───────────────────────────────────── */

export default function RoomAvailability() {
  const { user } = useAuth();

  /* data */
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  /* selections */
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const defaults = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);

  /* bookings */
  const [bookings, setBookings] = useState<StudentBookingDetailDto[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  /* selected room object */
  const selectedRoom = rooms.find((r) => String(r.id) === selectedRoomId);

  /* fetch rooms */
  useEffect(() => {
    setRoomsLoading(true);
    listRooms()
      .then((data) => setRooms(data.filter((r) => r.is_active)))
      .catch(() => {})
      .finally(() => setRoomsLoading(false));
  }, []);

  /* fetch bookings */
  const fetchBookings = useCallback(async () => {
    if (!selectedRoomId || !dateFrom || !dateTo) return;
    setBookingsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await getRoomBookingAvailability(
        selectedRoomId,
        dateFrom,
        dateTo,
      );
      // Only show confirmed bookings for occupancy
      setBookings(data.filter((b) => b.status === 'confirmed'));
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          'Error al cargar la disponibilidad del salon.',
      );
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [selectedRoomId, dateFrom, dateTo]);

  /* ──── render ──── */

  if (!user) return null;

  // Group bookings by date
  const bookingsByDate: Record<string, StudentBookingDetailDto[]> = {};
  bookings.forEach((b) => {
    if (!bookingsByDate[b.scheduled_date]) {
      bookingsByDate[b.scheduled_date] = [];
    }
    bookingsByDate[b.scheduled_date].push(b);
  });
  const sortedDates = Object.keys(bookingsByDate).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Disponibilidad de Salones
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Consulta la ocupacion y disponibilidad de los salones.
        </p>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {roomsLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="w-full sm:w-56">
              <Select
                label="Salon"
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
            label="Desde"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="Hasta"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <Button
            onClick={fetchBookings}
            disabled={!selectedRoomId || !dateFrom || !dateTo}
            loading={bookingsLoading}
          >
            <Search className="w-4 h-4" />
            Consultar
          </Button>
        </div>
      </Card>

      {/* Room info */}
      {selectedRoom && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-sm font-medium text-indigo-900">
              {selectedRoom.name}
            </span>
            <span className="text-sm text-indigo-600 ml-2">
              Capacidad: {selectedRoom.capacity} estudiantes
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {bookingsLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchBookings}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : !hasSearched ? (
        <EmptyState
          icon={<Building2 className="h-12 w-12" />}
          title="Selecciona un salon y rango de fechas"
          description="Elige un salon y un rango de fechas, luego presiona Consultar para ver la ocupacion."
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="Sin reservas confirmadas"
          description="No hay reservas confirmadas para este salon en el rango de fechas seleccionado."
        />
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const dayBookings = bookingsByDate[date].sort((a, b) =>
              a.start_time.localeCompare(b.start_time),
            );

            return (
              <Card key={date}>
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    {formatDate(date)}
                  </h3>
                  <Badge variant="info">
                    {dayBookings.length}{' '}
                    {dayBookings.length === 1 ? 'reserva' : 'reservas'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {dayBookings.map((b) => {
                    // For room bookings, we estimate 1 student per booking
                    // The API returns individual bookings; count bookings in same slot
                    const sameSlotCount = dayBookings.filter(
                      (bk) =>
                        bk.start_time === b.start_time &&
                        bk.end_time === b.end_time,
                    ).length;
                    const capacity = selectedRoom?.capacity ?? 1;
                    const pct = occupancyPct(sameSlotCount, capacity);

                    return (
                      <div
                        key={b.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        {/* Time */}
                        <div className="flex items-center gap-2 sm:w-32 shrink-0">
                          <div className="w-2 h-8 rounded bg-indigo-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {b.start_time} - {b.end_time}
                            </p>
                          </div>
                        </div>

                        {/* Teacher */}
                        <div className="sm:w-40 shrink-0">
                          <p className="text-xs text-gray-500">Profesor</p>
                          <p className="text-sm text-gray-700">
                            {b.teacher?.full_name ?? '-'}
                          </p>
                        </div>

                        {/* Occupancy */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3 h-3" />
                              <span>
                                {sameSlotCount} / {capacity} estudiantes
                              </span>
                            </div>
                            <span
                              className={`text-xs font-medium ${occupancyTextColor(pct)}`}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${occupancyColor(pct)}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {capacity - sameSlotCount > 0
                              ? `${capacity - sameSlotCount} lugares disponibles`
                              : 'Sin lugares disponibles'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
