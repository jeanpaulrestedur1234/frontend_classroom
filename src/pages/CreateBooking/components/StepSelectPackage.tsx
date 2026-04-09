import Select from '@/components/ui/Select';

export function StepPackage({ t, tc, myPackages, selectedPackageId, setSelectedPackageId }: any) {
  const selectedPackage = myPackages.find((p: any) => p.id === selectedPackageId);

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.package')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.choosePackage')}</p>

      {myPackages.length === 0 ? (
        <p className="text-sm text-zinc-500">{t('create.noActivePackage')}</p>
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
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
          <p className="font-semibold text-zinc-700">{t('create.packagePreview')}</p>
          <p className="text-zinc-600">{tc(`classTypes.${selectedPackage.class_type}`)}</p>
          <p className="text-zinc-600">{selectedPackage.hours_per_week}h/wk · {selectedPackage.duration_weeks}w</p>
          <p className="text-zinc-600">{t('create.packageId')}: {selectedPackage.id}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-zinc-500">{t('create.selectPackageHint')}</p>
    </div>
  );
}
