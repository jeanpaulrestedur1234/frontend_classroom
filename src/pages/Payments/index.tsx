import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, ListFilter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePaginatedQuery, useMutation } from '@/hooks';
import { listPayments, approvePayment, uploadReceipt } from '@/services/payments';
import type { PaymentDTO } from '@/types';

import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import PaymentCard from './components/PaymentCard';
import RejectPaymentModal from './components/RejectPaymentModal';
import UploadReceiptModal from './components/UploadReceiptModal';

const PAGE_SIZE = 100;

export default function Payments() {
  const { user } = useAuth();
  const { t } = useTranslation('payments');
  const { t: tc } = useTranslation('common');
  const { success: toastSuccess, error: toastError } = useToast();

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const packageId = query.get('package_id') ?? undefined;

  // API hooks
  const { data: allPayments, loading, refetch } = usePaginatedQuery<PaymentDTO>(
    (page) => listPayments(page, PAGE_SIZE, packageId),
    { pageSize: PAGE_SIZE },
  );
  const approveMut = useMutation(approvePayment);
  const uploadMut = useMutation(uploadReceipt);

  // Filters & frontend pagination
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [displayPage, setDisplayPage] = useState(1);
  const displayPageSize = 20;

  // Modals state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Derived filtered arrays
  const filteredPayments = useMemo(() => {
    return statusFilter === 'all' ? allPayments : allPayments.filter((p) => p.status === statusFilter);
  }, [allPayments, statusFilter]);

  const totalFiltered = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / displayPageSize));
  const safePage = Math.min(displayPage, totalPages);
  const startIdx = (safePage - 1) * displayPageSize;
  const endIdx = Math.min(startIdx + displayPageSize, totalFiltered);
  const pagePayments = filteredPayments.slice(startIdx, endIdx);

  if (!user) return null;

  /* ─────────────────────── Handlers ─────────────────────────────────────── */

  async function handleApprove(id: string) {
    setApprovingId(id);
    try {
      await approveMut.execute(id, { approve: true });
      toastSuccess(t('admin.approveSuccess'));
      refetch();
    } catch {
      toastError(t('admin.error'));
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(id: string, reason: string) {
    try {
      await approveMut.execute(id, { approve: false, rejection_reason: reason });
      setRejectingId(null);
      toastSuccess(t('admin.rejectSuccess'));
      refetch();
    } catch {
      toastError(t('admin.error'));
    }
  }

  async function handleUploadReceipt(id: string, url: string) {
    try {
      await uploadMut.execute(id, { payment_proof_url: url });
      setUploadingId(null);
      toastSuccess(t('student.uploadSuccess'));
      refetch();
    } catch {
      toastError(t('student.uploadError'));
    }
  }

  /* ─────────────────────── Render ───────────────────────────────────────── */

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)] tracking-tight">
          {isAdmin ? t('title') : t('student.title')}
        </h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
      </div>

      {/* Status filter + result info bar */}
      {!loading && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <ListFilter className="h-4 w-4 text-[var(--text-muted)]" />
            <Select
              options={[
                { value: 'all', label: t('filter.allStatuses') },
                { value: 'pending', label: tc('status.pending') },
                { value: 'notified', label: tc('status.notified') },
                { value: 'confirmed', label: tc('status.confirmed') },
                { value: 'rejected', label: tc('status.rejected') },
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setDisplayPage(1); // Reset page on filter change
              }}
            />
          </div>

          {totalFiltered > 0 && (
            <p className="text-sm text-[var(--text-muted)]">
              {t('pagination.showing', {
                from: startIdx + 1,
                to: endIdx,
                total: totalFiltered,
              })}
            </p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Empty state */}
      {!loading && filteredPayments.length === 0 && (
        <EmptyState
          icon={<CreditCard className="h-12 w-12" />}
          title={t('noPayments')}
          description={t('noPaymentsDesc')}
        />
      )}

      {/* Payment cards */}
      {!loading && pagePayments.length > 0 && (
        <div className="space-y-4">
          {pagePayments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              isAdmin={isAdmin}
              approvingId={approvingId}
              onApprove={handleApprove}
              onReject={setRejectingId}
              onUploadReceipt={setUploadingId}
            />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {!loading && totalFiltered > displayPageSize && (
        <div className="flex items-center justify-between pt-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={safePage <= 1}
            onClick={() => setDisplayPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('pagination.previous')}
          </Button>

          <span className="text-sm text-[var(--text-muted)] font-[family-name:var(--font-display)]">
            {t('pagination.page', {
              current: safePage,
              total: totalPages,
            })}
          </span>

          <Button
            size="sm"
            variant="secondary"
            disabled={safePage >= totalPages}
            onClick={() => setDisplayPage((p) => Math.min(totalPages, p + 1))}
          >
            {t('pagination.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modals */}
      <RejectPaymentModal
        paymentId={rejectingId}
        loading={approveMut.loading}
        onClose={() => setRejectingId(null)}
        onSubmit={handleReject}
      />

      <UploadReceiptModal
        paymentId={uploadingId}
        loading={uploadMut.loading}
        onClose={() => setUploadingId(null)}
        onSubmit={handleUploadReceipt}
      />
    </div>
  );
}
