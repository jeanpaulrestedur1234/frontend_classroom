import { Clock, CalendarDays, BookOpen, CreditCard, ExternalLink, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, formatCurrency } from '@/utils';
import { getPaymentByPackageId } from '@/services/payments';
import type { StudentPackageDTO, PaymentDTO, ClassType } from '@/types';

export interface StudentPackageWithPayments extends StudentPackageDTO {
  payments?: PaymentDTO[];
}

interface MyPackageCardProps {
  pkg: StudentPackageWithPayments;
  activatingId: string | null;
  onActivate: (id: string) => void;
  onUploadModalOpen: (paymentId: string, packageId: string) => void;
  onCreatePaymentAndUpload: (packageId: string) => void;
  isCreatingPayment?: boolean;
}

function statusBadgeVariant(status: string): 'warning' | 'success' | 'danger' | 'info' | 'default' {
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

function classTypeBadgeVariant(ct: ClassType): 'info' | 'success' | 'warning' {
  switch (ct) {
    case 'open_group': return 'info';
    case 'closed_group': return 'success';
    case 'private': return 'warning';
  }
}

export default function MyPackageCard({
  pkg,
  activatingId,
  onActivate,
  onUploadModalOpen,
  onCreatePaymentAndUpload,
  isCreatingPayment,
}: MyPackageCardProps) {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const [modalOpen, setModalOpen] = useState(false);
  const [paymentsData, setPaymentsData] = useState<PaymentDTO[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      setPaymentsLoading(true);
      getPaymentByPackageId(pkg.id)
        .then((response) => {
          setPaymentsData(response);
          setPaymentsLoading(false);
        })
        .catch(() => {
          setPaymentsLoading(false);
        });
    }
  }, [modalOpen, pkg.id]);

  const totalClasses = pkg.hours_per_week * pkg.duration_weeks;
  const consumed = pkg.bookings_count || 0;
  const remaining = Math.max(0, totalClasses - consumed);
  const progress = Math.min(100, (consumed / totalClasses) * 100);

  const payments = pkg.payments || [];

  return (
    <>
      <Card className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-[var(--primary)]/30 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden rounded-2xl">

        {/* Header */}
        <div className="p-5 border-b border-[var(--border-main)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 flex-shrink-0">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-medium mb-1">
                  {tc(`classTypes.${pkg.class_type}`)}
                </p>
                <h3 className="text-sm font-semibold text-[var(--text-heading)] leading-tight">
                  {pkg.hours_per_week} {tc('time.hoursPerWeek')} · {pkg.duration_weeks} {tc('time.weeks')}
                </h3>
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

        <div className="p-5 space-y-4 flex-1">

          {/* Usage Progress */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">{t('myPackages.usage')}</span>
              </div>
              <span className="text-xs font-semibold text-[var(--primary)]">
                {consumed} / {totalClasses} {t('myPackages.totalClasses')}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[var(--border-main)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--text-dim)]">
              <span>{Math.round(progress)}% {tc('actions.completed', 'Completado')}</span>
              <span>{t('myPackages.remaining', { count: remaining })}</span>
            </div>
          </div>

          {/* Dates Grid */}
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

          {/* Payment History Preview */}
          {payments.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-main)]">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
                  {t('myPackages.payments')}
                </h4>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-[10px] text-[var(--primary)] hover:underline font-semibold"
                >
                  {t('myPackages.viewPayments')}
                </button>
              </div>
              <div className="space-y-2">
                {payments.slice(0, 1).map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <span className="text-xs font-semibold text-[var(--text-body)]">{formatCurrency(payment.amount)}</span>
                    </div>
                    <Badge variant={statusBadgeVariant(payment.status)} className="text-[9px] uppercase">
                      {tc(`status.${payment.status}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        {(pkg.status === 'inactive' && pkg.payment_status === 'paid') || pkg.payment_status !== 'paid' ? (
          <div className="px-5 py-4 border-t border-[var(--border-main)] flex flex-wrap gap-2">
            {pkg.status === 'inactive' && pkg.payment_status === 'paid' && (
              <Button size="sm" loading={activatingId === pkg.id} onClick={() => onActivate(pkg.id)} className="flex-1">
                <Play className="h-3.5 w-3.5" />
                {t('myPackages.activatePackage')}
              </Button>
            )}
            {pkg.payment_status !== 'paid' && (
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => setModalOpen(true)}
              >
                <CreditCard className="h-3.5 w-3.5 text-[var(--primary)]" />
                {t('myPackages.viewPayments')}
              </Button>
            )}
          </div>
        ) : null}
      </Card>

      {/* Payments Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('myPackages.payments')}>
        <div className="space-y-3">
          {paymentsLoading ? (
            <LoadingSpinner />
          ) : Array.isArray(paymentsData) && paymentsData.length > 0 ? (
            paymentsData.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-main)] px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border-main)] text-[var(--primary)]">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[var(--text-heading)]">{formatCurrency(payment.amount)}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={statusBadgeVariant(payment.status)} className="text-[9px] uppercase px-1.5 py-0">
                        {tc(`status.${payment.status}`)}
                      </Badge>
                      <span className="text-[10px] text-[var(--text-dim)]">{formatDate(payment.created_at)}</span>
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
                    <button
                      onClick={() => onUploadModalOpen(payment.id, pkg.id)}
                      className="text-[10px] text-[var(--primary)] font-semibold hover:underline"
                    >
                      {t('myPackages.uploadReceipt')}
                    </button>
                  )}
                  {payment.status === 'rejected' && payment.rejection_reason && (
                    <span className="text-xs font-medium text-rose-500 bg-rose-500/10 px-3 py-1 rounded-lg">
                      {payment.rejection_reason}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center space-y-2">
              <CreditCard className="h-10 w-10 text-[var(--border-main)] mx-auto" />
              <p className="text-sm text-[var(--text-dim)] font-medium">{t('myPackages.noPayments')}</p>
            </div>
          )}

          {!paymentsLoading && 
            Array.isArray(paymentsData) && 
            paymentsData.some((p) => p.status === 'rejected') && 
            !paymentsData.some((p) => p.status === 'notified') && (
            <div className="pt-4 border-t border-[var(--border-main)]">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setModalOpen(false);
                  onCreatePaymentAndUpload(pkg.id);
                }}
                loading={isCreatingPayment}
                className="w-full"
              >
                <CreditCard className="h-4 w-4" />
                {t('myPackages.newPayment')} / {t('myPackages.uploadReceipt')}
              </Button>
            </div>
          )}

          {!paymentsLoading && Array.isArray(paymentsData) && paymentsData.some((p) => p.status === 'confirmed') && pkg.status !== 'active' && (
            <div className="pt-4 border-t border-[var(--border-main)]">
              <Button loading={activatingId === pkg.id} onClick={() => onActivate(pkg.id)} className="w-full">
                <Play className="h-4 w-4" />
                {t('myPackages.activatePackage')}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}