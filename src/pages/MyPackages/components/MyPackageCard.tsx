import { Clock, CalendarDays, BookOpen, CreditCard, ExternalLink, Play, FileUp } from 'lucide-react';
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
  const hasConfirmedPayment = payments.some((p) => p.status === 'confirmed');
  const hasPendingPayment = payments.some((p) => p.status === 'pending' || p.status === 'notified');

  return (
    <>
      <Card className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-[var(--primary)]/30 transition-all duration-300 shadow-sm hover:shadow-xl group overflow-hidden">
        {/* Top Header with Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)]/20 via-[var(--primary)] to-[var(--primary)]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="p-6 space-y-6 flex-1">
          {/* Header Area */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-inner">
                <BookOpen className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant={classTypeBadgeVariant(pkg.class_type)} className="uppercase text-[9px] tracking-wider font-bold">
                    {tc(`classTypes.${pkg.class_type}`)}
                  </Badge>
                  <Badge variant={statusBadgeVariant(pkg.status)} className="capitalize px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block animate-pulse" />
                    {tc(`status.${pkg.status}`)}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-heading)]">
                  {pkg.hours_per_week} {tc('time.hoursPerWeek')} • {pkg.duration_weeks} {tc('time.weeks')}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[var(--primary)] font-[family-name:var(--font-display)]">
                {formatCurrency(pkg.total_price)}
              </span>
              <p className="text-[10px] text-[var(--text-dim)] uppercase tracking-tighter">
                {t('myPackages.totalPrice')}
              </p>
            </div>
          </div>

          {/* Usage Stats Section */}
          <div className="p-4 rounded-2xl bg-[var(--bg-subtle)]/50 border border-[var(--border-main)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-xs font-semibold text-[var(--text-body)] capitalize">{t('myPackages.usage')}</span>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--primary)]">
                {consumed} / {totalClasses} {t('myPackages.totalClasses')}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-2.5 bg-[var(--border-main)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-blue-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-dim)] font-medium">
                <span>{Math.round(progress)}% {tc('actions.completed', 'Completado')}</span>
                <span>{t('myPackages.remaining', { count: remaining })}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 group/item">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center border border-[var(--border-main)]">
                <Clock className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--text-dim)] tracking-wider">{t('myPackages.createdAt')}</p>
                <p className="text-xs font-medium text-[var(--text-body)]">{formatDate(pkg.created_at)}</p>
              </div>
            </div>
            {pkg.activated_at && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center border border-[var(--border-main)]">
                  <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-[var(--text-dim)] tracking-wider">{t('myPackages.activatedAt')}</p>
                  <p className="text-xs font-medium text-[var(--text-body)]">{formatDate(pkg.activated_at)}</p>
                </div>
              </div>
            )}
            {pkg.expires_at && (
              <div className="col-span-2 flex items-center gap-3 pt-2 mt-2 border-t border-[var(--border-main)]/50">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <CalendarDays className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-[var(--text-dim)] tracking-wider font-bold text-orange-500/70">{t('myPackages.expiresAt')}</p>
                  <p className="text-xs font-bold text-[var(--text-body)]">{formatDate(pkg.expires_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Payment History Preview */}
          {payments.length > 0 && (
            <div className="pt-4 border-t border-[var(--border-main)]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
                  {t('myPackages.payments')}
                </h4>
                <button 
                  onClick={() => setModalOpen(true)}
                  className="text-[10px] text-[var(--primary)] hover:underline font-bold"
                >
                  {t('myPackages.viewPayments')}
                </button>
              </div>
              <div className="space-y-2">
                {payments.slice(0, 1).map((payment) => (
                  <div key={payment.id} className="p-3 rounded-xl bg-[var(--bg-subtle)]/30 border border-[var(--border-main)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3 text-[var(--text-muted)]" />
                      <span className="text-xs font-medium">{formatCurrency(payment.amount)}</span>
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
        <div className="px-6 py-4 bg-[var(--bg-subtle)]/50 border-t border-[var(--border-main)] flex flex-wrap gap-2">
          {pkg.status === 'inactive' && hasConfirmedPayment && (
            <Button size="sm" loading={activatingId === pkg.id} onClick={() => onActivate(pkg.id)} className="flex-1">
              <Play className="h-4 w-4" />
              {t('myPackages.activatePackage')}
            </Button>
          )}

          {hasPendingPayment && (
            <Button
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                const pendingPayment = payments.find((p) => p.status === 'pending');
                if (pendingPayment) {
                  onUploadModalOpen(pendingPayment.id, pkg.id);
                }
              }}
            >
              <FileUp className="h-4 w-4 text-orange-500" />
              {t('myPackages.uploadReceipt')}
            </Button>
          )}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('myPackages.payments')}>
        <div className="space-y-4">
          {paymentsLoading ? (
            <LoadingSpinner />
          ) : Array.isArray(paymentsData) && paymentsData.length > 0 ? (
            paymentsData.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-main)] px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border-main)] shadow-sm text-[var(--primary)]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-[var(--text-heading)]">{formatCurrency(payment.amount)}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={statusBadgeVariant(payment.status)} className="text-[10px] uppercase px-1.5 py-0">
                        {tc(`status.${payment.status}`)}
                      </Badge>
                      <span className="text-[10px] text-[var(--text-dim)] font-medium">
                        {formatDate(payment.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {payment.payment_proof_url && (
                    <a
                      href={payment.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                      title={tc('actions.viewDetails')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {payment.status === 'rejected' && payment.rejection_reason && (
                    <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-lg">
                      {payment.rejection_reason}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-3">
              <CreditCard className="h-12 w-12 text-[var(--border-strong)] mx-auto animate-bounce" />
              <p className="text-sm text-[var(--text-dim)] italic font-medium">{t('myPackages.noPayments')}</p>
            </div>
          )}
          
          {!paymentsLoading && Array.isArray(paymentsData) && paymentsData.some((p) => p.status === 'confirmed') && pkg.status !== 'active' && (
            <div className="pt-6 mt-2 border-t border-[var(--border-main)]">
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
