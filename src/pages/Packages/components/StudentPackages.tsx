import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ShoppingCart, CheckCircle } from 'lucide-react';
import { useQuery } from '@/hooks';
import { listPackages, acquirePackage } from '@/services/packages';
import { uploadReceipt } from '@/services/payments';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import PackageCard from './PackageCard';
import UploadReceiptModal from '@/components/shared/UploadReceiptModal';

export default function StudentPackages() {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const { data: packages, loading, error, refetch } = useQuery(listPackages);

  const [acquiringId, setAcquiringId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [activePaymentPkgId, setActivePaymentPkgId] = useState<{paymentId: string, pkgId: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function handleAcquire(packageId: string) {
    setAcquiringId(packageId);
    try {
      const { payment } = await acquirePackage(packageId);
      setActivePaymentPkgId({ paymentId: payment.id, pkgId: packageId });
    } catch (err: any) {
      console.error('Error acquiring package:', err);
    } finally {
      setAcquiringId(null);
    }
  }

  async function handleSubmitReceipt(paymentId: string, url: string) {
    setIsSubmitting(true);
    try {
      await uploadReceipt(paymentId, { payment_proof_url: url });
      
      const pkgId = activePaymentPkgId?.pkgId;
      setActivePaymentPkgId(null);
      
      if (pkgId) {
        setSuccessId(pkgId);
        setTimeout(() => setSuccessId(null), 3000);
      }
      
      refetch();
    } catch (err: any) {
      console.error('Error uploading receipt:', err);
    } finally {
      setIsSubmitting(false);
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
        <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
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
        paymentId={activePaymentPkgId?.paymentId || null}
        loading={isSubmitting}
        onClose={() => setActivePaymentPkgId(null)}
        onSubmit={handleSubmitReceipt}
      />
    </div>
  );
}
