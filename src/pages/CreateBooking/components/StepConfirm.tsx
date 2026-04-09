import { Monitor, Building2, User, MapPin, CalendarDays, Clock, AlertTriangle, Package } from 'lucide-react';
import { formatDate } from '@/utils';
import type { UserDTO, RoomDTO } from '@/types';

export function StepReview({ t, tc, bookingType, selectedTeacher, selectedRoom, isVirtual, scheduledDate, startTime, submitError, selectedPackageId }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.review')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.reviewTitle')}</p>
      <div className="bg-zinc-50 backdrop-blur-xl border border-zinc-200 rounded-2xl p-5 max-w-md">
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            {isVirtual ? (
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-sky-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
            )}
            <div>
              <span className="text-zinc-500 text-xs">{t('table.type')}</span>
              <p className="font-medium text-zinc-900">{tc(`bookingTypes.${bookingType}`)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <User className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <span className="text-zinc-500 text-xs">{t('table.teacher')}</span>
              <p className="font-medium text-zinc-900">{selectedTeacher?.full_name ?? '-'}</p>
            </div>
          </div>
          {!isVirtual && selectedRoom && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs">{t('table.room')}</span>
                <p className="font-medium text-zinc-900">
                  {selectedRoom.name} (cap. {selectedRoom.capacity})
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-zinc-500 text-xs">{t('table.date')}</span>
              <p className="font-medium text-zinc-900">{scheduledDate ? formatDate(scheduledDate) : '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-zinc-500 text-xs">{t('table.time')}</span>
              <p className="font-medium text-zinc-900">{startTime || '-'}</p>
            </div>
          </div>

          {selectedPackageId ? (
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs">{t('create.package')}</span>
                <p className="font-medium text-zinc-900">{selectedPackageId}</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-zinc-500">{t('create.noPackageSelected')}</div>
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
