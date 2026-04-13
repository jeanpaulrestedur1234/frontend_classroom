import { useTranslation } from 'react-i18next';
import {
  Clock,
  CalendarDays,
  CreditCard,
  Upload,
  Play,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import type { StudentPackageDTO, PaymentDTO } from '@/types';
import { formatDate, formatCurrency } from '@/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

function statusBadgeVariant(
  status: string,
): 'warning' | 'success' | 'danger' | 'info' | 'default' {
  switch (status) {
    case 'inactive': return 'warning';
    case 'active': return 'success';
    case 'pending': return 'warning';
    case 'notified': return 'info';
    case 'confirmed': return 'success';
    case 'rejected': return 'danger';
    default: return 'default';
  }
}



export interface StudentPackageWithPayments extends StudentPackageDTO {
  payments?: PaymentDTO[];
}

interface PackageDetailCardProps {
  pkg: StudentPackageWithPayments;
  activatingId: string | null;
  onActivate: (spId: string) => void;
  onCreatePayment: (spId: string) => void;
  onUploadReceipt: (paymentId: string, packageId: string) => void;
}

export default function PackageDetailCard({
  pkg,
  activatingId,
  onActivate,
  onCreatePayment,
  onUploadReceipt,
}: PackageDetailCardProps) {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const totalHours = pkg.hours_per_week * pkg.duration_weeks;
  const payments = pkg.payments || [];

  return (
    <Card className="overflow-hidden rounded-2xl border border-[var(--border-main)] bg-[var(--bg-surface)] shadow-sm">

      {/* Header */}
      <div className="p-5 border-b border-[var(--border-main)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-medium mb-1">
                {tc(`classTypes.${pkg.class_type}`)}
              </p>
              <p className="text-[10px] text-[var(--text-dim)]">
                ID: {pkg.id.slice(0, 8)}…
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
              {formatCurrency(pkg.total_price)}
            </p>
            <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-wider mt-0.5">
              {t('myPackages.totalPrice')}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <Badge variant={statusBadgeVariant(pkg.status)} className="capitalize text-xs px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block" />
            {tc(`status.${pkg.status}`)}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-4">

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[var(--bg-subtle)] rounded-xl p-3 border border-[var(--border-main)]">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3 w-3 text-[var(--text-dim)]" />
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-medium">
                {tc('time.hoursPerWeek')}
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--text-body)]">{pkg.hours_per_week}h</p>
          </div>

          <div className="bg-[var(--bg-subtle)] rounded-xl p-3 border border-[var(--border-main)]">
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarDays className="h-3 w-3 text-[var(--text-dim)]" />
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-medium">
                {tc('time.weeks')}
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--text-body)]">{pkg.duration_weeks}w</p>
          </div>

          <div className="bg-[var(--bg-subtle)] rounded-xl p-3 border border-[var(--border-main)]">
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen className="h-3 w-3 text-[var(--text-dim)]" />
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-medium">
                {t('myPackages.totalHours', { hours: '' }).trim()}
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--text-body)]">{totalHours}h</p>
          </div>

          {pkg.discount_pct > 0 && (
            <div className="bg-[var(--bg-subtle)] rounded-xl p-3 border border-[var(--border-main)]">
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard className="h-3 w-3 text-[var(--text-dim)]" />
                <p className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-medium">
                  {t('catalog.discount', { pct: '' }).trim()}
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--text-body)]">{pkg.discount_pct}%</p>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--bg-subtle)] rounded-xl p-3 border border-[var(--border-main)]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock className="h-3 w-3 text-[var(--text-dim)]" />
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-medium">
                {t('myPackages.createdAt')}
              </p>
            </div>
            <p className="text-xs font-semibold text-[var(--text-body)]">{formatDate(pkg.created_at)}</p>
          </div>

          {pkg.activated_at && (
            <div className="bg-[var(--bg-subtle)] rounded-xl p-3 border border-[var(--border-main)]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CalendarDays className="h-3 w-3 text-[var(--text-dim)]" />
                <p className="text-[9px] uppercase tracking-wider text-[var(--text-dim)] font-medium">
                  {t('myPackages.activatedAt')}
                </p>
              </div>
              <p className="text-xs font-semibold text-[var(--text-body)]">{formatDate(pkg.activated_at)}</p>
            </div>
          )}
        </div>

        {/* Expiry */}
        {pkg.expires_at && (
          <div className="flex items-center justify-between bg-orange-500/8 rounded-xl px-3.5 py-3 border border-orange-500/20">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
              <p className="text-[10px] uppercase tracking-wider font-semibold text-orange-500/80">
                {t('myPackages.expiresAt')}
              </p>
            </div>
            <p className="text-xs font-bold text-orange-500">{formatDate(pkg.expires_at)}</p>
          </div>
        )}

        {/* Payments */}
        {payments.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
              {t('myPackages.payments')}
            </h4>
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center text-[var(--primary)]">
                      <CreditCard className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[var(--text-body)]">
                        {formatCurrency(payment.amount)}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={statusBadgeVariant(payment.status)} className="text-[9px] uppercase px-1.5 py-0">
                          {tc(`status.${payment.status}`)}
                        </Badge>
                        <span className="text-[10px] text-[var(--text-dim)]">
                          {formatDate(payment.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.payment_proof_url && (
                      <a
                        href={payment.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                        title={tc('actions.viewDetails')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {payment.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onUploadReceipt(payment.id, pkg.id)}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {t('myPackages.uploadReceipt')}
                      </Button>
                    )}
                    {payment.rejection_reason && (
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-medium text-rose-500 bg-rose-500/10 px-3 py-1 rounded-lg">
                          {payment.rejection_reason}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const firstPayment = payments[0];
                            if (firstPayment) {
                               onUploadReceipt(firstPayment.id, pkg.id);
                            } else {
                               onCreatePayment(pkg.id);
                            }
                          }}
                          className="text-[10px]"
                        >
                          {t('myPackages.newPayment')} / {t('myPackages.uploadReceipt')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-dim)] italic">{t('myPackages.noPayments')}</p>
        )}

        {/* Actions */}
        {(pkg.status === 'inactive' && pkg.payment_status === 'paid') || pkg.payment_status !== 'paid' ? (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-main)]">
            {pkg.status === 'inactive' && pkg.payment_status === 'paid' && (
              <Button
                size="sm"
                loading={activatingId === pkg.id}
                onClick={() => onActivate(pkg.id)}
                className="flex-1"
              >
                <Play className="h-3.5 w-3.5" />
                {t('myPackages.activatePackage')}
              </Button>
            )}

            {pkg.payment_status !== 'paid' && (
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  const firstPayment = payments[0];
                  if (firstPayment) {
                     onUploadReceipt(firstPayment.id, pkg.id);
                  } else {
                     onCreatePayment(pkg.id);
                  }
                }}
              >
                <CreditCard className="h-3.5 w-3.5" />
                {t('myPackages.viewPayments')}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </Card>
  );
}