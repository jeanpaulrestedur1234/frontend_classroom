import { Eye, CheckCircle, XCircle, Package, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatTime } from '@/utils';
import type { StudentBookingDetailDto, BookingStatus, UserDTO } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface BookingsTableProps {
  bookings: StudentBookingDetailDto[];
  user: UserDTO;
  actionLoading: string | null;
  onViewDetail: (b: StudentBookingDetailDto) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onAddPackage: (b: StudentBookingDetailDto) => void;
}

export function statusBadgeVariant(status: BookingStatus): 'warning' | 'success' | 'danger' | 'info' {
  const map: Record<BookingStatus, 'warning' | 'success' | 'danger' | 'info'> = {
    pending:   'warning',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'info',
  };
  return map[status];
}

export function typeBadgeVariant(type: string): 'virtual' | 'presencial' {
  return type === 'virtual' ? 'virtual' : 'presencial';
}

export default function BookingsTable({
  bookings,
  user,
  actionLoading,
  onViewDetail,
  onConfirm,
  onCancel,
  onComplete,
  onAddPackage,
}: BookingsTableProps) {
  const { t } = useTranslation('bookings');
  const { t: tc } = useTranslation('common');

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isAdminOrTeacher = isAdmin || user.role === 'teacher';

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border-main)] bg-[var(--bg-surface)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-main)] bg-[var(--bg-subtle)]">
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] font-[family-name:var(--font-display)]">
              {t('table.date')}
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] font-[family-name:var(--font-display)]">
              {t('table.time')}
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] font-[family-name:var(--font-display)]">
              {t('table.type')}
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] font-[family-name:var(--font-display)]">
              {t('table.status')}
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] font-[family-name:var(--font-display)]">
              {t('table.teacher')}
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)] font-[family-name:var(--font-display)]">
              {t('table.room')}
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)] font-[family-name:var(--font-display)]">
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="border-b border-[var(--border-main)] last:border-0 hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap text-[var(--text-main)] font-medium">
                {formatDate(b.scheduled_date)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[var(--text-body)]">
                {formatTime(b.start_time)} - {formatTime(b.end_time)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={typeBadgeVariant(b.booking_type)}>
                  {tc(`bookingTypes.${b.booking_type}`)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusBadgeVariant(b.status)}>
                  {tc(`status.${b.status}`)}
                </Badge>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[var(--text-body)]">
                {b.teacher_name || b.teacher?.full_name || '-'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-[var(--text-body)]">
                {b.booking_type === 'presencial' ? (b.room_name || b.room?.name || '-') : '-'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  {b.booking_type === 'virtual' && b.status === 'confirmed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/app/virtual-class/${b.id}`, '_blank')}
                      title={t('actions.videoTooltip')}
                    >
                      <Video className="w-4 h-4 text-blue-500" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(b)}
                    title={tc('actions.viewDetails')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {isAdminOrTeacher && b.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={actionLoading === b.id}
                      onClick={() => onConfirm(b.id)}
                      title={t('actions.confirm')}
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </Button>
                  )}

                  {isAdminOrTeacher && b.status === 'confirmed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={actionLoading === b.id}
                      onClick={() => onComplete(b.id)}
                      title={t('actions.complete')}
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </Button>
                  )}

                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={actionLoading === b.id}
                      onClick={() => onCancel(b.id)}
                      title={t('actions.cancel')}
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                    </Button>
                  )}

                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddPackage(b)}
                      title={t('actions.addPackage')}
                    >
                      <Package className="w-4 h-4 text-[var(--primary)]" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
