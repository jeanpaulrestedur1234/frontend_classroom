import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Building2,
  User,
  CalendarDays,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createBooking, addPackageToBooking } from '../services/bookings';
import { listUsers } from '../services/users';
import { listRooms } from '../services/rooms';
import { getMyPackages } from '../services/packages';
import type {
  UserDTO,
  RoomDTO,
  BookingType,
  StudentPackageDTO,
  StudentBookingDetailDto,
} from '../types';
import { formatDate } from '../utils';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/* ────────────────────────── constants ───────────────────────────────────── */

const STEPS = [
  'Tipo de Clase',
  'Profesor',
  'Salon',
  'Fecha y Hora',
  'Confirmar',
];

const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 7; // 07:00 to 21:00
  const hh = hour.toString().padStart(2, '0');
  return { value: `${hh}:00`, label: `${hh}:00` };
});

/* ────────────────────────── progress indicator ──────────────────────────── */

function StepIndicator({
  steps,
  current,
  skipRoom,
}: {
  steps: string[];
  current: number;
  skipRoom: boolean;
}) {
  const visibleSteps = skipRoom
    ? steps.filter((_, i) => i !== 2)
    : steps;

  // Map current to visible index when room is skipped
  const visibleCurrent = skipRoom && current > 2 ? current - 1 : current;

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {visibleSteps.map((step, idx) => {
        const isActive = idx === visibleCurrent;
        const isDone = idx < visibleCurrent;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : isDone
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`hidden sm:inline text-sm ${
                  isActive
                    ? 'font-medium text-gray-900'
                    : isDone
                      ? 'text-green-700'
                      : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>
            {idx < visibleSteps.length - 1 && (
              <div
                className={`w-6 h-px ${
                  idx < visibleCurrent ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────── component ───────────────────────────────────── */

export default function CreateBooking() {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* wizard state */
  const [step, setStep] = useState(0);

  /* form values */
  const [bookingType, setBookingType] = useState<BookingType | ''>('');
  const [teacherId, setTeacherId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('');

  /* data */
  const [teachers, setTeachers] = useState<UserDTO[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  /* submit */
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] =
    useState<StudentBookingDetailDto | null>(null);
  const [submitError, setSubmitError] = useState('');

  /* package linking (post-create) */
  const [showPackageStep, setShowPackageStep] = useState(false);
  const [myPackages, setMyPackages] = useState<StudentPackageDTO[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [packageLoading, setPackageLoading] = useState(false);
  const [packageLinked, setPackageLinked] = useState(false);

  const isVirtual = bookingType === 'virtual';
  const selectedTeacher = teachers.find((t) => t.id === teacherId);
  const selectedRoom = rooms.find((r) => String(r.id) === roomId);

  /* ──── data fetching ──── */
  useEffect(() => {
    if (step === 1 && teachers.length === 0) {
      setLoadingData(true);
      listUsers()
        .then((users) =>
          setTeachers(
            users.filter((u) => u.role === 'teacher' && u.is_active),
          ),
        )
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [step, teachers.length]);

  useEffect(() => {
    if (step === 2 && !isVirtual && rooms.length === 0) {
      setLoadingData(true);
      listRooms()
        .then((r) => setRooms(r.filter((rm) => rm.is_active)))
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [step, isVirtual, rooms.length]);

  /* ──── navigation ──── */
  function canNext(): boolean {
    switch (step) {
      case 0:
        return bookingType !== '';
      case 1:
        return teacherId !== '';
      case 2:
        return isVirtual || roomId !== '';
      case 3:
        return scheduledDate !== '' && startTime !== '';
      default:
        return false;
    }
  }

  function goNext() {
    if (!canNext()) return;
    // Skip room step for virtual
    if (step === 1 && isVirtual) {
      setStep(3);
    } else {
      setStep((s) => Math.min(s + 1, 4));
    }
  }

  function goBack() {
    // Skip room step for virtual when going back
    if (step === 3 && isVirtual) {
      setStep(1);
    } else {
      setStep((s) => Math.max(s - 1, 0));
    }
  }

  /* ──── submit ──── */
  async function handleSubmit() {
    if (!bookingType || !teacherId || !scheduledDate || !startTime) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const booking = await createBooking({
        teacher_id: teacherId,
        booking_type: bookingType,
        room_id: !isVirtual && roomId ? roomId : undefined,
        scheduled_date: scheduledDate,
        start_time: startTime,
      });
      setCreatedBooking(booking);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setSubmitError(
        typeof detail === 'string'
          ? detail
          : 'Error al crear la reserva. Verifica los datos e intenta de nuevo.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ──── package linking ──── */
  async function openPackageLinking() {
    setShowPackageStep(true);
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

  async function handleLinkPackage() {
    if (!createdBooking || !selectedPackageId) return;
    setPackageLoading(true);
    try {
      await addPackageToBooking(createdBooking.id, {
        student_package_id: selectedPackageId,
      });
      setPackageLinked(true);
    } catch (err: any) {
      alert(
        err?.response?.data?.detail ?? 'Error al vincular el paquete.',
      );
    } finally {
      setPackageLoading(false);
    }
  }

  /* ──── render helpers ──── */

  if (!user) return null;

  const isStudent = user.role === 'student';

  /* ──── Success screen ──── */
  if (createdBooking) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Reserva Creada
            </h2>
            <p className="text-sm text-gray-500">
              Tu reserva ha sido registrada exitosamente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t border-gray-100 pt-4">
            <div>
              <span className="block text-gray-500">Fecha</span>
              <span className="font-medium text-gray-900">
                {formatDate(createdBooking.scheduled_date)}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Horario</span>
              <span className="font-medium text-gray-900">
                {createdBooking.start_time} - {createdBooking.end_time}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Tipo</span>
              <span className="font-medium text-gray-900">
                {createdBooking.booking_type === 'virtual'
                  ? 'Virtual'
                  : 'Presencial'}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Estado</span>
              <span className="font-medium text-yellow-600">Pendiente</span>
            </div>
            {createdBooking.teacher && (
              <div>
                <span className="block text-gray-500">Profesor</span>
                <span className="font-medium text-gray-900">
                  {createdBooking.teacher.full_name}
                </span>
              </div>
            )}
            {createdBooking.room && (
              <div>
                <span className="block text-gray-500">Salon</span>
                <span className="font-medium text-gray-900">
                  {createdBooking.room.name}
                </span>
              </div>
            )}
          </div>

          {/* Package linking for students */}
          {isStudent && !showPackageStep && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <button
                onClick={openPackageLinking}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Vincular un paquete a esta reserva
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {showPackageStep && (
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
              {packageLinked ? (
                <div className="text-center py-2">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                  <p className="text-sm font-medium text-green-700">
                    Paquete vinculado exitosamente.
                  </p>
                </div>
              ) : packageLoading && myPackages.length === 0 ? (
                <LoadingSpinner size="sm" />
              ) : myPackages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">
                  No tienes paquetes activos disponibles.
                </p>
              ) : (
                <>
                  <Select
                    label="Selecciona un Paquete"
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    options={myPackages.map((p) => ({
                      value: p.id,
                      label: `${p.class_type} - ${p.hours_per_week}h/sem (${p.duration_weeks} sem)`,
                    }))}
                  />
                  <Button
                    size="sm"
                    disabled={!selectedPackageId}
                    loading={packageLoading}
                    onClick={handleLinkPackage}
                  >
                    Vincular Paquete
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => navigate('/app/bookings')}
            >
              Ver Mis Reservas
            </Button>
            <Button
              onClick={() => {
                setCreatedBooking(null);
                setStep(0);
                setBookingType('');
                setTeacherId('');
                setRoomId('');
                setScheduledDate('');
                setStartTime('');
                setShowPackageStep(false);
                setPackageLinked(false);
                setSelectedPackageId('');
              }}
            >
              Crear Otra Reserva
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ──── Step content ──── */
  function renderStep() {
    switch (step) {
      /* ── Step 0: Booking Type ── */
      case 0:
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Tipo de Clase
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Selecciona si deseas una clase virtual o presencial.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Virtual */}
              <button
                onClick={() => setBookingType('virtual')}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  bookingType === 'virtual'
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Monitor
                  className={`w-8 h-8 mb-3 ${
                    bookingType === 'virtual'
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                />
                <h3 className="font-semibold text-gray-900">Virtual</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Clase en linea desde cualquier lugar.
                </p>
              </button>

              {/* Presencial */}
              <button
                onClick={() => setBookingType('presencial')}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  bookingType === 'presencial'
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <Building2
                  className={`w-8 h-8 mb-3 ${
                    bookingType === 'presencial'
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                />
                <h3 className="font-semibold text-gray-900">Presencial</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Clase en un salon fisico.
                </p>
              </button>
            </div>
          </div>
        );

      /* ── Step 1: Select Teacher ── */
      case 1:
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Seleccionar Profesor
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Elige el profesor para tu clase.
            </p>
            {loadingData ? (
              <LoadingSpinner />
            ) : teachers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay profesores disponibles.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {teachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTeacherId(t.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      teacherId === t.id
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          teacherId === t.id
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{t.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      /* ── Step 2: Select Room (presencial only) ── */
      case 2:
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Seleccionar Salon
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Elige el salon para tu clase presencial.
            </p>
            {loadingData ? (
              <LoadingSpinner />
            ) : rooms.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay salones disponibles.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRoomId(String(r.id))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      roomId === String(r.id)
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          roomId === String(r.id)
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {r.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Capacidad: {r.capacity}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      /* ── Step 3: Date & Time ── */
      case 3:
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Fecha y Hora
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Selecciona la fecha y la hora para tu clase.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <Input
                label="Fecha"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <Select
                label="Hora de Inicio"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                options={TIME_SLOTS}
              />
            </div>
          </div>
        );

      /* ── Step 4: Review ── */
      case 4:
        return (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Confirmar Reserva
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Revisa los datos antes de confirmar.
            </p>
            <Card className="max-w-md">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  {isVirtual ? (
                    <Monitor className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Building2 className="w-5 h-5 text-indigo-500" />
                  )}
                  <div>
                    <span className="text-gray-500">Tipo:</span>{' '}
                    <span className="font-medium text-gray-900">
                      {isVirtual ? 'Virtual' : 'Presencial'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-500" />
                  <div>
                    <span className="text-gray-500">Profesor:</span>{' '}
                    <span className="font-medium text-gray-900">
                      {selectedTeacher?.full_name ?? '-'}
                    </span>
                  </div>
                </div>
                {!isVirtual && selectedRoom && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <div>
                      <span className="text-gray-500">Salon:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {selectedRoom.name} (cap. {selectedRoom.capacity})
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-green-500" />
                  <div>
                    <span className="text-gray-500">Fecha:</span>{' '}
                    <span className="font-medium text-gray-900">
                      {scheduledDate ? formatDate(scheduledDate) : '-'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <span className="text-gray-500">Hora:</span>{' '}
                    <span className="font-medium text-gray-900">
                      {startTime || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {submitError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Reserva</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sigue los pasos para crear tu reserva de clase.
        </p>
      </div>

      {/* Progress */}
      <StepIndicator steps={STEPS} current={step} skipRoom={isVirtual} />

      {/* Step Content */}
      <Card>{renderStep()}</Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={goBack}
          disabled={step === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        {step < 4 ? (
          <Button onClick={goNext} disabled={!canNext()}>
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting}>
            <CheckCircle className="w-4 h-4" />
            Crear Reserva
          </Button>
        )}
      </div>
    </div>
  );
}
