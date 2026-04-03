import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateUserDTO } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface UserCreateModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  roleOptions: { value: string; label: string }[];
  onClose: () => void;
  onSubmit: (dto: CreateUserDTO) => void;
}

export default function UserCreateModal({
  isOpen,
  isSubmitting,
  roleOptions,
  onClose,
  onSubmit,
}: UserCreateModalProps) {
  const { t } = useTranslation('users');
  const { t: tc } = useTranslation('common');

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) newErrors.email = tc('validation.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) newErrors.email = tc('validation.invalidEmail');
    if (!form.password.trim()) newErrors.password = tc('validation.required');
    else if (form.password.length < 6) newErrors.password = tc('validation.minLength', { min: 6 });
    if (!form.full_name.trim()) newErrors.full_name = tc('validation.required');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit({
      email: form.email.trim(),
      password: form.password,
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || undefined,
      role: form.role || undefined,
    });
  }

  // Reset form when modal opens
  if (!isOpen && form.email !== '') {
    setForm({ email: '', password: '', full_name: '', phone: '', role: '' });
    setErrors({});
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('create.title')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('create.email')}
          type="email"
          placeholder="user@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          required
        />
        <Input
          label={t('create.password')}
          type="password"
          placeholder="******"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          required
        />
        <Input
          label={t('create.fullName')}
          placeholder="John Doe"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          error={errors.full_name}
          required
        />
        <Input
          label={t('create.phone')}
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Select
          label={t('create.role')}
          options={roleOptions}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {tc('actions.cancel')}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {tc('actions.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
