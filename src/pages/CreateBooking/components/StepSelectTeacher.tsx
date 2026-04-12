import { User, AlertCircle } from 'lucide-react';
import type { UserDTO } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function StepTeacher({ t, tc, teachers, loading, teacherId, setTeacherId, teacherAvailability, bookingType }: any) {
  const isVirtual = bookingType === 'virtual';
  const matchingAvailability = teacherAvailability?.filter((a: any) => isVirtual ? a.is_virtual : !a.is_virtual);
  const selectedTeacherHasMatchingSlots = teacherId ? (matchingAvailability && matchingAvailability.length > 0) : true;

  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.teacher')}
      </h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">{t('create.selectTeacher')}</p>
      {loading ? (
        <LoadingSpinner />
      ) : teachers.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">{tc('emptyState.noData')}</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teachers.map((teacher: UserDTO) => (
              <button
                key={teacher.id}
                onClick={() => setTeacherId(teacher.id)}
                className={`p-4 rounded-2xl text-left transition-all duration-200 ${
                  teacherId === teacher.id
                    ? 'bg-[var(--primary)]/10 border-2 border-[var(--primary)]/40 ring-2 ring-[var(--primary)]/15 shadow-lg shadow-[var(--primary)]/10'
                    : 'bg-[var(--bg-subtle)] border-2 border-[var(--border-main)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      teacherId === teacher.id
                        ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${teacherId === teacher.id ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}`}>
                      {teacher.full_name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{teacher.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {!selectedTeacherHasMatchingSlots && !loading && teacherId && (
            <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-400">
                  {isVirtual 
                    ? t('create.errors.noVirtualAvailabilityTitle', 'Profesor sin disponibilidad virtual')
                    : t('create.errors.noPresencialAvailabilityTitle', 'Profesor sin disponibilidad presencial')
                  }
                </p>
                <p className="text-xs text-orange-400/80 mt-1">
                  {isVirtual
                    ? t('create.errors.noVirtualAvailabilityDesc', 'Este profesor no tiene horarios virtuales configurados. Por favor selecciona otro profesor para continuar.')
                    : t('create.errors.noPresencialAvailabilityDesc', 'Este profesor no tiene horarios presenciales configurados. Por favor selecciona otro profesor para continuar.')
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
