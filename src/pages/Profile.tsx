import { useState, type FormEvent } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../services/users';
import Button from '../components/ui/Button';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  teacher: 'Profesor',
  student: 'Estudiante',
};

export default function Profile() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);

    try {
      await updateMe({
        full_name: fullName,
        phone: phone || undefined,
      });
      setSuccess('Cambios guardados correctamente.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join('. '));
      } else {
        setError('Error al guardar los cambios. Intenta nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visualiza y actualiza tu informacion personal.
        </p>
      </div>

      {/* User info card (read-only fields) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informacion de la cuenta
        </h2>

        <dl className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <dt className="text-xs text-gray-500">Correo electronico</dt>
              <dd className="text-sm font-medium text-gray-900">{user.email}</dd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <dt className="text-xs text-gray-500">Rol</dt>
              <dd className="text-sm font-medium text-gray-900">
                {ROLE_LABELS[user.role] ?? user.role}
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <dt className="text-xs text-gray-500">ID de usuario</dt>
              <dd className="text-sm font-medium text-gray-900">{user.id}</dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Editar informacion
        </h2>

        {/* Success feedback */}
        {success && (
          <div className="flex items-center gap-3 p-3 mb-5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error feedback */}
        {error && (
          <div className="flex items-center gap-3 p-3 mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Telefono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              loading={saving}
              className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
              size="md"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
