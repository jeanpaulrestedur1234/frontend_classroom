import { Monitor, Building2 } from 'lucide-react';

export function StepType({ t, tc, bookingType, setBookingType }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.type')}
      </h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">{t('create.selectType')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Virtual */}
        <button
          onClick={() => setBookingType('virtual')}
          className={`p-6 rounded-2xl text-left transition-all duration-200 ${
            bookingType === 'virtual'
              ? 'bg-[var(--virtual)]/10 border-2 border-[var(--virtual)]/40 ring-2 ring-[var(--virtual)]/15 shadow-lg shadow-[var(--virtual)]/10'
              : 'bg-[var(--bg-subtle)] border-2 border-[var(--border-main)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]'
          }`}
        >
          <Monitor className={`w-8 h-8 mb-3 ${bookingType === 'virtual' ? 'text-[var(--virtual)]' : 'text-[var(--text-muted)]'}`} />
          <h3 className={`font-semibold font-[family-name:var(--font-display)] ${bookingType === 'virtual' ? 'text-[var(--virtual)]' : 'text-[var(--text-main)]'}`}>
            {tc('bookingTypes.virtual')}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('create.virtualDesc')}</p>
        </button>

        {/* Presencial */}
        <button
          onClick={() => setBookingType('presencial')}
          className={`p-6 rounded-2xl text-left transition-all duration-200 ${
            bookingType === 'presencial'
              ? 'bg-[var(--presencial)]/10 border-2 border-[var(--presencial)]/40 ring-2 ring-[var(--presencial)]/15 shadow-lg shadow-[var(--presencial)]/10'
              : 'bg-[var(--bg-subtle)] border-2 border-[var(--border-main)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]'
          }`}
        >
          <Building2 className={`w-8 h-8 mb-3 ${bookingType === 'presencial' ? 'text-[var(--presencial)]' : 'text-[var(--text-muted)]'}`} />
          <h3 className={`font-semibold font-[family-name:var(--font-display)] ${bookingType === 'presencial' ? 'text-[var(--presencial)]' : 'text-[var(--text-main)]'}`}>
            {tc('bookingTypes.presencial')}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('create.presencialDesc')}</p>
        </button>
      </div>
    </div>
  );
}
