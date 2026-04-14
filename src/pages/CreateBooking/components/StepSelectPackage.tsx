import Select from '@/components/ui/Select';
import { AlertCircle } from 'lucide-react';

export function StepPackage({ t, tc, myPackages, selectedPackageId, setSelectedPackageId }: any) {
  const selectedPackage = myPackages.find((p: any) => p.id === selectedPackageId);

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.package')}
      </h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">{t('create.choosePackage')}</p>

      {myPackages.length === 0 ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-500">{t('create.noActivePackage')}</p>
            <p className="text-xs text-rose-500/80 mt-1">
              {t('create.noActivePackageDesc')}
            </p>
          </div>
        </div>
      ) : (
        <Select
          label={t('create.selectPackage')}
          value={selectedPackageId}
          onChange={(e) => setSelectedPackageId(e.target.value)}
          options={myPackages.map((pkg: any) => ({
            value: pkg.id,
            label: `${tc(`classTypes.${pkg.class_type}`)} - ${pkg.hours_per_week}h/wk · ${pkg.duration_weeks}w`,
          }))}
        />
      )}

      {selectedPackage && (
        <div className="mt-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-subtle)] p-3 text-sm">
          <p className="font-semibold text-[var(--text-body)]">{t('create.packagePreview')}</p>
          <p className="text-[var(--text-muted)]">{tc(`classTypes.${selectedPackage.class_type}`)}</p>
          <p className="text-[var(--text-muted)]">{selectedPackage.hours_per_week}h/wk · {selectedPackage.duration_weeks}w</p>
          <p className="text-[var(--text-muted)]">{t('create.packageId')}: {selectedPackage.id}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-[var(--text-dim)]">{t('create.selectPackageHint')}</p>
    </div>
  );
}
