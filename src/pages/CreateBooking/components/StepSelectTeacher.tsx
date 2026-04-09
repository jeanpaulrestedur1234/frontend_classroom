import { User } from 'lucide-react';
import type { UserDTO } from '@/types';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function StepTeacher({ t, tc, teachers, loading, teacherId, setTeacherId }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.teacher')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.selectTeacher')}</p>
      {loading ? (
        <LoadingSpinner />
      ) : teachers.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">{tc('emptyState.noData')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teachers.map((teacher: UserDTO) => (
            <button
              key={teacher.id}
              onClick={() => setTeacherId(teacher.id)}
              className={`p-4 rounded-2xl text-left transition-all duration-200 backdrop-blur-xl ${
                teacherId === teacher.id
                  ? 'bg-blue-500/10 border-2 border-blue-500/40 ring-2 ring-blue-500/15 shadow-lg shadow-blue-500/10'
                  : 'bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    teacherId === teacher.id ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${teacherId === teacher.id ? 'text-blue-300' : 'text-zinc-800'}`}>
                    {teacher.full_name}
                  </p>
                  <p className="text-xs text-zinc-500">{teacher.email}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
