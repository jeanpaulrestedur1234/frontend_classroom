import { Monitor, Building2 } from 'lucide-react';

export function StepType({ t, tc, bookingType, setBookingType }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.type')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.selectType')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Virtual */}
        <button
          onClick={() => setBookingType('virtual')}
          className={`p-6 rounded-2xl text-left transition-all duration-200 backdrop-blur-xl ${
            bookingType === 'virtual'
              ? 'bg-sky-500/10 border-2 border-sky-500/40 ring-2 ring-sky-500/15 shadow-lg shadow-sky-500/10'
              : 'bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
          }`}
        >
          <Monitor className={`w-8 h-8 mb-3 ${bookingType === 'virtual' ? 'text-sky-400' : 'text-zinc-400'}`} />
          <h3 className={`font-semibold font-[family-name:var(--font-display)] ${bookingType === 'virtual' ? 'text-sky-300' : 'text-zinc-800'}`}>
            {tc('bookingTypes.virtual')}
          </h3>
          <p className="text-sm text-zinc-500 mt-1">{t('create.virtualDesc')}</p>
        </button>

        {/* Presencial */}
        <button
          onClick={() => setBookingType('presencial')}
          className={`p-6 rounded-2xl text-left transition-all duration-200 backdrop-blur-xl ${
            bookingType === 'presencial'
              ? 'bg-blue-500/10 border-2 border-blue-500/40 ring-2 ring-blue-500/15 shadow-lg shadow-blue-500/10'
              : 'bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
          }`}
        >
          <Building2 className={`w-8 h-8 mb-3 ${bookingType === 'presencial' ? 'text-blue-400' : 'text-zinc-400'}`} />
          <h3 className={`font-semibold font-[family-name:var(--font-display)] ${bookingType === 'presencial' ? 'text-blue-300' : 'text-zinc-800'}`}>
            {tc('bookingTypes.presencial')}
          </h3>
          <p className="text-sm text-zinc-500 mt-1">{t('create.presencialDesc')}</p>
        </button>
      </div>
    </div>
  );
}
