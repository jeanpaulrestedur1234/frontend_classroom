import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { getMyPackages, activatePackage, createPaymentIntent } from '@/services/packages';
import { uploadReceipt } from '@/services/payments';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import MyPackageCard, { type StudentPackageWithPayments } from './components/MyPackageCard';
import UploadReceiptModal from '@/pages/Payments/components/UploadReceiptModal';

export default function MyPackages() {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');
  const { success: toastSuccess, error: toastError } = useToast();

  const { data, loading, error, refetch, setData } = useQuery<StudentPackageWithPayments[]>(getMyPackages);
  const packages = data ?? [];

  const activateMut = useMutation(activatePackage);
  const createPaymentMut = useMutation(createPaymentIntent);
  const uploadMut = useMutation(uploadReceipt);

  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [creatingPaymentId, setCreatingPaymentId] = useState<string | null>(null);
  const [uploadModal, setUploadModal] = useState<{ open: boolean; paymentId: string; packageId: string }>({
    open: false,
    paymentId: '',
    packageId: '',
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

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

  async function handleCreatePayment(spId: string) {
    setCreatingPaymentId(spId);
    try {
      const payment = await createPaymentMut.execute(spId);
      toastSuccess(t('myPackages.uploadModal.success'));
      setData(
        packages.map((p) => {
          if (p.id === spId) {
            return {
              ...p,
              payments: [...(p.payments || []), payment],
            };
          }
          return p;
        }),
      );
      setUploadModal({ open: true, paymentId: payment.id, packageId: spId });
    } catch {
      toastError(tc('errors.generic'));
    } finally {
      setCreatingPaymentId(null);
    }
  }

  async function handleUploadReceipt(paymentId: string, url: string) {
    try {
      await uploadMut.execute(paymentId, { payment_proof_url: url });
      setUploadModal({ open: false, paymentId: '', packageId: '' });
      toastSuccess(t('myPackages.uploadModal.success'));
      refetch();
    } catch {
      toastError(t('myPackages.uploadModal.error'));
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-950 font-[family-name:var(--font-display)] tracking-tight">
          {t('myPackages.title')}
        </h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {packages.length === 0 ? (
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
        <div className="space-y-5">
          {packages.map((pkg) => (
            <MyPackageCard
              key={pkg.id}
              pkg={pkg}
              activatingId={activatingId}
              creatingPaymentId={creatingPaymentId}
              onActivate={handleActivate}
              onCreatePayment={handleCreatePayment}
              onUploadModalOpen={(paymentId, packageId) =>
                setUploadModal({ open: true, paymentId, packageId })
              }
            />
          ))}
        </div>
      )}

      <UploadReceiptModal
        paymentId={uploadModal.open ? uploadModal.paymentId : null}
        loading={uploadMut.loading}
        onClose={() => setUploadModal({ open: false, paymentId: '', packageId: '' })}
        onSubmit={handleUploadReceipt}
      />
    </div>
  );
}
