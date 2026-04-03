import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus } from 'lucide-react';
import { useQuery } from '@/hooks';
import { listPackages } from '@/services/packages';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import PackageCard from './PackageCard';
import PackageCreateModal from './PackageCreateModal';

export default function AdminPackages() {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const { data: packages, loading, error, refetch } = useQuery(listPackages);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) return <LoadingSpinner />;

  if (error) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950 font-[family-name:var(--font-display)] tracking-tight">
            {t('catalog.title')}
          </h1>
          <div className="mt-1 h-1 w-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          {t('catalog.newPackage')}
        </Button>
      </div>

      {/* Package grid */}
      {(packages ?? []).length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title={t('catalog.empty.title')}
          description={t('catalog.empty.description')}
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              {t('catalog.newPackage')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(packages ?? []).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}

      {/* Create Package Modal */}
      <PackageCreateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          refetch();
        }}
      />
    </div>
  );
}
