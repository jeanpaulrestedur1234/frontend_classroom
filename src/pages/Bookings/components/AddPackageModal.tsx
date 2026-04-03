import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { formatDate } from '@/utils';
import type { StudentBookingDetailDto, StudentPackageDTO } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getMyPackages } from '@/services/packages';
import { addPackageToBooking } from '@/services/bookings';
import { useToast } from '@/context/ToastContext';

interface AddPackageModalProps {
  booking: StudentBookingDetailDto | null;
  onClose: () => void;
}

export default function AddPackageModal({ booking, onClose }: AddPackageModalProps) {
  const { t } = useTranslation('bookings');
  const { t: tc } = useTranslation('common');
  const { success: toastSuccess, error: toastError } = useToast();

  const [myPackages, setMyPackages] = useState<StudentPackageDTO[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!booking) return;

    let mounted = true;
    setLoading(true);
    setSuccess(false);
    setSelectedPackageId('');

    getMyPackages()
      .then((pkgs) => {
        if (mounted) setMyPackages(pkgs.filter((p) => p.status === 'active'));
      })
      .catch(() => {
        if (mounted) setMyPackages([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [booking]);

  async function handleAddPackage() {
    if (!booking || !selectedPackageId) return;

    setLoading(true);
    try {
      await addPackageToBooking(booking.id, {
        student_package_id: selectedPackageId,
      });
      setSuccess(true);
      toastSuccess(t('actions.addPackageSuccess'));
    } catch {
      toastError(t('actions.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={!!booking} onClose={onClose} title={t('packageModal.title')}>
      {booking && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            {t('table.date')}:{' '}
            <span className="font-medium text-zinc-900">
              {formatDate(booking.scheduled_date)} {booking.start_time} - {booking.end_time}
            </span>
          </p>

          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-emerald-400">
                {t('actions.addPackageSuccess')}
              </p>
            </div>
          ) : loading && myPackages.length === 0 ? (
            <LoadingSpinner size="sm" />
          ) : myPackages.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">
              {t('packageModal.noActivePackages')}
            </p>
          ) : (
            <>
              <Select
                label={t('packageModal.selectPackage')}
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                options={myPackages.map((p) => ({
                  value: p.id,
                  label: `${tc(`classTypes.${p.class_type}`)} - ${p.hours_per_week}${tc('time.hoursPerWeek')} (${p.duration_weeks} ${tc('time.weeks')})`,
                }))}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  {tc('actions.cancel')}
                </Button>
                <Button
                  size="sm"
                  disabled={!selectedPackageId || loading}
                  loading={loading}
                  onClick={handleAddPackage}
                >
                  {t('actions.addPackage')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
