import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Clock,
  CalendarDays,
  CreditCard,
  Play,
  MoreVertical,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ClassType, PaymentDTO } from '@/types';
import { formatDate, formatCurrency } from '@/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getPaymentByPackageId } from '@/services/payments';
import type { StudentPackageDTO } from '@/types';

export interface StudentPackageWithPayments extends StudentPackageDTO {
  payments?: PaymentDTO[];
}

interface MyPackageRowProps {
  pkg: StudentPackageWithPayments;
  activatingId: string | null;
  onActivate: (id: string) => void;
  onUploadModalOpen: (paymentId: string, packageId: string) => void;
  onCreatePaymentAndUpload: (packageId: string) => void;
  isCreatingPayment?: boolean;
}

/* ─── helpers ─── */
function statusBadgeVariant(status: string): 'warning' | 'success' | 'danger' | 'info' | 'default' {
  switch (status) {
    case 'inactive': return 'warning';
    case 'active':   return 'success';
    case 'pending':  return 'warning';
    case 'notified': return 'info';
    case 'confirmed':return 'success';
    case 'rejected': return 'danger';
    case 'expired':  return 'danger';
    default:         return 'default';
  }
}

function packageIconColor(ct: ClassType): string {
  switch (ct) {
    case 'open_group':   return 'bg-teal-50 border-teal-100 text-teal-700';
    case 'closed_group': return 'bg-blue-50 border-blue-100 text-blue-700';
    case 'private':      return 'bg-purple-50 border-purple-100 text-purple-700';
    default:             return 'bg-gray-50 border-gray-100 text-gray-600';
  }
}

