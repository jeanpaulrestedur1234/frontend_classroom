import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus } from 'lucide-react';
import { useQuery, useMutation } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { getMyPackages, activatePackage, createPaymentIntent } from '@/services/packages';
import { uploadReceipt } from '@/services/payments';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import MyPackageRow, { type StudentPackageWithPayments } from './components/MyPackageRow';
import UploadReceiptModal from '@/components/shared/UploadReceiptModal';
import type { PaginatedResponse, StudentPackageDTO } from '@/types';

export default function MyPackages() {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');
  const { success: toastSuccess, error: toastError } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [queryParams, setQueryParams] = useState<{ status?: string; size: number }>({ size: 100 });

  const fetcher = useCallback(() => getMyPackages(queryParams), [queryParams]);

  const { data, loading, refetch } = useQuery<
    PaginatedResponse<StudentPackageDTO>,
    PaginatedResponse<StudentPackageWithPayments>
  >(fetcher, {
    transform: (res) => res as PaginatedResponse<StudentPackageWithPayments>,
    immediate: false,
  });

  useEffect(() => {
    refetch();
  }, [queryParams, refetch]);

  const packages = useMemo(() => {
    const items = data?.items ?? [];
    if (data && data.total <= data.page_size) {
      if (statusFilter === 'all') return items;
      return items.filter((p) => p.status === statusFilter);
    }
    return items;
  }, [data, statusFilter]);

  const activateMut = useMutation(activatePackage);
  const uploadMut = useMutation(uploadReceipt);
  const createPaymentMut = useMutation(createPaymentIntent);

  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [uploadModal, setUploadModal] = useState<{
    open: boolean;
    paymentId: string;
    packageId: string;
  }>({ open: false, paymentId: '', packageId: '' });



  const allPackagesForStats = data?.items ?? [];
  const activeCount = allPackagesForStats.filter((p) => p.status === 'active').length;
  const expiredCount = allPackagesForStats.filter((p) => p.status === 'expired').length;
  const inactiveCount = allPackagesForStats.filter((p) => p.status === 'inactive').length;

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    if (data && data.total > data.page_size) {
      setQueryParams({ status: newStatus === 'all' ? undefined : newStatus, size: 100 });
    }
  };

  async function handleActivate(spId: string) {
    setActivatingId(spId);
    try {
      await activateMut.execute(spId);
      toastSuccess(t('myPackages.activateSuccess'));
      refetch();
    } catch {
      toastError(t('myPackages.activateError'));
    } finally {
      setActivatingId(null);
    }
  }

  async function handleUploadReceipt(paymentId: string | null, url: string) {
    if (!paymentId) return;
    try {
      await uploadMut.execute(paymentId, { payment_proof_url: url });
      setUploadModal({ open: false, paymentId: '', packageId: '' });
      toastSuccess(t('myPackages.uploadModal.success'));
      refetch();
    } catch {
      toastError(t('myPackages.uploadModal.error'));
    }
  }

  async function handleCreatePaymentAndUpload(spId: string) {
    try {
      const newPayment = await createPaymentMut.execute(spId);
      setUploadModal({ open: true, paymentId: newPayment.id, packageId: spId });
    } catch {
      toastError(tc('errors.unexpected'));
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)] tracking-tight leading-tight">
              {t('myPackages.title')}
            </h1>
            <p className="text-sm text-[var(--text-dim)] mt-0.5">
              {t('myPackages.subtitle')}
            </p>
          </div>
        </div>
        <Button onClick={() => (window.location.href = '/app/packages')}>
          <Plus className="h-4 w-4" />
          {t('myPackages.buyNew')}
        </Button>
      </div>

      {allPackagesForStats.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title={t('myPackages.empty.title')}
          description={t('myPackages.empty.description')}
          action={
            <Button onClick={() => (window.location.href = '/app/packages')}>
              {tc('navigation.packages')}
            </Button>
          }
        />
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              color="green"
              icon={
                <svg className="h-5 w-5 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
              label={t('myPackages.stats.active')}
              value={activeCount}
              sub={t('myPackages.stats.activeSub')}
            />
            <StatCard
              color="red"
              icon={
                <svg className="h-5 w-5 text-red-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
              label={t('myPackages.stats.expired')}
              value={expiredCount}
              sub={t('myPackages.stats.expiredSub')}
            />
            <StatCard
              color="purple"
              icon={
                <svg className="h-5 w-5 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
              }
              label={t('myPackages.stats.toActivate')}
              value={inactiveCount}
              sub={t('myPackages.stats.toActivateSub')}
            />
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'active', 'inactive', 'expired'].map((st) => (
              <button
                key={st}
                onClick={() => handleFilterChange(st)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-[var(--bg-surface)] text-[var(--text-dim)] border border-[var(--border-main)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-body)]'
                }`}
              >
                {st === 'all' ? tc('select.all') : tc(`status.${st}`)}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-main)]">
                    <th className="w-10 px-4 py-3"></th>
                    {[
                      t('myPackages.col.package'),
                      t('myPackages.col.price'),
                      t('myPackages.col.weeks'),
                      t('myPackages.col.usage'),
                      t('myPackages.col.status'),
                      t('myPackages.col.expiry'),
                      t('myPackages.col.actions'),
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)] whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {packages.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-[var(--text-dim)]">
                        {tc('emptyState.noResults', 'No se encontraron resultados')}
                      </td>
                    </tr>
                  ) : (
                    packages.map((pkg) => (
                      <MyPackageRow
                        key={pkg.id}
                        pkg={pkg}
                        activatingId={activatingId}
                        onActivate={handleActivate}
                        onUploadModalOpen={(paymentId, packageId) =>
                          setUploadModal({ open: true, paymentId, packageId })
                        }
                        onCreatePaymentAndUpload={handleCreatePaymentAndUpload}
                        isCreatingPayment={createPaymentMut.loading}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-[var(--border-main)] text-xs text-[var(--text-dim)]">
              {t('myPackages.showing', {
                count: packages.length,
                total: packages.length,
              })}
            </div>
          </div>
        </>
      )}

      <UploadReceiptModal
        isOpen={uploadModal.open}
        paymentId={uploadModal.open ? uploadModal.paymentId : null}
        loading={uploadMut.loading}
        onClose={() => setUploadModal({ open: false, paymentId: '', packageId: '' })}
        onSubmit={handleUploadReceipt}
      />
    </div>
  );
}

/* ─── Stat card helper ─── */
interface StatCardProps {
  color: 'green' | 'red' | 'purple';
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
}

const colorMap = {
  green: 'bg-green-50 border-green-100',
  red: 'bg-red-50 border-red-100',
  purple: 'bg-purple-50 border-purple-100',
};

function StatCard({ color, icon, label, value, sub }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-4">
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--text-dim)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-heading)] leading-tight">{value}</p>
        <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{sub}</p>
      </div>
    </div>
  );
}