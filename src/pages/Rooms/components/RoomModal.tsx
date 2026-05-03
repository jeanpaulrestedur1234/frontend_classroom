import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { RoomDTO } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface RoomModalProps {
  isOpen: boolean;
  room: RoomDTO | null; // null if create, obj if edit
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (id: number | null, data: { name: string; capacity: number; is_active: boolean }) => void;
}

export default function RoomModal({ isOpen, room, isSubmitting, onClose, onSubmit }: RoomModalProps) {
  const { t } = useTranslation('rooms');
  const { t: tc } = useTranslation('common');

  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<{ name?: string; capacity?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (room) {
        setName(room.name);
        setCapacity(String(room.capacity));
        setIsActive(room.is_active);
      } else {
        setName('');
        setCapacity('');
        setIsActive(true);
      }
      setErrors({});
    }
  }, [isOpen, room]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { name?: string; capacity?: string } = {};

    if (!name.trim()) newErrors.name = tc('validation.required');
    if (!capacity.trim()) {
      newErrors.capacity = tc('validation.required');
    } else {
      const num = parseInt(capacity, 10);
      if (isNaN(num) || num < 1) newErrors.capacity = tc('validation.positiveNumber');
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit(room ? room.id : null, {
      name: name.trim(),
      capacity: parseInt(capacity, 10),
      is_active: isActive,
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? t('edit.title') : t('create.title')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('create.name')}
          placeholder="Room A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label={t('create.capacity')}
          type="number"
          min={1}
          placeholder="20"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          error={errors.capacity}
          required
        />

        <div className="flex items-center justify-between rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-main)] px-4 py-3">
          <span className="text-sm font-medium text-[var(--text-body)]">{t('create.isActive')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)] ${
              isActive ? 'bg-[var(--primary)]' : 'bg-[var(--border-strong)]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {tc('actions.cancel')}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {room ? tc('actions.save') : tc('actions.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
