import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Video } from 'lucide-react';
import { formatDate, formatTime } from '@/utils';
import type { StudentBookingDetailDto, UserDTO } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { statusBadgeVariant, typeBadgeVariant } from './BookingsTable';

interface BookingDetailModalProps {
  booking: StudentBookingDetailDto | null;
  user: UserDTO;
  actionLoading: string | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
}

export default function BookingDetailModal({
  booking,
  user,
  actionLoading,
  onClose,
  onConfirm,
  onCancel,
  onComplete,
}: BookingDetailModalProps) {
  const { t } = useTranslation('bookings');
  const { t: tc } = useTranslation('common');

  if (!booking) return null;

  const isAdminOrTeacher = user.role === 'admin' || user.role === 'super_admin' || user.role === 'teacher';

  return (
    <Modal isOpen={!!booking} onClose={onClose} title={t('detail.title')} size="lg">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-[var(--text-muted)] text-xs mb-1">{t('detail.bookingId')}</span>
            <span className="font-medium text-[var(--text-body)] font-mono text-xs">{booking.id}</span>
          </div>
          <div>
            <span className="block text-[var(--text-muted)] text-xs mb-1">{t('table.status')}</span>
            <Badge variant={statusBadgeVariant(booking.status)}>
              {tc(`status.${booking.status}`)}
            </Badge>
          </div>
          <div>
            <span className="block text-[var(--text-muted)] text-xs mb-1">{t('table.date')}</span>
            <span className="font-medium text-[var(--text-main)]">{formatDate(booking.scheduled_date)}</span>
          </div>
          <div>
            <span className="block text-[var(--text-muted)] text-xs mb-1">{t('table.time')}</span>
            <span className="font-medium text-[var(--text-main)]">
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </span>
          </div>
          <div>
            <span className="block text-[var(--text-muted)] text-xs mb-1">{t('table.type')}</span>
            <Badge variant={typeBadgeVariant(booking.booking_type)}>
              {tc(`bookingTypes.${booking.booking_type}`)}
            </Badge>
          </div>
          <div>
            <span className="block text-[var(--text-muted)] text-xs mb-1">{t('table.teacher')}</span>
            <span className="font-medium text-[var(--text-main)]">{booking.teacher_name || booking.teacher?.full_name || '-'}</span>
          </div>
          {booking.booking_type === 'presencial' && (
            <div>
              <span className="block text-[var(--text-muted)] text-xs mb-1">{t('table.room')}</span>
              <span className="font-medium text-[var(--text-main)]">{booking.room_name || booking.room?.name || '-'}</span>
            </div>
          )}
          <div>
            <span className="block text-[var(--text-muted)] text-xs mb-1">{t('detail.createdAt')}</span>
            <span className="font-medium text-[var(--text-main)]">{formatDate(booking.created_at)}</span>
          </div>
          <div>
            <span className="block text-[var(--text-muted)] text-xs mb-1">{t('detail.updatedAt')}</span>
            <span className="font-medium text-[var(--text-main)]">{formatDate(booking.updated_at)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-main)]">
          {isAdminOrTeacher && booking.status === 'pending' && (
            <Button
              size="sm"
              loading={actionLoading === booking.id}
              onClick={() => {
                onConfirm(booking.id);
                onClose();
              }}
            >
              <CheckCircle className="w-4 h-4" />
              {t('actions.confirm')}
            </Button>
          )}
          {booking.booking_type === 'virtual' && booking.status === 'confirmed' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                window.open(`/app/virtual-class/${booking.id}`, '_blank');
              }}
            >
              <Video className="w-4 h-4" />
              {t('actions.joinClass')}
            </Button>
          )}
          {isAdminOrTeacher && booking.status === 'confirmed' && (
            <Button
              size="sm"
              loading={actionLoading === booking.id}
              onClick={() => {
                onComplete(booking.id);
                onClose();
              }}
            >
              <CheckCircle className="w-4 h-4" />
              {t('actions.complete')}
            </Button>
          )}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <Button
              variant="danger"
              size="sm"
              loading={actionLoading === booking.id}
              onClick={() => {
                onCancel(booking.id);
                onClose();
              }}
            >
              <XCircle className="w-4 h-4" />
              {t('actions.cancel')}
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            {tc('actions.close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
