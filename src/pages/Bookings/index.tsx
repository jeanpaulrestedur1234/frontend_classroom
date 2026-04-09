import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { usePaginatedQuery, useMutation } from '@/hooks';
import { listMyBookings, confirmBooking, cancelBooking } from '@/services/bookings';
import { useToast } from '@/context/ToastContext';
import type { StudentBookingDetailDto } from '@/types';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import BookingsFilter from './components/BookingsFilter';
import BookingsTable from './components/BookingsTable';
import WeeklyGrid from '../TeacherAvailability/components/WeeklyGrid';
import BookingDetailModal from './components/BookingDetailModal';
import AddPackageModal from './components/AddPackageModal';

const PAGE_SIZE = 20;

function bookingToAvailability(booking: StudentBookingDetailDto) {
  const date = new Date(booking.scheduled_date);
  const jsDay = date.getDay();
  const apiDay = jsDay === 0 ? 6 : jsDay - 1;

  return {
    id: booking.id,
    teacher_id: Number(booking.teacher?.id ?? 0),
    day_of_week: apiDay,
    start_time: booking.start_time,
    end_time: booking.end_time,
    is_virtual: booking.booking_type === 'virtual',
    created_at: booking.created_at,
  };
}

export default function Bookings() {
  const { user } = useAuth();
  const { t } = useTranslation('bookings');
  const { t: tc } = useTranslation('common');
  const { success: toastSuccess, error: toastError } = useToast();

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  /* filters */
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'week'>('week');

  /* server-side paginated query */
  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      listMyBookings({ status: statusFilter || undefined, page, page_size: pageSize }),
    [statusFilter],
  );

  const {
    data: bookings,
    setData: setBookings,
    loading,
    error,
    page,
    total,
    totalPages,
    setPage,
    hasNextPage,
    hasPrevPage,
    prevPage,
    nextPage,
    refetch,
  } = usePaginatedQuery<StudentBookingDetailDto>(fetcher, { pageSize: PAGE_SIZE });

  /* re-fetch from page 1 when status filter changes */
  useEffect(() => {
    setPage(1);
    // fetcherRef inside the hook always has the latest fetcher,
    // so refetch() will use the updated statusFilter value.
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  /* mutations */
  const confirmMut = useMutation(confirmBooking);
  const cancelMut = useMutation(cancelBooking);

  /* modals */
  const [detailBooking, setDetailBooking] = useState<StudentBookingDetailDto | null>(null);
  const [packageModalBooking, setPackageModalBooking] = useState<StudentBookingDetailDto | null>(null);

  const isMutatingAny = confirmMut.loading || cancelMut.loading;

  if (!user) return null;

  /* reset page when filter changes (handled by usePaginatedQuery re-fetching via fetcher dep) */
  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleClearFilters() {
    setStatusFilter('');
    setPage(1);
  }

  async function handleConfirm(id: string) {
    try {
      const updated = await confirmMut.execute(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      toastSuccess(t('actions.confirmSuccess'));
    } catch {
      toastError(t('actions.error'));
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancelMut.execute(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b)),
      );
      toastSuccess(t('actions.cancelSuccess'));
    } catch {
      toastError(t('actions.error'));
    }
  }

  /* pagination info */
  const showPagination = !loading && !error && total > PAGE_SIZE;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 font-[family-name:var(--font-display)]">
            {isAdmin ? t('manageBookings') : t('myBookings')}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {isAdmin ? t('manageBookings') : t('myBookings')}
          </p>
        </div>

        {user.role === 'student' && (
          <Link to="/app/bookings/new">
            <Button>
              <Plus className="w-4 h-4" />
              {t('create.title')}
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={viewMode === 'week' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('week')}
        >
          {t('viewModes.week')}
        </Button>
        <Button
          size="sm"
          variant={viewMode === 'table' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('table')}
        >
          {t('viewModes.table')}
        </Button>
      </div>

      {/* Filters */}
      <BookingsFilter
        statusFilter={statusFilter}
        setStatusFilter={handleStatusChange}
        onClear={handleClearFilters}
      />

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
            <p className="text-sm text-rose-400">{error}</p>
            <Button variant="secondary" size="sm" onClick={refetch}>
              {tc('actions.retry')}
            </Button>
          </div>
        </Card>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title={t('empty.title')}
          description={statusFilter ? tc('emptyState.noResults') : t('empty.description')}
          action={
            user.role === 'student' ? (
              <Link to="/app/bookings/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  {t('create.title')}
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          {viewMode === 'week' ? (
            <WeeklyGrid
              availability={bookings.map(bookingToAvailability)}
            />
          ) : (
            <BookingsTable
              bookings={bookings}
              user={user}
              actionLoading={isMutatingAny ? 'loading' : null}
              onViewDetail={setDetailBooking}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onAddPackage={setPackageModalBooking}
            />
          )}

          {/* Pagination info */}
          {total > 0 && (
            <p className="text-sm text-zinc-500">
              {t('pagination.showing', { from, to, total })}
            </p>
          )}
        </>
      )}

      {/* Pagination controls */}
      {showPagination && (
        <div className="flex items-center justify-between pt-2">
          <Button size="sm" variant="secondary" disabled={!hasPrevPage} onClick={prevPage}>
            <ChevronLeft className="h-4 w-4" />
            {t('pagination.previous')}
          </Button>

          <span className="text-sm text-zinc-500 font-[family-name:var(--font-display)]">
            {t('pagination.page', { current: page, total: totalPages })}
          </span>

          <Button size="sm" variant="secondary" disabled={!hasNextPage} onClick={nextPage}>
            {t('pagination.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modals */}
      <BookingDetailModal
        booking={detailBooking}
        user={user}
        actionLoading={isMutatingAny ? 'loading' : null}
        onClose={() => setDetailBooking(null)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <AddPackageModal
        booking={packageModalBooking}
        onClose={() => setPackageModalBooking(null)}
      />
    </div>
  );
}
