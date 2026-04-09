import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { addPackageToBooking } from '@/services/bookings';
import { getMyPackages } from '@/services/packages';
import { formatDate } from '@/utils';
import type { StudentBookingDetailDto, StudentPackageDTO } from '@/types';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface SuccessScreenProps {
  booking: StudentBookingDetailDto;
  onReset: () => void;
  usedPackageId?: string;
}

export default function SuccessScreen({ booking, onReset, usedPackageId }: SuccessScreenProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('bookings');
  const { t: tc } = useTranslation('common');
  const { success: toastSuccess, error: toastError } = useToast();

  const isStudent = user?.role === 'student';

  const [showPackageStep, setShowPackageStep] = useState(false);
  const [myPackages, setMyPackages] = useState<StudentPackageDTO[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [packageLoading, setPackageLoading] = useState(false);
  const [packageLinked, setPackageLinked] = useState(false);

  useEffect(() => {
    if (showPackageStep) {
      setPackageLoading(true);
      getMyPackages()
        .then((pkgs) => setMyPackages(pkgs.filter((p) => p.status === 'active')))
        .catch(() => setMyPackages([]))
        .finally(() => setPackageLoading(false));
    }
  }, [showPackageStep]);

  async function handleLinkPackage() {
    if (!selectedPackageId) return;
    setPackageLoading(true);
    try {
      await addPackageToBooking(booking.id, { student_package_id: selectedPackageId });
      setPackageLinked(true);
      toastSuccess(t('actions.addPackageSuccess'));
    } catch {
      toastError(tc('errors.generic'));
    } finally {
      setPackageLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card>
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 ring-1 ring-emerald-500/20">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
            {t('create.success')}
          </h2>
          <p className="text-sm text-zinc-500">{t('create.success')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t border-zinc-100 pt-4">
          <div>
            <span className="block text-zinc-500 text-xs mb-1">{t('table.date')}</span>
            <span className="font-medium text-zinc-900">{formatDate(booking.scheduled_date)}</span>
          </div>
          <div>
            <span className="block text-zinc-500 text-xs mb-1">{t('table.time')}</span>
            <span className="font-medium text-zinc-900">
              {booking.start_time} - {booking.end_time}
            </span>
          </div>
          <div>
            <span className="block text-zinc-500 text-xs mb-1">{t('table.type')}</span>
            <Badge variant={booking.booking_type === 'virtual' ? 'info' : 'default'}>
              {tc(`bookingTypes.${booking.booking_type}`)}
            </Badge>
          </div>
          <div>
            <span className="block text-zinc-500 text-xs mb-1">{t('table.status')}</span>
            <Badge variant="warning">{tc('status.pending')}</Badge>
          </div>
          {booking.teacher && (
            <div>
              <span className="block text-zinc-500 text-xs mb-1">{t('table.teacher')}</span>
              <span className="font-medium text-zinc-900">{booking.teacher.full_name}</span>
            </div>
          )}
          {booking.room && (
            <div>
              <span className="block text-zinc-500 text-xs mb-1">{t('table.room')}</span>
              <span className="font-medium text-zinc-900">{booking.room.name}</span>
            </div>
          )}
        </div>

        {/* Package linking for students */}
        {isStudent && !usedPackageId && !showPackageStep && (
          <div className="mt-6 border-t border-zinc-100 pt-4">
            <button
              onClick={() => setShowPackageStep(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-dashed border-white/[0.12] text-sm text-zinc-400 hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-500/5 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                {t('create.linkPackage')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {isStudent && usedPackageId && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {t('create.packageUsed')}
          </div>
        )}

        {showPackageStep && (
          <div className="mt-4 border-t border-zinc-100 pt-4 space-y-3">
            {packageLinked ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-emerald-400">
                  {t('actions.addPackageSuccess')}
                </p>
              </div>
            ) : packageLoading && myPackages.length === 0 ? (
              <LoadingSpinner size="sm" />
            ) : myPackages.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">
                {t('packageModal.noActivePackages')}
              </p>
            ) : (
              <>
                <Select
                  label={t('create.selectPackage')}
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  options={myPackages.map((p) => ({
                    value: p.id,
                    label: `${tc(`classTypes.${p.class_type}`)} - ${p.hours_per_week}${tc('time.hoursPerWeek')} (${p.duration_weeks} ${tc('time.weeks')})`,
                  }))}
                />
                <Button
                  size="sm"
                  disabled={!selectedPackageId || packageLoading}
                  loading={packageLoading}
                  onClick={handleLinkPackage}
                >
                  {t('create.linkPackage')}
                </Button>
              </>
            )}
          </div>
        )}

        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-zinc-100">
          <Button variant="secondary" onClick={() => navigate('/app/bookings')}>
            {t('create.viewBookings')}
          </Button>
          <Button onClick={onReset}>{t('create.createAnother')}</Button>
        </div>
      </Card>
    </div>
  );
}
