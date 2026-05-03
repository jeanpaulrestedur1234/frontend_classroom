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

import RecentActivity from './RecentActivity';

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
        if (s.status === 'fulfilled') setStats(s.value as StudentDashboardStats);
        if (pkg.status === 'fulfilled') setPackages(Array.isArray(pkg.value) ? pkg.value : []);
        if (bk.status === 'fulfilled') setBookings(Array.isArray(bk.value?.items) ? bk.value.items : []);
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
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Package className="h-6 w-6" />} label={t('student.activePackages')} value={stats?.active_packages ?? 0} color="blue" />
        <StatCard icon={<CalendarDays className="h-6 w-6" />} label={t('student.pendingBookings')} value={stats?.pending_bookings ?? 0} color="sky" />
        <StatCard icon={<CheckCircle2 className="h-6 w-6" />} label={t('student.completedBookings')} value={stats?.completed_bookings ?? 0} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {/* Next class */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
            {t('student.nextClass')}
          </h2>
          <Card className="h-full border-[var(--border-main)] shadow-sm">
            {upcomingBooking ? (
              <div className="flex items-center gap-5 p-2">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] shadow-inner">
                  <CalendarDays className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[var(--text-main)]">
                    {upcomingBooking.scheduled_date}
                  </p>
                  <p className="text-sm font-medium text-[var(--text-muted)]">
                    {upcomingBooking.start_time.slice(0, 5)} - {upcomingBooking.end_time.slice(0, 5)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-dim)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    {tc(`bookingTypes.${upcomingBooking.booking_type}`)}
                    {upcomingBooking.teacher_name ? ` · ${upcomingBooking.teacher_name}` : upcomingBooking.teacher ? ` · ${upcomingBooking.teacher.full_name}` : ''}
                    {upcomingBooking.room_name ? ` · ${upcomingBooking.room_name}` : upcomingBooking.room ? ` · ${upcomingBooking.room.name}` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-[var(--text-muted)] italic">
                  {t('student.noUpcomingClasses')}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Active packages summary */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
            {t('student.activePackages')}
          </h2>
          {packages.filter((p) => p.status === 'active').length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {packages
                .filter((p) => p.status === 'active')
                .slice(0, 3)
                .map((p) => (
                  <Card key={p.id} className="flex items-center gap-3 transition-colors hover:bg-[var(--bg-subtle)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-main)] truncate">
                        {tc(`classTypes.${p.class_type}`)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {p.hours_per_week}h/wk &middot; {p.duration_weeks}w
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="flex items-center justify-center py-10 border-dashed">
               <p className="text-sm text-[var(--text-muted)]">{t('student.noActivePackages') || 'No tienes paquetes activos'}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity
        role="student"
        title={t('student.recentActivity')}
        emptyMessage={t('student.noRecentActivity')}
        bookings={bookings.slice(0, 5)}
      />

      {/* Quick action */}
      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <QuickAction
          icon={<Plus className="h-4 w-4" />}
          label={t('student.bookClass')}
          to="/app/bookings/new"
        />
      </div>
    </>
  );
}
