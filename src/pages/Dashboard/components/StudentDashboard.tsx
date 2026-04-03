import { useEffect, useState } from 'react';
import {
  Package,
  CalendarDays,
  CheckCircle2,
  BookOpen,
  Plus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getDashboardStats,
  type StudentDashboardStats,
} from '@/services/dashboard';
import { listMyBookings } from '@/services/bookings';
import { getMyPackages } from '@/services/packages';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { StudentBookingDetailDto, StudentPackageDTO } from '@/types';
import StatCard from './StatCard';
import QuickAction from './QuickAction';

/* ──────────────────────────── Student Dashboard ──────────────────────────── */

export default function StudentDashboard() {
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');

  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [packages, setPackages] = useState<StudentPackageDTO[]>([]);
  const [bookings, setBookings] = useState<StudentBookingDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, pkg, bk] = await Promise.allSettled([
          getDashboardStats(),
          getMyPackages(),
          listMyBookings({ page_size: 10 }),
        ]);
        if (s.status === 'fulfilled')
          setStats(s.value as StudentDashboardStats);
        if (pkg.status === 'fulfilled')
          setPackages(Array.isArray(pkg.value) ? pkg.value : []);
        if (bk.status === 'fulfilled')
          setBookings(Array.isArray(bk.value?.items) ? bk.value.items : []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const upcomingBooking = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'pending')
    .sort((a, b) => {
      const dateA = `${a.scheduled_date}T${a.start_time}`;
      const dateB = `${b.scheduled_date}T${b.start_time}`;
      return dateA.localeCompare(dateB);
    })[0];

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <>
      {/* Stats from API */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Package className="h-6 w-6" />}
          label={t('student.activePackages')}
          value={stats?.active_packages ?? 0}
          color="amber"
        />
        <StatCard
          icon={<CalendarDays className="h-6 w-6" />}
          label={t('student.pendingBookings')}
          value={stats?.pending_bookings ?? 0}
          color="sky"
        />
        <StatCard
          icon={<CheckCircle2 className="h-6 w-6" />}
          label={t('student.completedBookings')}
          value={stats?.completed_bookings ?? 0}
          color="emerald"
        />
      </div>

      {/* Next class */}
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-zinc-950 font-[family-name:var(--font-display)]">
          {t('student.nextClass')}
        </h2>
        <Card>
          {upcomingBooking ? (
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <CalendarDays className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">
                  {upcomingBooking.scheduled_date}
                </p>
                <p className="text-sm text-zinc-400">
                  {upcomingBooking.start_time} - {upcomingBooking.end_time}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {tc(`bookingTypes.${upcomingBooking.booking_type}`)}
                  {upcomingBooking.teacher
                    ? ` - ${upcomingBooking.teacher.full_name}`
                    : ''}
                  {upcomingBooking.room
                    ? ` - ${upcomingBooking.room.name}`
                    : ''}
                </p>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-zinc-500">
              {t('student.noUpcomingClasses')}
            </p>
          )}
        </Card>
      </div>

      {/* Active packages summary */}
      {packages.filter((p) => p.status === 'active').length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-zinc-950 font-[family-name:var(--font-display)]">
            {t('student.activePackages')}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {packages
              .filter((p) => p.status === 'active')
              .slice(0, 4)
              .map((p) => (
                <Card key={p.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">
                      {tc(`classTypes.${p.class_type}`)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {p.hours_per_week}h/wk &middot; {p.duration_weeks}w
                    </p>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Quick action */}
      <div className="mt-8">
        <QuickAction
          icon={<Plus className="h-4 w-4" />}
          label={t('student.bookClass')}
          to="/app/bookings/new"
        />
      </div>
    </>
  );
}
