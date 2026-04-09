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
                    ? 'bg-gradient-to-r from-[var(--primary)] to-blue-600 text-white shadow-lg shadow-[var(--primary)]/25'
                    : isDone
                      ? 'bg-[var(--primary)]/15 text-[var(--primary)] ring-1 ring-[var(--primary)]/30'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] ring-1 ring-[var(--border-main)]'
                }`}
              >
                {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`hidden sm:inline text-sm font-[family-name:var(--font-display)] ${
                  isActive
                    ? 'font-medium text-[var(--text-main)]'
                    : isDone
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--text-muted)]'
                }`}
              >
                {t(`create.step.${key}`)}
              </span>
            </div>
            {idx < visibleSteps.length - 1 && (
              <div
                className={`w-8 h-px transition-colors ${
                  idx < visibleCurrent ? 'bg-[var(--primary)]/50' : 'bg-[var(--border-main)]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
