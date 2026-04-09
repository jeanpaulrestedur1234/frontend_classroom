import { User } from 'lucide-react';
import type { UserDTO } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function StepTeacher({ t, tc, teachers, loading, teacherId, setTeacherId }: any) {
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
      )}
    </div>
  );
}
