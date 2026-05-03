import { useAuth } from '@/context/AuthContext';
import AdminPackages from './components/AdminPackages';
import StudentPackages from './components/StudentPackages';

export default function Packages() {
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  return isAdmin ? <AdminPackages /> : <StudentPackages />;
}
