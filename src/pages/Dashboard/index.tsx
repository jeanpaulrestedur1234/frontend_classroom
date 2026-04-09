import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation('dashboard');

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';

  return (
    <div className="space-y-2">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
          {t('welcome', { name: user.full_name })}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t('subtitle')}</p>
      </div>

      {isAdmin && <AdminDashboard />}
      {isTeacher && <TeacherDashboard />}
      {isStudent && <StudentDashboard />}
    </div>
  );
}
