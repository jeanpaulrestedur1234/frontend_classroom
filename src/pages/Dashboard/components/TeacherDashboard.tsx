import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getDashboardStats,
  type TeacherDashboardStats,
} from '@/services/dashboard';
import { listMyBookings } from '@/services/bookings';
import { getMyAvailability } from '@/services/availability';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type {
  StudentBookingDetailDto,
  TeacherAvailabilityDTO,
} from '@/types';
import StatCard from './StatCard';

/* ────────────────────────────── helpers ───────────────────────────────────── */

function jsDayToApiDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function bookingBadgeVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'default';
  }
}

/* ──────────────────────────── Teacher Dashboard ──────────────────────────── */

export default function TeacherDashboard() {
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');

  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [availability, setAvailability] = useState<TeacherAvailabilityDTO[]>(
    [],
  );
  const [bookings, setBookings] = useState<StudentBookingDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, avail, bk] = await Promise.allSettled([
          getDashboardStats(),
          getMyAvailability(),
          listMyBookings({ page_size: 20 }),
        ]);
        if (s.status === 'fulfilled')
          setStats(s.value as TeacherDashboardStats);
        if (avail.status === 'fulfilled')
          setAvailability(Array.isArray(avail.value) ? avail.value : []);
        if (bk.status === 'fulfilled')
          setBookings(Array.isArray(bk.value?.items) ? bk.value.items : []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const jsDow = today.getDay();
  const apiDow = jsDayToApiDay(jsDow);

  const todayClasses = bookings.filter(
    (b) =>
      b.scheduled_date === todayStr &&
      (b.status === 'confirmed' || b.status === 'pending'),
  );

  const todayAvailability = availability.filter(
    (a) => a.day_of_week === apiDow,
  );
  const dayName = tc(`days.${apiDow}`);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <>
      {/* Stats from API */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Clock className="h-6 w-6" />}
          label={t('teacher.myAvailability')}
          value={`${availability.length} ${t('teacher.blocks')}`}
          color="sky"
        />
        <StatCard
          icon={<CalendarDays className="h-6 w-6" />}
          label={t('teacher.classesToday')}
          value={todayClasses.length}
          color="violet"
        />
        <StatCard
          icon={<CalendarDays className="h-6 w-6" />}
          label={t('teacher.pendingBookings')}
          value={stats?.pending_bookings ?? 0}
          color="amber"
        />
        <StatCard
          icon={<CheckCircle2 className="h-6 w-6" />}
          label={t('teacher.completedBookings')}
          value={stats?.completed_bookings ?? 0}
          color="emerald"
        />
      </div>

      {/* Today's availability */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-950 font-[family-name:var(--font-display)]">
          {t('teacher.availabilityToday', { day: dayName })}
        </h2>
        <Card>
          {todayAvailability.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-500">
              {t('teacher.noAvailabilityToday')}
            </p>
          ) : (
            <ul className="space-y-2">
              {todayAvailability.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3"
                >
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-zinc-700">
                    {a.start_time} - {a.end_time}
                  </span>
                  <Badge variant={a.is_virtual ? 'info' : 'default'}>
                    {tc(
                      `bookingTypes.${a.is_virtual ? 'virtual' : 'presencial'}`,
                    )}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Today's classes */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-950 font-[family-name:var(--font-display)]">
          {t('teacher.myClassesToday')}
        </h2>
        <Card>
          {todayClasses.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-500">
              {t('teacher.noClassesToday')}
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {todayClasses.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 rounded-full bg-amber-500/60" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {b.start_time} - {b.end_time}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {tc(`bookingTypes.${b.booking_type}`)}
                        {b.room ? ` - ${b.room.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant={bookingBadgeVariant(b.status)}>
                    {tc(`status.${b.status}`)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Quick link */}
      <div className="mt-8">
        <Link
          to="/app/availability"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
        >
          {t('teacher.configureAvailability')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}
