import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ShoppingCart, CheckCircle } from 'lucide-react';
import { useQuery } from '@/hooks';
import { listPackages, acquirePackage, createPaymentIntent } from '@/services/packages';
import { uploadReceipt } from '@/services/payments';
import { uploadFile } from '@/services/upload';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import PackageCard from './PackageCard';
import UploadReceiptModal from './UploadReceiptModal';

export default function StudentPackages() {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const { data: packages, loading, error, refetch } = useQuery(listPackages);

  const [acquiringId, setAcquiringId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  function handleAcquire(packageId: string) {
    setSelectedPkgId(packageId);
    setIsUploadModalOpen(true);
  }

  async function handleConfirmUpload(file: File) {
    if (!selectedPkgId) return;
    
    setAcquiringId(selectedPkgId);
    try {
      // 1. Mock upload
      const receiptUrl = await uploadFile(file);
      
      // 2. Acquire package (creates StudentPackage)
      const studentPkg = await acquirePackage(selectedPkgId);
      
      // 3. Create payment
      const payment = await createPaymentIntent(studentPkg.id);
      
      // 4. Upload receipt
      await uploadReceipt(payment.id, { payment_proof_url: receiptUrl });
      
      setSuccessId(selectedPkgId);
      setTimeout(() => setSuccessId(null), 3000);
    } finally {
      setAcquiringId(null);
      setSelectedPkgId(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error && (packages ?? []).length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title={tc('errors.generic')}
        description={error}
        action={<Button onClick={refetch}>{tc('actions.retry')}</Button>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-950 font-[family-name:var(--font-display)] tracking-tight">
          {t('student.availablePackages')}
        </h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4">
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {(packages ?? []).length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title={t('catalog.empty.title')}
          description={t('catalog.empty.description')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(packages ?? []).map((pkg) => {
            const isAcquiring = acquiringId === pkg.id;
            const isSuccess = successId === pkg.id;

            return (
              <PackageCard key={pkg.id} pkg={pkg}>
                {isSuccess ? (
                  <Button variant="secondary" disabled className="w-full">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    {t('student.acquired')}
                  </Button>
                ) : (
                  <Button
                    loading={isAcquiring}
                    onClick={() => handleAcquire(pkg.id)}
                    className="w-full"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {t('student.acquire')}
                  </Button>
                )}
              </PackageCard>
            );
          })}
        </div>
      )}
      <UploadReceiptModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onConfirm={handleConfirmUpload}
      />
    </div>
  );
}
