import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Plus,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  listMyBookings,
  confirmBooking,
  cancelBooking,
  addPackageToBooking,
} from '../services/bookings';
import { getMyPackages } from '../services/packages';
import type {
  StudentBookingDetailDto,
  BookingStatus,
  StudentPackageDTO,
} from '../types';
import { formatDate, bookingStatusLabel } from '../utils';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

/* ────────────────────────── helpers ──────────────────────────────────────── */

function statusBadgeVariant(
  status: BookingStatus,
): 'warning' | 'success' | 'danger' | 'info' {
  const map: Record<BookingStatus, 'warning' | 'success' | 'danger' | 'info'> =
    {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info',
    };
  return map[status];
}

function typeBadgeVariant(type: string): 'info' | 'default' {
  return type === 'virtual' ? 'info' : 'default';
}

function typeLabel(type: string): string {
  return type === 'virtual' ? 'Virtual' : 'Presencial';
}

/* ────────────────────────── component ───────────────────────────────────── */

export default function Bookings() {
  const { user } = useAuth();
  const isAdmin =
    user?.role === 'admin' || user?.role === 'super_admin';
  const isAdminOrTeacher = isAdmin || user?.role === 'teacher';

  /* data */
  const [bookings, setBookings] = useState<StudentBookingDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* filters */
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  /* action state */
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* detail modal */
  const [detailBooking, setDetailBooking] =
    useState<StudentBookingDetailDto | null>(null);

  /* package modal */
  const [packageModalBooking, setPackageModalBooking] =
    useState<StudentBookingDetailDto | null>(null);
  const [myPackages, setMyPackages] = useState<StudentPackageDTO[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [packageLoading, setPackageLoading] = useState(false);
  const [packageSuccess, setPackageSuccess] = useState(false);

  /* fetch */
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ?? 'Error al cargar las reservas.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* filtered list */
  const filtered = bookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (dateFrom && b.scheduled_date < dateFrom) return false;
    if (dateTo && b.scheduled_date > dateTo) return false;
    return true;
  });

  /* actions */
  async function handleConfirm(id: string) {
    setActionLoading(id);
    try {
      const updated = await confirmBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'Error al confirmar la reserva.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(id: string) {
    if (!window.confirm('¿Seguro que deseas cancelar esta reserva?')) return;
    setActionLoading(id);
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: 'cancelled' as const } : b,
        ),
      );
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'Error al cancelar la reserva.');
    } finally {
      setActionLoading(null);
    }
  }

  async function openPackageModal(booking: StudentBookingDetailDto) {
    setPackageModalBooking(booking);
    setSelectedPackageId('');
    setPackageSuccess(false);
    setPackageLoading(true);
    try {
      const pkgs = await getMyPackages();
      setMyPackages(pkgs.filter((p) => p.status === 'active'));
    } catch {
      setMyPackages([]);
    } finally {
      setPackageLoading(false);
    }
  }

  async function handleAddPackage() {
    if (!packageModalBooking || !selectedPackageId) return;
    setPackageLoading(true);
    try {
      await addPackageToBooking(packageModalBooking.id, {
        student_package_id: selectedPackageId,
      });
      setPackageSuccess(true);
    } catch (err: any) {
      alert(
        err?.response?.data?.detail ?? 'Error al agregar el paquete.',
      );
    } finally {
      setPackageLoading(false);
    }
  }

  /* ──────────────────────── render ────────────────────────────────────────── */

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Gestion de Reservas' : 'Mis Reservas'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin
              ? 'Administra todas las reservas del sistema.'
              : 'Consulta y gestiona tus reservas de clase.'}
          </p>
        </div>

        {(user.role === 'student' || isAdmin) && (
          <Link to="/app/bookings/new">
            <Button>
              <Plus className="w-4 h-4" />
              Nueva Reserva
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <Filter className="hidden sm:block w-5 h-5 text-gray-400 mt-1" />
          <Select
            label="Estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'pending', label: 'Pendiente' },
              { value: 'confirmed', label: 'Confirmada' },
              { value: 'cancelled', label: 'Cancelada' },
              { value: 'completed', label: 'Completada' },
            ]}
          />
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
          {(statusFilter || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('');
                setDateFrom('');
                setDateTo('');
              }}
            >
              Limpiar
            </Button>
          )}
        </div>
      </Card>

      {/* Content */}
      {loading ? (
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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="No hay reservas"
          description={
            statusFilter || dateFrom || dateTo
              ? 'No se encontraron reservas con los filtros seleccionados.'
              : 'Aun no tienes reservas creadas.'
          }
          action={
            (user.role === 'student' || isAdmin) ? (
              <Link to="/app/bookings/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Crear Reserva
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-3 pr-4 font-medium text-gray-500">Fecha</th>
                <th className="pb-3 pr-4 font-medium text-gray-500">Hora</th>
                <th className="pb-3 pr-4 font-medium text-gray-500">Tipo</th>
                <th className="pb-3 pr-4 font-medium text-gray-500">Estado</th>
                <th className="pb-3 pr-4 font-medium text-gray-500">
                  Profesor
                </th>
                <th className="pb-3 pr-4 font-medium text-gray-500">Salon</th>
                <th className="pb-3 font-medium text-gray-500 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {formatDate(b.scheduled_date)}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {b.start_time} - {b.end_time}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={typeBadgeVariant(b.booking_type)}>
                      {typeLabel(b.booking_type)}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusBadgeVariant(b.status)}>
                      {bookingStatusLabel(b.status)}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-gray-700">
                    {b.teacher?.full_name ?? '-'}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-gray-700">
                    {b.booking_type === 'presencial'
                      ? b.room?.name ?? '-'
                      : '-'}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Detail */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailBooking(b)}
                        title="Ver Detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {/* Confirm (admin/teacher only, pending) */}
                      {isAdminOrTeacher && b.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={actionLoading === b.id}
                          onClick={() => handleConfirm(b.id)}
                          title="Confirmar"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}

                      {/* Cancel (any role, pending/confirmed) */}
                      {(b.status === 'pending' ||
                        b.status === 'confirmed') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={actionLoading === b.id}
                          onClick={() => handleCancel(b.id)}
                          title="Cancelar"
                        >
                          <XCircle className="w-4 h-4 text-red-500" />
                        </Button>
                      )}

                      {/* Add package (admin) */}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPackageModal(b)}
                          title="Agregar Paquete"
                        >
                          <Package className="w-4 h-4 text-indigo-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ──── Detail Modal ──── */}
      <Modal
        isOpen={!!detailBooking}
        onClose={() => setDetailBooking(null)}
        title="Detalle de Reserva"
        size="lg"
      >
        {detailBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500">ID</span>
                <span className="font-medium text-gray-900">
                  {detailBooking.id}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Estado</span>
                <Badge variant={statusBadgeVariant(detailBooking.status)}>
                  {bookingStatusLabel(detailBooking.status)}
                </Badge>
              </div>
              <div>
                <span className="block text-gray-500">Fecha</span>
                <span className="font-medium text-gray-900">
                  {formatDate(detailBooking.scheduled_date)}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Horario</span>
                <span className="font-medium text-gray-900">
                  {detailBooking.start_time} - {detailBooking.end_time}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Tipo</span>
                <Badge
                  variant={typeBadgeVariant(detailBooking.booking_type)}
                >
                  {typeLabel(detailBooking.booking_type)}
                </Badge>
              </div>
              <div>
                <span className="block text-gray-500">Profesor</span>
                <span className="font-medium text-gray-900">
                  {detailBooking.teacher?.full_name ?? '-'}
                </span>
              </div>
              {detailBooking.booking_type === 'presencial' && (
                <div>
                  <span className="block text-gray-500">Salon</span>
                  <span className="font-medium text-gray-900">
                    {detailBooking.room?.name ?? '-'}
                  </span>
                </div>
              )}
              <div>
                <span className="block text-gray-500">Creada</span>
                <span className="font-medium text-gray-900">
                  {formatDate(detailBooking.created_at)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              {isAdminOrTeacher && detailBooking.status === 'pending' && (
                <Button
                  size="sm"
                  loading={actionLoading === detailBooking.id}
                  onClick={() => {
                    handleConfirm(detailBooking.id);
                    setDetailBooking(null);
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar
                </Button>
              )}
              {(detailBooking.status === 'pending' ||
                detailBooking.status === 'confirmed') && (
                <Button
                  variant="danger"
                  size="sm"
                  loading={actionLoading === detailBooking.id}
                  onClick={() => {
                    handleCancel(detailBooking.id);
                    setDetailBooking(null);
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDetailBooking(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ──── Add Package Modal ──── */}
      <Modal
        isOpen={!!packageModalBooking}
        onClose={() => setPackageModalBooking(null)}
        title="Agregar Paquete a Reserva"
      >
        {packageModalBooking && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Reserva:{' '}
              <span className="font-medium text-gray-900">
                {formatDate(packageModalBooking.scheduled_date)}{' '}
                {packageModalBooking.start_time} -{' '}
                {packageModalBooking.end_time}
              </span>
            </p>

            {packageSuccess ? (
              <div className="text-center py-4">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">
                  Paquete agregado exitosamente.
                </p>
              </div>
            ) : packageLoading && myPackages.length === 0 ? (
              <LoadingSpinner size="sm" />
            ) : myPackages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay paquetes activos disponibles.
              </p>
            ) : (
              <>
                <Select
                  label="Paquete del Estudiante"
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  options={myPackages.map((p) => ({
                    value: p.id,
                    label: `${p.class_type} - ${p.hours_per_week}h/sem (${p.duration_weeks} sem)`,
                  }))}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPackageModalBooking(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    disabled={!selectedPackageId}
                    loading={packageLoading}
                    onClick={handleAddPackage}
                  >
                    Agregar
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
