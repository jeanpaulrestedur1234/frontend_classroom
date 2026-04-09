import { useTranslation } from 'react-i18next';
import {
  Clock,
  CalendarDays,
  CreditCard,
  Upload,
  Play,
  Plus,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import type { StudentPackageDTO, PaymentDTO, ClassType } from '@/types';
import { formatDate, formatCurrency } from '@/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

function statusBadgeVariant(
  status: string,
): 'warning' | 'success' | 'danger' | 'info' | 'default' {
  switch (status) {
    case 'inactive':
      return 'warning';
    case 'active':
      return 'success';
    case 'pending':
      return 'warning';
    case 'notified':
      return 'info';
    case 'confirmed':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'default';
  }
}

function classTypeBadgeVariant(ct: ClassType): 'info' | 'success' | 'warning' {
  switch (ct) {
    case 'open_group':
      return 'info';
    case 'closed_group':
      return 'success';
    case 'private':
      return 'warning';
  }
}

export interface StudentPackageWithPayments extends StudentPackageDTO {
  payments?: PaymentDTO[];
}

interface PackageDetailCardProps {
  pkg: StudentPackageWithPayments;
  activatingId: string | null;
  creatingPaymentId: string | null;
  onActivate: (spId: string) => void;
  onCreatePayment: (spId: string) => void;
  onUploadReceipt: (paymentId: string, packageId: string) => void;
}

export default function PackageDetailCard({
  pkg,
  activatingId,
  creatingPaymentId,
  onActivate,
  onCreatePayment,
  onUploadReceipt,
}: PackageDetailCardProps) {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const totalHours = pkg.hours_per_week * pkg.duration_weeks;
  const payments = pkg.payments || [];
  const hasConfirmedPayment = payments.some((p) => p.status === 'confirmed');
  const hasPendingPayment = payments.some(
    (p) => p.status === 'pending' || p.status === 'notified',
  );

  return (
    <Card className="space-y-5 relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Package header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={classTypeBadgeVariant(pkg.class_type)}>
                {tc(`classTypes.${pkg.class_type}`)}
              </Badge>
              <Badge variant={statusBadgeVariant(pkg.status)}>
                {tc(`status.${pkg.status}`)}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              ID: {pkg.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <span className="text-lg font-bold text-blue-400 font-[family-name:var(--font-display)]">
          {formatCurrency(pkg.total_price)}
        </span>
      </div>

      {/* Package details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-zinc-100">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Clock className="h-4 w-4 text-zinc-400" />
          <span>{t('catalog.hoursPerWeek', { hours: pkg.hours_per_week })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <CalendarDays className="h-4 w-4 text-zinc-400" />
          <span>{t('catalog.weeks', { weeks: pkg.duration_weeks })}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <span>{t('myPackages.totalHours', { hours: totalHours })}</span>
        </div>
        {pkg.discount_pct > 0 && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CreditCard className="h-4 w-4 text-zinc-400" />
            <span>{t('catalog.discount', { pct: pkg.discount_pct })}</span>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
        <span>
          <span className="text-zinc-400">{t('myPackages.createdAt')}:</span>{' '}
          {formatDate(pkg.created_at)}
        </span>
        {pkg.activated_at && (
          <span>
            <span className="text-zinc-400">{t('myPackages.activatedAt')}:</span>{' '}
            {formatDate(pkg.activated_at)}
          </span>
        )}
        {pkg.expires_at && (
          <span>
            <span className="text-zinc-400">{t('myPackages.expiresAt')}:</span>{' '}
            {formatDate(pkg.expires_at)}
          </span>
        )}
      </div>

      {/* Payments section */}
      {payments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-700 font-[family-name:var(--font-display)]">
            {t('myPackages.payments')}
          </h4>
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50/50 border border-white/[0.05] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-zinc-400" />
                  <div>
                    <span className="text-sm font-medium text-zinc-700">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="ml-3">
                      <Badge variant={statusBadgeVariant(payment.status)}>
                        {tc(`status.${payment.status}`)}
                      </Badge>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {payment.payment_proof_url && (
                    <a
                      href={payment.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {tc('actions.viewDetails')}
                    </a>
                  )}
                  {payment.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onUploadReceipt(payment.id, pkg.id)}
                    >
                      <Upload className="h-3 w-3" />
                      {t('myPackages.uploadReceipt')}
                    </Button>
                  )}
                  {payment.rejection_reason && (
                    <span className="text-xs text-rose-400">
                      {payment.rejection_reason}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {payments.length === 0 && (
        <p className="text-xs text-zinc-400 italic">{t('myPackages.noPayments')}</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-1">
        {pkg.status === 'inactive' && hasConfirmedPayment && (
          <Button
            size="sm"
            loading={activatingId === pkg.id}
            onClick={() => onActivate(pkg.id)}
          >
            <Play className="h-4 w-4" />
            {t('myPackages.activatePackage')}
          </Button>
        )}

        {!hasConfirmedPayment && !hasPendingPayment && (
          <Button
            size="sm"
            variant="secondary"
            loading={creatingPaymentId === pkg.id}
            onClick={() => onCreatePayment(pkg.id)}
          >
            <Plus className="h-4 w-4" />
            {t('myPackages.newPayment')}
          </Button>
        )}

        {hasPendingPayment && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const pendingPayment = payments.find(
                (p) => p.status === 'pending',
              );
              if (pendingPayment) {
                onUploadReceipt(pendingPayment.id, pkg.id);
              }
            }}
          >
            <Upload className="h-4 w-4" />
            {t('myPackages.uploadReceipt')}
          </Button>
        )}
      </div>
    </Card>
  );
}
