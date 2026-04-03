import { CreditCard, ExternalLink, CheckCircle, XCircle, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '@/utils';
import type { PaymentDTO } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface PaymentCardProps {
  payment: PaymentDTO;
  isAdmin: boolean;
  approvingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUploadReceipt: (id: string) => void;
}

function truncateId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
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

export default function PaymentCard({
  payment,
  isAdmin,
  approvingId,
  onApprove,
  onReject,
  onUploadReceipt,
}: PaymentCardProps) {
  const { t } = useTranslation('payments');
  const { t: tc } = useTranslation('common');

  return (
    <Card className="space-y-4 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* Top row: ID + amount/status */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">
              #{truncateId(payment.id)}
            </p>
            <p className="text-xs text-zinc-500">
              {t('table.studentId')}: {payment.student_id} &middot;{' '}
              {t('table.packageId')}: {truncateId(payment.student_package_id)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-zinc-900 font-[family-name:var(--font-display)]">
            {formatCurrency(payment.amount)}
          </span>
          <Badge variant={paymentBadgeVariant(payment.status)}>
            {tc(`status.${payment.status}`)}
          </Badge>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-xs">
        <div>
          <span className="text-zinc-500">{t('table.createdAt')}</span>
          <p className="text-zinc-700 mt-0.5">{formatDate(payment.created_at)}</p>
        </div>
        <div>
          <span className="text-zinc-500">{t('table.updatedAt')}</span>
          <p className="text-zinc-700 mt-0.5">{formatDate(payment.updated_at)}</p>
        </div>
        {payment.reviewed_at && (
          <div>
            <span className="text-zinc-500">{t('table.reviewedAt')}</span>
            <p className="text-zinc-700 mt-0.5">{formatDate(payment.reviewed_at)}</p>
          </div>
        )}
        {payment.reviewed_by && (
          <div>
            <span className="text-zinc-500">{t('table.reviewedBy')}</span>
            <p className="text-zinc-700 mt-0.5">{payment.reviewed_by}</p>
          </div>
        )}
      </div>

      {/* Proof URL */}
      {payment.payment_proof_url && (
        <div className="flex items-center gap-2">
          <a
            href={payment.payment_proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {t('viewProof')}
          </a>
        </div>
      )}

      {/* Rejection reason */}
      {payment.rejection_reason && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2">
          <p className="text-xs text-rose-600">
            <span className="font-medium">{t('admin.rejectionReason')}:</span>{' '}
            {payment.rejection_reason}
          </p>
        </div>
      )}

      {/* Admin actions: Approve / Reject */}
      {isAdmin && (payment.status === 'pending' || payment.status === 'notified') && (
        <div className="flex gap-3 pt-1">
          <Button
            size="sm"
            loading={approvingId === payment.id}
            onClick={() => onApprove(payment.id)}
          >
            <CheckCircle className="h-4 w-4" />
            {tc('actions.approve')}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onReject(payment.id)}
          >
            <XCircle className="h-4 w-4" />
            {tc('actions.reject')}
          </Button>
        </div>
      )}

      {/* Student actions: Upload Receipt */}
      {!isAdmin && payment.status === 'pending' && (
        <div className="flex gap-3 pt-1">
          <Button size="sm" variant="secondary" onClick={() => onUploadReceipt(payment.id)}>
            <Upload className="h-4 w-4" />
            {t('student.uploadReceipt')}
          </Button>
        </div>
      )}
    </Card>
  );
}
