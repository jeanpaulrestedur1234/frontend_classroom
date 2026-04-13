import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';
import { useQuery, useMutation } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { getMyPackages, activatePackage, createPaymentIntent } from '@/services/packages';
import { uploadReceipt } from '@/services/payments';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import MyPackageCard, { type StudentPackageWithPayments } from './components/MyPackageCard';
import UploadReceiptModal from '@/components/shared/UploadReceiptModal';

export default function MyPackages() {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');
  const { success: toastSuccess, error: toastError } = useToast();

  const { data, loading, refetch } = useQuery<StudentPackageWithPayments[]>(getMyPackages);
  const packages = data ?? [];

  const activateMut = useMutation(activatePackage);
  const uploadMut = useMutation(uploadReceipt);
  const createPaymentMut = useMutation(createPaymentIntent);

  const [activatingId, setActivatingId] = useState<string | null>(null);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)] tracking-tight">
          {t('myPackages.title')}
        </h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
      </div>



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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <MyPackageCard
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
          ))}
        </div>
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
