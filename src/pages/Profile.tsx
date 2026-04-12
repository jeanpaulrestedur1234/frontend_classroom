import { useState, type FormEvent } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Hash,
  Save,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { updateMe } from '@/services/users';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Profile() {
  const { t: tc } = useTranslation('common');
  const { t: tu } = useTranslation('users');
  const { user } = useAuth();
  const { success: toastSuccess } = useToast();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  if (!user) {
    return <LoadingSpinner size="lg" />;
  }

  // Derive initials from full name
  const initials = user.full_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Map role to badge variant
  const roleBadgeVariant: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
    super_admin: 'warning',
    admin: 'warning',
    teacher: 'info',
    student: 'success',
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await updateMe({
        full_name: fullName,
        phone: phone || undefined,
      });
      toastSuccess(tu('edit.success'));
    } catch (err: any) {
      // Errors handled by global axios interceptor
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--text-heading)]">
          {tc('navigation.profile')}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {tu('edit.title')}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left column: User info card ── */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col items-center text-center py-8 px-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
              <span className="text-2xl font-bold font-[family-name:var(--font-display)] text-white">
                {initials}
              </span>
            </div>

            {/* Name */}
            <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-heading)]">
              {user.full_name}
            </h2>

            {/* Email */}
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-[var(--border-main)] my-5" />

            {/* Role */}
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                {tc('roles.' + user.role)}
              </span>
            </div>
            <Badge variant={roleBadgeVariant[user.role] ?? 'default'}>
              {tc('roles.' + user.role)}
            </Badge>

            {/* Status */}
            <div className="mt-4">
              <Badge variant={user.is_active ? 'success' : 'danger'}>
                {user.is_active ? tc('status.active') : tc('status.inactive')}
              </Badge>
            </div>

            {/* User ID */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)] mt-5">
              <Hash className="w-3 h-3" />
              <span className="font-mono">{user.id}</span>
            </div>
          </Card>
        </div>

        {/* ── Right column: Edit form card ── */}
        <div className="lg:col-span-3">
          <Card>
            <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] text-[var(--text-heading)] mb-6">
              {tu('edit.title')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email (read-only) */}
              <Input
                id="email"
                type="email"
                label="Email"
                value={user.email}
                disabled
              />

              {/* Full name */}
              <div className="relative">
                <Input
                  id="fullName"
                  type="text"
                  required
                  label={tu('create.fullName')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={user.full_name}
                  className="pl-10"
                />
                <User className="absolute left-3 top-[38px] w-4 h-4 text-[var(--text-dim)] pointer-events-none" />
              </div>

              {/* Phone */}
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  label={tu('create.phone')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-[38px] w-4 h-4 text-[var(--text-dim)] pointer-events-none" />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  size="md"
                >
                  <Save className="w-4 h-4" />
                  {tc('actions.save')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
