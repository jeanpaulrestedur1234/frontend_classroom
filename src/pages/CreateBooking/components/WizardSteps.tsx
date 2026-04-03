import { Monitor, Building2, User, MapPin, CalendarDays, Clock, AlertTriangle, Package } from 'lucide-react';
import { useMemo } from 'react';
import { formatDate } from '@/utils';
import type { UserDTO, RoomDTO, TeacherAvailabilityDTO } from '@/types';
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

export function StepType({ t, tc, bookingType, setBookingType }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.type')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.selectType')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Virtual */}
        <button
          onClick={() => setBookingType('virtual')}
          className={`p-6 rounded-2xl text-left transition-all duration-200 backdrop-blur-xl ${
            bookingType === 'virtual'
              ? 'bg-sky-500/10 border-2 border-sky-500/40 ring-2 ring-sky-500/15 shadow-lg shadow-sky-500/10'
              : 'bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
          }`}
        >
          <Monitor className={`w-8 h-8 mb-3 ${bookingType === 'virtual' ? 'text-sky-400' : 'text-zinc-400'}`} />
          <h3 className={`font-semibold font-[family-name:var(--font-display)] ${bookingType === 'virtual' ? 'text-sky-300' : 'text-zinc-800'}`}>
            {tc('bookingTypes.virtual')}
          </h3>
          <p className="text-sm text-zinc-500 mt-1">{t('create.virtualDesc')}</p>
        </button>

        {/* Presencial */}
        <button
          onClick={() => setBookingType('presencial')}
          className={`p-6 rounded-2xl text-left transition-all duration-200 backdrop-blur-xl ${
            bookingType === 'presencial'
              ? 'bg-amber-500/10 border-2 border-amber-500/40 ring-2 ring-amber-500/15 shadow-lg shadow-amber-500/10'
              : 'bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
          }`}
        >
          <Building2 className={`w-8 h-8 mb-3 ${bookingType === 'presencial' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <h3 className={`font-semibold font-[family-name:var(--font-display)] ${bookingType === 'presencial' ? 'text-amber-300' : 'text-zinc-800'}`}>
            {tc('bookingTypes.presencial')}
          </h3>
          <p className="text-sm text-zinc-500 mt-1">{t('create.presencialDesc')}</p>
        </button>
      </div>
    </div>
  );
}

export function StepTeacher({ t, tc, teachers, loading, teacherId, setTeacherId }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.teacher')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.selectTeacher')}</p>
      {loading ? (
        <LoadingSpinner />
      ) : teachers.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">{tc('emptyState.noData')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teachers.map((teacher: UserDTO) => (
            <button
              key={teacher.id}
              onClick={() => setTeacherId(teacher.id)}
              className={`p-4 rounded-2xl text-left transition-all duration-200 backdrop-blur-xl ${
                teacherId === teacher.id
                  ? 'bg-amber-500/10 border-2 border-amber-500/40 ring-2 ring-amber-500/15 shadow-lg shadow-amber-500/10'
                  : 'bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    teacherId === teacher.id ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${teacherId === teacher.id ? 'text-amber-300' : 'text-zinc-800'}`}>
                    {teacher.full_name}
                  </p>
                  <p className="text-xs text-zinc-500">{teacher.email}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function StepRoom({ t, tc, rooms, loading, roomId, setRoomId }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.room')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.selectRoom')}</p>
      {loading ? (
        <LoadingSpinner />
      ) : rooms.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">{tc('emptyState.noData')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((room: RoomDTO) => (
            <button
              key={room.id}
              onClick={() => setRoomId(String(room.id))}
              className={`p-4 rounded-2xl text-left transition-all duration-200 backdrop-blur-xl ${
                roomId === String(room.id)
                  ? 'bg-amber-500/10 border-2 border-amber-500/40 ring-2 ring-amber-500/15 shadow-lg shadow-amber-500/10'
                  : 'bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    roomId === String(room.id) ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${roomId === String(room.id) ? 'text-amber-300' : 'text-zinc-800'}`}>
                    {room.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {tc('navigation.rooms')}: {room.capacity}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
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

export function StepPackage({ t, tc, myPackages, selectedPackageId, setSelectedPackageId }: any) {
  const selectedPackage = myPackages.find((p: any) => p.id === selectedPackageId);

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.package')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.choosePackage')}</p>

      {myPackages.length === 0 ? (
        <p className="text-sm text-zinc-500">{t('create.noActivePackage')}</p>
      ) : (
        <Select
          label={t('create.selectPackage')}
          value={selectedPackageId}
          onChange={(e) => setSelectedPackageId(e.target.value)}
          options={myPackages.map((pkg: any) => ({
            value: pkg.id,
            label: `${tc(`classTypes.${pkg.class_type}`)} - ${pkg.hours_per_week}h/wk · ${pkg.duration_weeks}w`,
          }))}
        />
      )}

      {selectedPackage && (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
          <p className="font-semibold text-zinc-700">{t('create.packagePreview')}</p>
          <p className="text-zinc-600">{tc(`classTypes.${selectedPackage.class_type}`)}</p>
          <p className="text-zinc-600">{selectedPackage.hours_per_week}h/wk · {selectedPackage.duration_weeks}w</p>
          <p className="text-zinc-600">{t('create.packageId')}: {selectedPackage.id}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-zinc-500">{t('create.selectPackageHint')}</p>
    </div>
  );
}

export function StepReview({ t, tc, bookingType, selectedTeacher, selectedRoom, isVirtual, scheduledDate, startTime, submitError, selectedPackageId }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.review')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.reviewTitle')}</p>
      <div className="bg-zinc-50 backdrop-blur-xl border border-zinc-200 rounded-2xl p-5 max-w-md">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            {isVirtual ? (
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-sky-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
            )}
            <div>
              <span className="text-zinc-500 text-xs">{t('table.type')}</span>
              <p className="font-medium text-zinc-900">{tc(`bookingTypes.${bookingType}`)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <User className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <span className="text-zinc-500 text-xs">{t('table.teacher')}</span>
              <p className="font-medium text-zinc-900">{selectedTeacher?.full_name ?? '-'}</p>
            </div>
          </div>
          {!isVirtual && selectedRoom && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs">{t('table.room')}</span>
                <p className="font-medium text-zinc-900">
                  {selectedRoom.name} (cap. {selectedRoom.capacity})
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-zinc-500 text-xs">{t('table.date')}</span>
              <p className="font-medium text-zinc-900">{scheduledDate ? formatDate(scheduledDate) : '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-zinc-500 text-xs">{t('table.time')}</span>
              <p className="font-medium text-zinc-900">{startTime || '-'}</p>
            </div>
          </div>

          {selectedPackageId ? (
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs">{t('create.package')}</span>
                <p className="font-medium text-zinc-900">{selectedPackageId}</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-zinc-500">{t('create.noPackageSelected')}</div>
          )}
        </div>
      </div>

      {submitError && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-sm text-rose-400">{submitError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
