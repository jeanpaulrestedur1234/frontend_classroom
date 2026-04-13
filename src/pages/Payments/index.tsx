import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, ChevronLeft, ChevronRight, Search, X, ArrowUpDown, Calendar } from 'lucide-react';
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
import UploadReceiptModal from '@/components/shared/UploadReceiptModal';

const PAGE_SIZE = 100;
const DISPLAY_SIZE = 20;

type SortKey = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

const STATUS_META: Record<string, { dot: string; labelKey: string }> = {
  pending: { dot: 'bg-amber-400', labelKey: 'status.pending' },
  notified: { dot: 'bg-blue-400', labelKey: 'status.notified' },
  confirmed: { dot: 'bg-emerald-400', labelKey: 'status.confirmed' },
  rejected: { dot: 'bg-rose-400', labelKey: 'status.rejected' },
};

function sortPayments(list: PaymentDTO[], key: SortKey): PaymentDTO[] {
  return [...list].sort((a, b) => {
    switch (key) {
      case 'date_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'date_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'amount_asc': return a.amount - b.amount;
      case 'amount_desc': return b.amount - a.amount;
    }
  });
}

export default function Payments() {
  const { user } = useAuth();
  const { t } = useTranslation('payments');
  const { t: tc } = useTranslation('common');
  const { success: toastSuccess, error: toastError } = useToast();

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const packageId = query.get('package_id') ?? undefined;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date_desc');
  const [displayPage, setDisplayPage] = useState(1);

  const { data: allPayments, loading, refetch } = usePaginatedQuery<PaymentDTO>(
    (page) => listPayments(page, PAGE_SIZE, { studentPackageId: packageId }),
    { pageSize: PAGE_SIZE },
  );


  const approveMut = useMutation(approvePayment);
  const uploadMut = useMutation(uploadReceipt);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Counts from the full dataset (not affected by active filters)
  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = { all: allPayments.length };
    for (const p of allPayments) {
      counts[p.status] = (counts[p.status] ?? 0) + 1;
    }
    return counts;
  }, [allPayments]);

  // Filtered + sorted list (all done on the frontend when data fits in PAGE_SIZE)
  const filteredPayments = useMemo(() => {
    let list = allPayments;

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate).getTime();
      list = list.filter((p) => new Date(p.created_at).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000; // include full end day
      list = list.filter((p) => new Date(p.created_at).getTime() < end);
    }

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.student_name?.toLowerCase().includes(q) ||
          p.package_name?.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      );
    }

    return sortPayments(list, sortKey);
  }, [allPayments, statusFilter, startDate, endDate, search, sortKey]);

  const totalFiltered = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / DISPLAY_SIZE));
  const safePage = Math.min(displayPage, totalPages);
  const startIdx = (safePage - 1) * DISPLAY_SIZE;
  const endIdx = Math.min(startIdx + DISPLAY_SIZE, totalFiltered);
  const pagePayments = filteredPayments.slice(startIdx, endIdx);

  const isDirty = statusFilter !== 'all' || search !== '' || sortKey !== 'date_desc' || startDate !== '' || endDate !== '';

  function resetFilters() {
    setStatusFilter('all');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSortKey('date_desc');
    setDisplayPage(1);
  }

  function handleStatusChange(status: string) {
    setStatusFilter(status);
    setDisplayPage(1);
  }

  if (!user) return null;

  /* ── Handlers ─────────────────────────────────────────────────────────── */

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

  async function handleUploadReceipt(id: string | null, url: string) {
    if (!id) return;
    try {
      await uploadMut.execute(id, { payment_proof_url: url });
      setUploadingId(null);
      toastSuccess(t('student.uploadSuccess'));
      refetch();
    } catch {
      toastError(t('student.uploadError'));
    }
  }

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)] tracking-tight">
          {isAdmin ? t('title') : t('student.title')}
        </h1>
        <div className="mt-1.5 h-0.5 w-10 rounded-full bg-blue-500" />
      </div>

      {/* ── Filter bar ── */}
      {!loading && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setDisplayPage(1); }}
                placeholder={t('filter.searchPlaceholder')}
                className="pl-8 pr-3 h-8 text-xs rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-body)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]/50 w-44"
              />
            </div>

            <div className="w-px h-5 bg-[var(--border-main)] shrink-0" />

            {/* Date Range */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-2 h-8">
              <Calendar className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setDisplayPage(1); }}
                className="bg-transparent text-[10px] text-[var(--text-body)] focus:outline-none w-24"
              />
              <span className="text-[10px] text-[var(--text-muted)]">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setDisplayPage(1); }}
                className="bg-transparent text-[10px] text-[var(--text-body)] focus:outline-none w-24"
              />
            </div>

            <div className="w-px h-5 bg-[var(--border-main)] shrink-0" />

            {/* Status pills */}
            <div className="flex flex-wrap gap-1.5">
              <StatusPill
                active={statusFilter === 'all'}
                onClick={() => handleStatusChange('all')}
                count={countsByStatus.all ?? 0}
              >
                {t('filter.allStatuses')}
              </StatusPill>

              {Object.entries(STATUS_META).map(([status, meta]) => (
                <StatusPill
                  key={status}
                  active={statusFilter === status}
                  dot={meta.dot}
                  count={countsByStatus[status] ?? 0}
                  onClick={() => handleStatusChange(status)}
                >
                  {tc(meta.labelKey)}
                </StatusPill>
              ))}
            </div>

            <div className="w-px h-5 bg-[var(--border-main)] shrink-0" />

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
              <Select
                value={sortKey}
                onChange={(e) => { setSortKey(e.target.value as SortKey); setDisplayPage(1); }}
                options={[
                  { value: 'date_desc', label: t('filter.sort.dateDesc') },
                  { value: 'date_asc', label: t('filter.sort.dateAsc') },
                  { value: 'amount_desc', label: t('filter.sort.amountDesc') },
                  { value: 'amount_asc', label: t('filter.sort.amountAsc') },
                ]}
                className="text-xs h-9 py-1.5 rounded-lg"
              />
            </div>

            {/* Clear */}
            {isDirty && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-body)] px-2 py-1 rounded-md hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <X className="h-3 w-3" />
                {t('filter.clear')}
              </button>
            )}
          </div>

          {/* Result count */}
          {totalFiltered > 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              {t('pagination.showing', { from: startIdx + 1, to: endIdx, total: totalFiltered })}
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
          title={isDirty ? t('filter.noResults') : t('noPayments')}
          description={isDirty ? t('filter.noResultsDesc') : t('noPaymentsDesc')}
          action={
            isDirty ? (
              <Button size="sm" variant="secondary" onClick={resetFilters}>
                <X className="h-3.5 w-3.5 mr-1.5" />
                {t('filter.clear')}
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Payment grid */}
      {!loading && pagePayments.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {pagePayments.map((payment) => (
            <div
              key={payment.id}
              className={expandedId === payment.id ? 'xl:col-span-2' : ''}
            >
              <PaymentCard
                payment={payment}
                isAdmin={isAdmin}
                isExpanded={expandedId === payment.id}
                onToggle={() => setExpandedId(expandedId === payment.id ? null : payment.id)}
                approvingId={approvingId}
                onApprove={handleApprove}
                onReject={setRejectingId}
                onUploadReceipt={setUploadingId}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalFiltered > DISPLAY_SIZE && (
        <div className="flex items-center justify-between pt-1">
          <Button
            size="sm"
            variant="secondary"
            disabled={safePage <= 1}
            onClick={() => setDisplayPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('pagination.previous')}
          </Button>

          <span className="text-sm text-[var(--text-muted)]">
            {t('pagination.page', { current: safePage, total: totalPages })}
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
        isOpen={!!uploadingId}
        paymentId={uploadingId}
        loading={uploadMut.loading}
        onClose={() => setUploadingId(null)}
        onSubmit={handleUploadReceipt}
      />
    </div>
  );
}

/* ── StatusPill ─────────────────────────────────────────────────────────── */

interface StatusPillProps {
  active: boolean;
  dot?: string;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}

function StatusPill({ active, dot, count, onClick, children }: StatusPillProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${active
          ? 'bg-[var(--bg-subtle)] border-[var(--border-strong)] text-[var(--text-heading)]'
          : 'bg-transparent border-[var(--border-main)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
        }`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />}
      {children}
      <span className="rounded-full px-1.5 text-[10px] font-semibold bg-[var(--bg-subtle)] text-[var(--text-muted)]">
        {count}
      </span>
    </button>
  );
}