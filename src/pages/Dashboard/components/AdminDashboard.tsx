import { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  Package,
  CalendarDays,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  getDashboardStats,
  type AdminDashboardStats,
} from '@/services/dashboard';
import { listMyBookings } from '@/services/bookings';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { StudentBookingDetailDto } from '@/types';
import StatCard from './StatCard';
import QuickAction from './QuickAction';

import RecentActivity from './RecentActivity';

function bookingBadgeVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'confirmed': return 'success';
    case 'pending':   return 'warning';
    case 'cancelled': return 'danger';
    case 'completed': return 'success';
    default:          return 'default';
  }
}

export default function AdminDashboard() {
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [bookings, setBookings] = useState<StudentBookingDetailDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, b] = await Promise.allSettled([
          getDashboardStats(),
          listMyBookings({ page_size: 5 }),
        ]);
        if (s.status === 'fulfilled') setStats(s.value as AdminDashboardStats);
        if (b.status === 'fulfilled')
          setBookings(Array.isArray(b.value?.items) ? b.value.items : []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<Users className="h-6 w-6" />} label={t('admin.totalUsers')} value={stats?.total_users ?? 0} color="sky" />
        <StatCard icon={<Building2 className="h-6 w-6" />} label={t('admin.activeRooms')} value={stats?.active_rooms ?? 0} color="violet" />
        <StatCard icon={<Package className="h-6 w-6" />} label={t('admin.availablePackages')} value={stats?.available_packages ?? 0} color="emerald" />
        <StatCard icon={<CalendarDays className="h-6 w-6" />} label={t('admin.pendingBookings')} value={stats?.pending_bookings ?? 0} color="blue" />
        <StatCard icon={<CheckCircle2 className="h-6 w-6" />} label={t('admin.completedBookings')} value={stats?.completed_bookings ?? 0} color="emerald" />
      </div>

      {/* Quick actions */}
      <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
          {t('admin.quickActions')}
        </h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction icon={<Plus className="h-4 w-4" />} label={t('admin.newUser')} to="/app/users" />
          <QuickAction icon={<Plus className="h-4 w-4" />} label={t('admin.newRoom')} to="/app/rooms" />
          <QuickAction icon={<Plus className="h-4 w-4" />} label={t('admin.newPackage')} to="/app/packages" />
        </div>
      </div>

      {/* Recent activity */}
      <RecentActivity
        role="admin"
        title={t('admin.recentActivity')}
        emptyMessage={t('admin.noRecentActivity')}
        bookings={bookings}
      />
    </>
  );
}
