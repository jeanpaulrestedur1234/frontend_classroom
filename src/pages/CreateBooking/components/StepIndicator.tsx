import { CheckCircle } from 'lucide-react';
import type { TFunction } from 'i18next';

export const STEP_KEYS = ['type', 'teacher', 'room', 'datetime', 'package', 'review'] as const;

interface StepIndicatorProps {
  current: number;
  skipRoom: boolean;
  skipPackage: boolean;
  t: TFunction;
}

export default function StepIndicator({ current, skipRoom, skipPackage, t }: StepIndicatorProps) {
  const hiddenIndexes = new Set<number>();
  if (skipRoom) hiddenIndexes.add(2);
  if (skipPackage) hiddenIndexes.add(4);

  const visibleSteps = STEP_KEYS.filter((_, idx) => !hiddenIndexes.has(idx));
  const visibleCurrent = visibleSteps.indexOf(STEP_KEYS[current]);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {visibleSteps.map((key, idx) => {
        const isActive = idx === visibleCurrent;
        const isDone = idx < visibleCurrent;
        return (
          <div key={key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/25'
                    : isDone
                      ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
                      : 'bg-white/5 text-zinc-400 ring-1 ring-white/10'
                }`}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`hidden sm:inline text-sm font-[family-name:var(--font-display)] ${
                  isActive
                    ? 'font-medium text-zinc-900'
                    : isDone
                      ? 'text-amber-400'
                      : 'text-zinc-400'
                }`}
              >
                {t(`create.step.${key}`)}
              </span>
            </div>
            {idx < visibleSteps.length - 1 && (
              <div
                className={`w-8 h-px transition-colors ${
                  idx < visibleCurrent ? 'bg-amber-500/50' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