function expiryColor(daysLeft: number | null, expired: boolean): string {
  if (expired || (daysLeft !== null && daysLeft < 0)) return 'text-red-600';
  if (daysLeft !== null && daysLeft <= 3)              return 'text-amber-600';
  return 'text-green-700';
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function daysLabel(days: number | null, t: (k: string, o?: object) => string): string {
  if (days === null) return '';
  if (days < 0)  return t('myPackages.expiredAgo',  { count: Math.abs(days) });
  if (days === 0) return t('myPackages.expirestoday');
  if (days === 1) return t('myPackages.expiresIn1');
  return t('myPackages.expiresInN', { count: days });
}

/* ─── component ─── */
export default function MyPackageRow({
  pkg,
  activatingId,
  onActivate,
  onUploadModalOpen,
  onCreatePaymentAndUpload,
  isCreatingPayment,
}: MyPackageRowProps) {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const [modalOpen, setModalOpen]       = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [isExpanded, setIsExpanded]     = useState(false);
  const [paymentsData, setPaymentsData] = useState<PaymentDTO[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      setPaymentsLoading(true);
      getPaymentByPackageId(pkg.id)
        .then(setPaymentsData)
        .catch(() => {})
        .finally(() => setPaymentsLoading(false));
    }
  }, [modalOpen, pkg.id]);

  const totalClasses = pkg.hours_per_week * pkg.duration_weeks;
  const consumed     = pkg.bookings_count ?? 0;
  const remaining    = Math.max(0, totalClasses - consumed);
  const progress     = totalClasses > 0 ? Math.min(100, Math.round((consumed / totalClasses) * 100)) : 0;

  const daysLeft = daysUntil(pkg.expires_at);
  const isExpired = pkg.status === 'expired' || (daysLeft !== null && daysLeft < 0);
  const expColor  = expiryColor(daysLeft, isExpired);

  /* progress bar color */
  let barColor = 'bg-green-600';
  if (isExpired || progress === 100) barColor = 'bg-red-500';
  else if (progress >= 80)           barColor = 'bg-amber-500';
  else if (pkg.status === 'inactive') barColor = 'bg-gray-300';

  const payments = pkg.payments ?? [];
  const showActivateBtn  = pkg.status === 'inactive' && pkg.payment_status === 'paid';
  const showPaymentBtn   = pkg.payment_status !== 'paid';

  return (
    <>
      <tr 
        className="border-b border-[var(--border-main)] hover:bg-[var(--bg-subtle)] transition-colors duration-150 group cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-4 py-3.5 w-10 text-center">
          <button 
            className="text-[var(--text-dim)] hover:text-[var(--text-body)] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>

        {/* Package name + id */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${packageIconColor(pkg.class_type)}`}>
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-heading)] leading-tight">
                {tc(`classTypes.${pkg.class_type}`)}
              </p>
              <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                ID: {pkg.id.slice(0, 8)}…
              </p>
            </div>
          </div>
        </td>

        {/* Price */}
        <td className="px-4 py-3.5">
          <span className="text-sm font-semibold text-[var(--text-heading)] whitespace-nowrap">
            {formatCurrency(pkg.total_price)}
          </span>
        </td>

        {/* Weeks */}
        <td className="px-4 py-3.5">
          <span className="text-sm font-semibold text-[var(--text-body)]">{pkg.duration_weeks}w</span>
          <span className="block text-[11px] text-[var(--text-dim)]">{t('myPackages.col.weeksLabel')}</span>
        </td>

        {/* Usage progress */}
        <td className="px-4 py-3.5 min-w-[130px]">
          <div className="text-xs font-semibold text-[var(--text-body)] mb-1">
            {consumed} / {totalClasses}
          </div>
          <div className="h-[5px] w-full rounded-full bg-[var(--border-main)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-[var(--text-dim)]">{progress}% {tc('actions.completed')}</span>
            <span className="text-[10px] text-[var(--text-dim)]">{remaining} {t('myPackages.remaining', { count: remaining })}</span>
          </div>
        </td>

        {/* Status badge */}
        <td className="px-4 py-3.5">
          <Badge variant={statusBadgeVariant(pkg.status)} className="capitalize text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 inline-block" />
            {tc(`status.${pkg.status}`)}
          </Badge>
        </td>

        {/* Expiry / activation */}
        <td className="px-4 py-3.5 min-w-[140px]">
          {pkg.expires_at ? (
            <>
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-dim)] mb-0.5">
                <CalendarDays className="h-3 w-3" />
                {isExpired
                  ? t('myPackages.expiredOn')
                  : t('myPackages.expiresOn')}
              </div>
              <p className={`text-sm font-semibold ${expColor}`}>{formatDate(pkg.expires_at)}</p>
              <p className={`text-[11px] mt-0.5 ${expColor}`}>{daysLabel(daysLeft, t)}</p>
            </>
          ) : pkg.status === 'inactive' ? (
            <>
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-dim)] mb-0.5">
                <CalendarDays className="h-3 w-3" />
                {t('myPackages.activateBefore')}
              </div>
              <p className="text-sm font-semibold text-green-700">
                {pkg.activation_deadline ? formatDate(pkg.activation_deadline) : '—'}
              </p>
              {pkg.activation_deadline && (
                <p className="text-[11px] mt-0.5 text-green-700">
                  {daysLabel(daysUntil(pkg.activation_deadline), t)}
                </p>
              )}
            </>
          ) : (
            <span className="text-sm text-[var(--text-dim)]">—</span>
          )}
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            {showActivateBtn && (
              <Button
                size="sm"
                loading={activatingId === pkg.id}
                onClick={() => onActivate(pkg.id)}
                className="whitespace-nowrap"
              >
                <Play className="h-3 w-3" />
                {t('myPackages.activatePackage')}
              </Button>
            )}

            {!showActivateBtn && !isExpired && (
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs text-[var(--primary)] font-semibold hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                {t('myPackages.viewDetails')}
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* kebab menu for expired / extra actions */}
            {(isExpired || showPaymentBtn) && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-7 h-7 rounded-lg border border-[var(--border-main)] flex items-center justify-center text-[var(--text-dim)] hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-8 z-10 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl shadow-lg py-1 min-w-[160px]"
                    onBlur={() => setMenuOpen(false)}
                  >
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-body)] hover:bg-[var(--bg-subtle)] flex items-center gap-2"
                      onClick={() => { setMenuOpen(false); setModalOpen(true); }}
                    >
                      <CreditCard className="h-3.5 w-3.5 text-[var(--text-dim)]" />
                      {t('myPackages.viewPayments')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {isExpanded && (
        <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-main)]">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 ml-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center flex-shrink-0">
                  <Clock className="h-3.5 w-3.5 text-[var(--text-dim)]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-medium mb-0.5">{t('myPackages.col.hrsWeek')}</p>
                  <p className="text-sm font-semibold text-[var(--text-body)]">{pkg.hours_per_week}h <span className="text-[11px] font-normal text-[var(--text-dim)]">{t('myPackages.col.perWeek')}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-3.5 w-3.5 text-[var(--text-dim)]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-medium mb-0.5">{t('myPackages.col.totalHrs')}</p>
                  <p className="text-sm font-semibold text-[var(--text-body)]">{totalClasses}h <span className="text-[11px] font-normal text-[var(--text-dim)]">{t('myPackages.col.totals')}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-3.5 w-3.5 text-[var(--text-dim)]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-medium mb-0.5">{t('myPackages.col.discount')}</p>
                  {pkg.discount_pct > 0 ? (
                    <p className="text-sm font-semibold text-green-700">{pkg.discount_pct}%</p>
                  ) : (
                    <p className="text-sm text-[var(--text-dim)]">—</p>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Payments modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('myPackages.payments')}
      >
        <div className="space-y-3">
          {paymentsLoading ? (
            <LoadingSpinner />
          ) : paymentsData.length > 0 ? (
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
                    <span className="text-sm font-bold text-[var(--text-heading)]">
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
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {payment.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => { setModalOpen(false); onUploadModalOpen(payment.id, pkg.id); }}
                    >
                      {t('myPackages.uploadReceipt')}
                    </Button>
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
              <p className="text-sm text-[var(--text-dim)] font-medium">
                {t('myPackages.noPayments')}
              </p>
            </div>
          )}

          {/* Create new payment after rejection */}
          {!paymentsLoading &&
            paymentsData.some((p) => p.status === 'rejected') &&
            !paymentsData.some((p) => p.status === 'notified') && (
              <div className="pt-4 border-t border-[var(--border-main)]">
                <Button
                  size="sm"
                  variant="secondary"
                  loading={isCreatingPayment}
                  className="w-full"
                  onClick={() => { setModalOpen(false); onCreatePaymentAndUpload(pkg.id); }}
                >
                  <CreditCard className="h-4 w-4" />
                  {t('myPackages.newPayment')} / {t('myPackages.uploadReceipt')}
                </Button>
              </div>
            )}

          {/* Activate if payment confirmed */}
          {!paymentsLoading &&
            paymentsData.some((p) => p.status === 'confirmed') &&
            pkg.status !== 'active' && (
              <div className="pt-4 border-t border-[var(--border-main)]">
                <Button
                  loading={activatingId === pkg.id}
                  className="w-full"
                  onClick={() => { setModalOpen(false); onActivate(pkg.id); }}
                >
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
