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

function jsDayToApiDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function bookingBadgeVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'confirmed': return 'success';
    case 'pending':   return 'warning';
    case 'cancelled': return 'danger';
    default:          return 'default';
  }
}

import RecentActivity from './RecentActivity';

export default function TeacherDashboard() {
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');

  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [availability, setAvailability] = useState<TeacherAvailabilityDTO[]>([]);
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
        if (s.status === 'fulfilled') setStats(s.value as TeacherDashboardStats);
        if (avail.status === 'fulfilled') setAvailability(Array.isArray(avail.value) ? avail.value : []);
        if (bk.status === 'fulfilled') setBookings(Array.isArray(bk.value?.items) ? bk.value.items : []);
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
    (b) => b.scheduled_date === todayStr && (b.status === 'confirmed' || b.status === 'pending'),
  );
  const todayAvailability = availability.filter((a) => a.day_of_week === apiDow);
  const dayName = tc(`days.${apiDow}`);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Clock className="h-6 w-6" />} label={t('teacher.myAvailability')} value={`${availability.length} ${t('teacher.blocks')}`} color="sky" />
        <StatCard icon={<CalendarDays className="h-6 w-6" />} label={t('teacher.classesToday')} value={todayClasses.length} color="violet" />
        <StatCard icon={<CalendarDays className="h-6 w-6" />} label={t('teacher.pendingBookings')} value={stats?.pending_bookings ?? 0} color="blue" />
        <StatCard icon={<CheckCircle2 className="h-6 w-6" />} label={t('teacher.completedBookings')} value={stats?.completed_bookings ?? 0} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {/* Today's availability */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
            {t('teacher.availabilityToday', { day: dayName })}
          </h2>
          <Card className="h-full border-[var(--border-main)] shadow-sm">
            {todayAvailability.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-[var(--text-muted)] italic">
                  {t('teacher.noAvailabilityToday')}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {todayAvailability.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl bg-[var(--bg-subtle)] p-3 transition-colors hover:bg-[var(--bg-surface-hover)]"
                  >
                    <div className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                       <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-body)]">
                      {a.start_time.slice(0, 5)} - {a.end_time.slice(0, 5)}
                    </span>
                    <Badge variant={a.is_virtual ? 'virtual' : 'presencial'} className="ml-auto">
                      {tc(`bookingTypes.${a.is_virtual ? 'virtual' : 'presencial'}`)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Today's classes */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
            {t('teacher.myClassesToday')}
          </h2>
          <Card className="h-full border-[var(--border-main)] shadow-sm">
            {todayClasses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-[var(--text-muted)] italic">
                  {t('teacher.noClassesToday')}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-main)]">
                {todayClasses.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-1 rounded-full ${b.booking_type === 'virtual' ? 'bg-[var(--virtual)]' : 'bg-[var(--presencial)]'}`} />
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-main)]">
                          {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {tc(`bookingTypes.${b.booking_type}`)}
                          {b.room_name ? ` - ${b.room_name}` : b.room ? ` - ${b.room.name}` : ''}
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
      </div>

      {/* Recent Activity */}
      <RecentActivity
        role="teacher"
        title={t('teacher.recentActivity')}
        emptyMessage={t('teacher.noRecentActivity')}
        bookings={bookings.slice(0, 5)}
      />

      {/* Quick link */}
      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <Link
          to="/app/availability"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] transition-all hover:gap-3"
        >
          {t('teacher.configureAvailability')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}
