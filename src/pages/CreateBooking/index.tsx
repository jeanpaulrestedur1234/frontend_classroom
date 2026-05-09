import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Monday of the current week (Sunday counts as previous week). */
function getThisMonday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

/**
 * First Monday where at least one slot (up to Sun 21:00) is ≥ 24 h in the future.
 * If the current week still has bookable slots, returns this week's Monday.
 * Otherwise advances one week.
 */
function getInitialWeekStart(): Date {
  const monday = getThisMonday();
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  const minBookableTime = Date.now() + 24 * 60 * 60 * 1000;
  if (sunday.getTime() < minBookableTime) {
    monday.setDate(monday.getDate() + 7);
  }
  return monday;
}
import { ChevronLeft, ChevronRight, CircleCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createBooking } from '@/services/bookings';
import { getTeacherAvailability } from '@/services/availability';
import { listTeachers } from '@/services/users';
import { listRooms } from '@/services/rooms';
import { getMyPackages } from '@/services/packages';
import type { UserDTO, RoomDTO, BookingType, StudentBookingDetailDto, TeacherBookingAvailabilityDTO, StudentPackageDTO } from '@/types';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

import StepIndicator from './components/StepIndicator';
import SuccessScreen from './components/SuccessScreen';
import {
  StepType,
  StepTeacher,
  StepRoom,
  StepDateTime,
  StepPackage,
  StepReview,
} from './components/WizardSteps';

