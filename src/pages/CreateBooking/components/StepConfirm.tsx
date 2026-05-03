import { Monitor, Building2, User, MapPin, CalendarDays, Clock, AlertTriangle, Package } from 'lucide-react';
import { formatDate } from '@/utils';

export function StepReview({ t, tc, bookingType, selectedTeacher, selectedRoom, isVirtual, scheduledDate, startTime, submitError, selectedPackageId }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.review')}
      </h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">{t('create.reviewTitle')}</p>

      <div className="bg-[var(--bg-subtle)] border border-[var(--border-main)] rounded-2xl p-5 max-w-md">
        <div className="space-y-4 text-sm">
          {/* Type */}
          <div className="flex items-center gap-3">
            {isVirtual ? (
              <div className="w-8 h-8 rounded-lg bg-[var(--virtual)]/10 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-[var(--virtual)]" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[var(--presencial)]/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[var(--presencial)]" />
              </div>
            )}
            <div>
              <span className="text-[var(--text-muted)] text-xs">{t('table.type')}</span>
              <p className="font-medium text-[var(--text-main)]">{tc(`bookingTypes.${bookingType}`)}</p>
            </div>
          </div>

          {/* Teacher */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <User className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <span className="text-[var(--text-muted)] text-xs">{t('table.teacher')}</span>
              <p className="font-medium text-[var(--text-main)]">{selectedTeacher?.full_name ?? '-'}</p>
            </div>
          </div>

          {/* Room */}
          {!isVirtual && selectedRoom && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs">{t('table.room')}</span>
                <p className="font-medium text-[var(--text-main)]">
                  {selectedRoom.name} (cap. {selectedRoom.capacity})
                </p>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <span className="text-[var(--text-muted)] text-xs">{t('table.date')}</span>
              <p className="font-medium text-[var(--text-main)]">{scheduledDate ? formatDate(scheduledDate) : '-'}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div>
              <span className="text-[var(--text-muted)] text-xs">{t('table.time')}</span>
              <p className="font-medium text-[var(--text-main)]">{startTime || '-'}</p>
            </div>
          </div>

          {/* Package */}
          {selectedPackageId ? (
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-sky-500" />
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs">{t('create.package')}</span>
                <p className="font-medium text-[var(--text-main)]">{selectedPackageId}</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-[var(--text-muted)]">{t('create.noPackageSelected')}</div>
          )}
        </div>
      </div>

      {submitError && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-sm text-rose-400">{submitError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
