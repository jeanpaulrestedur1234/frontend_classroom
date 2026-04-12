import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserDTO, AdminUpdateUserDTO } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface UserEditModalProps {
  user: UserDTO | null;
  isSubmitting: boolean;
  roleOptions: { value: string; label: string }[];
  onClose: () => void;
  onSubmit: (id: string, dto: AdminUpdateUserDTO) => void;
}

export default function UserEditModal({
  user,
  isSubmitting,
  roleOptions,
  onClose,
  onSubmit,
}: UserEditModalProps) {
  const { t } = useTranslation('users');
  const { t: tc } = useTranslation('common');

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    role: '',
    is_active: true,
    configuration_days: [] as string[],
  });

  const [errorFullName, setErrorFullName] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name,
        phone: user.phone || '',
        role: user.role,
        is_active: user.is_active,
        configuration_days: user.metadata?.configuration_days || [
          'mon',
          'tue',
          'wed',
          'thu',
          'fri',
          'sat',
          'sun',
        ],
      });
      setErrorFullName(undefined);
    }
  }, [user]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name.trim()) {
      setErrorFullName(tc('validation.required'));
      return;
    }

    const metadata = {
      ...(user.metadata || {}),
      ...(form.role === 'teacher' ? { configuration_days: form.configuration_days } : {}),
    };

    onSubmit(user.id, {
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || undefined,
      role: form.role,
      is_active: form.is_active,
      metadata,
    });
  }

  const CONFIG_DAYS = [
    { code: 'mon', label: 'L' },
    { code: 'tue', label: 'M' },
    { code: 'wed', label: 'Mi' },
    { code: 'thu', label: 'J' },
    { code: 'fri', label: 'V' },
    { code: 'sat', label: 'S' },
    { code: 'sun', label: 'D' },
  ];

  function toggleDay(code: string) {
    setForm((prev) => ({
      ...prev,
      configuration_days: prev.configuration_days.includes(code)
        ? prev.configuration_days.filter((d) => d !== code)
        : [...prev.configuration_days, code],
    }));
  }

  return (
    <Modal isOpen={!!user} onClose={onClose} title={t('edit.title')} size="md">
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('edit.fullName')}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            error={errorFullName}
            required
          />
          <Input
            label={t('edit.phone')}
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Select
            label={t('edit.role')}
            options={roleOptions}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />

          {/* Teacher Configuration Days */}
          {form.role === 'teacher' && (
            <div className="space-y-3 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)]">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {t('edit.configurationDays')}
              </label>
              <div className="flex flex-wrap gap-2">
                {CONFIG_DAYS.map((day) => {
                  const isActive = form.configuration_days.includes(day.code);
                  return (
                    <button
                      key={day.code}
                      type="button"
                      onClick={() => toggleDay(day.code)}
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 scale-110'
                          : 'bg-[var(--bg-surface)] text-[var(--text-dim)] border border-[var(--border-main)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)]'
                      }`}
                      title={tc(`days.${['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(day.code)}`)}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[var(--text-dim)] italic">
                * Determina qué días el profesor puede configurar su disponibilidad.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] px-4 py-3">
            <span className="text-sm font-medium text-[var(--text-body)]">{t('edit.isActive')}</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)] ${
                form.is_active ? 'bg-[var(--primary)]' : 'bg-[var(--border-strong)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                  form.is_active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              {tc('actions.cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {tc('actions.save')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