export default function CreateBooking() {
  const { user } = useAuth();
  const { t } = useTranslation('bookings');
  const { t: tc } = useTranslation('common');

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
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherBookingAvailabilityDTO[]>([]);
  const [myPackages, setMyPackages] = useState<StudentPackageDTO[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  /* week navigation */
  const [minWeekStart] = useState<Date>(getInitialWeekStart);
  const [weekStart, setWeekStart] = useState<Date>(getInitialWeekStart);
  const weekStartISO = useMemo(() => toISODate(weekStart), [weekStart]);

  /* submit */
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<StudentBookingDetailDto | null>(null);
  const [submitError, setSubmitError] = useState('');

  const isVirtual = bookingType === 'virtual';
  const selectedTeacher = teachers.find((t) => t.id === teacherId);
  const selectedRoom = rooms.find((r) => String(r.id) === roomId);

  /* ──── data fetching ──── */
  useEffect(() => {
    if (step === 1 && teachers.length === 0) {
      setLoadingData(true);
      listTeachers()
        .then((users) => setTeachers(users.filter((u) => u.role === 'teacher' && u.is_active)))
        .catch(() => { })
        .finally(() => setLoadingData(false));
    }
  }, [step, teachers.length]);

  useEffect(() => {
    if (user?.role !== 'student' || step !== 1 || myPackages.length > 0) return;
    getMyPackages({ status: 'active', size: 100 })
      .then((res) => setMyPackages(res.items))
      .catch(() => setMyPackages([]));
  }, [user, step, myPackages.length]);

  useEffect(() => {
    if (!teacherId) {
      setTeacherAvailability([]);
      return;
    }

    setLoadingData(true);
    getTeacherAvailability(teacherId, weekStartISO)
      .then((availability) => setTeacherAvailability(availability))
      .catch(() => setTeacherAvailability([]))
      .finally(() => setLoadingData(false));
  }, [teacherId, weekStartISO]);

  useEffect(() => {
    if (step === 2 && !isVirtual && rooms.length === 0) {
      setLoadingData(true);
      listRooms()
        .then((r) => setRooms(r.filter((rm) => rm.is_active)))
        .catch(() => { })
        .finally(() => setLoadingData(false));
    }
  }, [step, isVirtual, rooms.length]);

  /* ──── navigation ──── */
  const isStudent = user?.role === 'student';
  const hasPackageStep = isStudent;

  function canNext(): boolean {
    const hasMatchingAvailability = teacherAvailability.some(
      (a) => (isVirtual ? a.is_virtual : !a.is_virtual)
    );

    switch (step) {
      case 0:
        return bookingType !== '';
      case 1:
        return teacherId !== '' && !loadingData && hasMatchingAvailability;
      case 2:
        return isVirtual || roomId !== '';
      case 3:
        return scheduledDate !== '' && startTime !== '';
      case 4:
        return !hasPackageStep || (myPackages.length > 0 && selectedPackageId !== '');
      default:
        return false;
    }
  }

  function goNext() {
    if (!canNext()) return;
    if (step === 1 && isVirtual) {
      setStep(3);
      return;
    }

    if (step === 3) {
      setStep(hasPackageStep ? 4 : 5);
      return;
    }

    setStep((s) => Math.min(s + 1, hasPackageStep ? 5 : 4));
  }

  function goBack() {
    if (step === 3 && isVirtual) {
      setStep(1);
      return;
    }

    if (step === 5) {
      setStep(hasPackageStep ? 4 : 3);
      return;
    }

    setStep((s) => Math.max(s - 1, 0));
  }

  /* ──── week navigation ──── */
  function handlePrevWeek() {
    setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; });
    setScheduledDate('');
    setStartTime('');
  }

  function handleNextWeek() {
    setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; });
    setScheduledDate('');
    setStartTime('');
  }

  /* ──── submit ──── */
  async function handleSubmit() {
    if (!bookingType || !teacherId || !scheduledDate || !startTime || (hasPackageStep && !selectedPackageId)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const booking = await createBooking(
        {
          teacher_id: teacherId,
          booking_type: bookingType,
          room_id: !isVirtual && roomId ? roomId : undefined,
          scheduled_date: scheduledDate,
          start_time: startTime,

        },
        selectedPackageId || undefined,
      );
      setCreatedBooking(booking);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setSubmitError(typeof detail === 'string' ? detail : t('create.error'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setCreatedBooking(null);
    setStep(0);
    setBookingType('');
    setTeacherId('');
    setRoomId('');
    setScheduledDate('');
    setStartTime('');
    setSelectedPackageId('');
  }

  if (!user) return null;

  /* ──── Success screen ──── */
  if (createdBooking) {
    return <SuccessScreen booking={createdBooking} onReset={handleReset} usedPackageId={selectedPackageId} />;
  }

  /* ──── Step content ──── */
  function renderStep() {
    switch (step) {
      case 0:
        return <StepType t={t} tc={tc} bookingType={bookingType} setBookingType={setBookingType} />;
      case 1:
        return (
          <StepTeacher
            t={t}
            tc={tc}
            teachers={teachers}
            loading={loadingData}
            teacherId={teacherId}
            setTeacherId={setTeacherId}
            teacherAvailability={teacherAvailability}
            bookingType={bookingType}
          />
        );
      case 2:
        return <StepRoom t={t} tc={tc} rooms={rooms} loading={loadingData} roomId={roomId} setRoomId={setRoomId} />;
      case 3:
        return (
          <StepDateTime
            t={t}
            tc={tc}
            teacherAvailability={teacherAvailability}
            loading={loadingData}
            scheduledDate={scheduledDate}
            setScheduledDate={setScheduledDate}
            startTime={startTime}
            setStartTime={setStartTime}
            bookingType={bookingType}
            roomId={roomId}
            myPackageIds={myPackages.map((p) => p.id)}
            weekStart={weekStart}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            isPrevDisabled={weekStart.getTime() <= minWeekStart.getTime()}
          />
        );
      case 4:
        return (
          <StepPackage
            t={t}
            tc={tc}
            myPackages={myPackages}
            selectedPackageId={selectedPackageId}
            setSelectedPackageId={setSelectedPackageId}
          />
        );
      case 5:
        return (
          <StepReview
            t={t}
            tc={tc}
            bookingType={bookingType}
            selectedTeacher={selectedTeacher}
            selectedRoom={selectedRoom}
            isVirtual={isVirtual}
            scheduledDate={scheduledDate}
            startTime={startTime}
            submitError={submitError}
            selectedPackageId={selectedPackageId}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
          {t('create.title')}
        </h1>
      </div>

      <StepIndicator current={step} skipRoom={isVirtual} skipPackage={!hasPackageStep} t={t} />

      <Card>{renderStep()}</Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={goBack} disabled={step === 0}>
          <ChevronLeft className="w-4 h-4" />
          {tc('actions.back')}
        </Button>

        {step < 5 ? (
          <Button onClick={goNext} disabled={!canNext()}>
            {tc('actions.next')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting}>
            <CircleCheck className="w-4 h-4" />
            {t('create.submitBooking')}
          </Button>
        )}
      </div>
    </div>
  );
}
