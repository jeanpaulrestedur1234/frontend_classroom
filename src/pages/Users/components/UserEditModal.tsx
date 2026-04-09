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
  });

  const [errorFullName, setErrorFullName] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name,
        phone: user.phone || '',
        role: user.role,
        is_active: user.is_active,
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

    onSubmit(user.id, {
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || undefined,
      role: form.role,
      is_active: form.is_active,
    });
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
