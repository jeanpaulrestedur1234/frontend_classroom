import { CreditCard, ExternalLink, CheckCircle, XCircle, Upload, Package, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '@/utils';
import type { PaymentDTO } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface PaymentCardProps {
  payment: PaymentDTO;
  isAdmin: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  approvingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUploadReceipt: (id: string) => void;
}

function paymentBadgeVariant(status: string): 'warning' | 'success' | 'danger' | 'info' | 'default' {
  switch (status) {
    case 'pending': return 'warning';
    case 'notified': return 'info';
    case 'confirmed': return 'success';
    case 'rejected': return 'danger';
    default: return 'default';
  }
}

const statusAccent: Record<string, string> = {
  confirmed: 'bg-emerald-500',
  rejected: 'bg-rose-500',
  notified: 'bg-blue-500',
  pending: 'bg-amber-500',
};

export default function PaymentCard({
  payment,
  isAdmin,
  isExpanded,
  onToggle,
  approvingId,
  onApprove,
  onReject,
  onUploadReceipt,
}: PaymentCardProps) {
  const { t } = useTranslation('payments');
  const { t: tc } = useTranslation('common');

  const initials = payment.student_name
    ? payment.student_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const accent = statusAccent[payment.status] ?? 'bg-[var(--primary)]';

  return (
    <Card className={`relative overflow-hidden rounded-2xl border bg-[var(--bg-surface)] transition-all duration-300 ${isExpanded ? 'border-[var(--primary)]/30 shadow-lg' : 'border-[var(--border-main)] hover:shadow-md'}`}>

      {/* Left status accent bar */}
      <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />

      <div className="flex flex-col">
        {/* ── Header (Always Visible) ── */}
        <div
          className={`px-5 py-4 sm:px-6 cursor-pointer hover:bg-[var(--bg-subtle)]/50 transition-colors flex items-center justify-between gap-4 ${isExpanded ? 'border-b border-[var(--border-main)]' : ''}`}
          onClick={onToggle}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 shrink-0 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] text-xs font-bold transition-transform ${isExpanded ? 'scale-105 shadow-sm' : ''}`}>
              {isAdmin ? initials : <CreditCard className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-heading)] leading-snug truncate">
                {payment.student_name || t('table.unknownStudent')}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Package className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                <span className="text-xs text-[var(--text-muted)] truncate">
                  {payment.package_name || tc('status.package')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-end">
              <span className="text-base font-bold tabular-nums text-[var(--text-heading)] tracking-tight">
                {formatCurrency(payment.amount)}
              </span>
              <Badge
                variant={paymentBadgeVariant(payment.status)}
                className="px-2 py-0 rounded-full text-[9px] uppercase font-bold tracking-wider mt-1"
              >
                {tc(`status.${payment.status}`)}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
            )}
          </div>
        </div>

        {/* ── Expandable Details ── */}
        {isExpanded && (
          <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-4 space-y-5">
            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3 border-y border-[var(--border-main)]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[var(--text-dim)]">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">{t('table.createdAt')}</span>
                </div>
                <p className="text-xs font-medium text-[var(--text-body)]">{formatDate(payment.created_at)}</p>
              </div>

              {payment.reviewed_at && (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-[var(--text-dim)]">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">{t('table.reviewedAt')}</span>
                  </div>
                  <p className="text-xs font-medium text-[var(--text-body)]">{formatDate(payment.reviewed_at)}</p>
                </div>
              )}
            </div>

            {/* Proof + rejection reason */}
            {(payment.payment_proof_url || (payment.status === 'rejected' && payment.rejection_reason)) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {payment.payment_proof_url && (
                  <a
                    href={payment.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)]/6 text-[var(--primary)] hover:bg-[var(--primary)]/12 transition-colors text-xs font-semibold border border-[var(--primary)]/15 w-fit"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t('viewProof')}
                  </a>
                )}

                {payment.status === 'rejected' && payment.rejection_reason && (
                  <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-500/8 border border-rose-500/20 flex-1">
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-rose-500 tracking-widest mb-0.5">
                        {t('admin.rejectionReason')}
                      </p>
                      <p className="text-xs text-rose-600 font-medium leading-relaxed">
                        {payment.rejection_reason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {isAdmin && (payment.status === 'pending' || payment.status === 'notified') && (
              <div className="flex items-center gap-2.5 pt-1">
                <Button
                  className="flex-1 h-10 text-sm"
                  loading={approvingId === payment.id}
                  onClick={(e) => { e.stopPropagation(); onApprove(payment.id); }}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  {tc('actions.approve')}
                </Button>
                <Button
                  className="flex-1 h-10 text-sm"
                  variant="danger"
                  onClick={(e) => { e.stopPropagation(); onReject(payment.id); }}
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  {tc('actions.reject')}
                </Button>
              </div>
            )}

            {!isAdmin && payment.status === 'pending' && (
              <Button
                size="lg"
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); onUploadReceipt(payment.id); }}
                className="w-full h-10 text-sm"
              >
                <Upload className="h-4 w-4 mr-1.5" />
                {t('student.uploadReceipt')}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}