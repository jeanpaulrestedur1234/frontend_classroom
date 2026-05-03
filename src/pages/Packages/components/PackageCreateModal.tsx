import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/context/ToastContext';
import { createPackage } from '@/services/packages';
import type { CreatePackageDTO, ClassType } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface PackageCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PackageCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: PackageCreateModalProps) {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const { toast: toastNotify } = useToast();

  const [classType, setClassType] = useState<string>('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discountPct, setDiscountPct] = useState('0');
  const [creating, setCreating] = useState(false);

  function resetForm() {
    setClassType('');
    setHoursPerWeek('');
    setDurationWeeks('');
    setBasePrice('');
    setDiscountPct('0');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleCreate() {
    if (!classType || !hoursPerWeek || !durationWeeks || !basePrice) {
      toastNotify(tc('validation.required'), 'error');
      return;
    }

    const dto: CreatePackageDTO = {
      class_type: classType as ClassType,
      hours_per_week: Number(hoursPerWeek),
      duration_weeks: Number(durationWeeks),
      base_price: Number(basePrice),
      discount_pct: Number(discountPct) || 0,
    };

    setCreating(true);
    try {
      await createPackage(dto);
      resetForm();
      onSuccess();
    } catch {
      // Handled by global interceptor
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('create.title')} size="md">
      <div className="space-y-4">
        <Select
          label={t('create.classType')}
          value={classType}
          onChange={(e) => setClassType(e.target.value)}
          options={[
            { value: 'open_group', label: tc('classTypes.open_group') },
            { value: 'closed_group', label: tc('classTypes.closed_group') },
            { value: 'private', label: tc('classTypes.private') },
          ]}
        />

        <Input
          label={t('create.hoursPerWeek')}
          type="number"
          min={1}
          step={1}
          value={hoursPerWeek}
          onChange={(e) => setHoursPerWeek(e.target.value)}
          placeholder="4"
        />

        <Input
          label={t('create.durationWeeks')}
          type="number"
          min={1}
          step={1}
          value={durationWeeks}
          onChange={(e) => setDurationWeeks(e.target.value)}
          placeholder="8"
        />

        <Input
          label={t('create.basePrice')}
          type="number"
          min={0}
          step={0.01}
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          placeholder="250.00"
        />

        <Input
          label={t('create.discountPct')}
          type="number"
          min={0}
          max={100}
          step={1}
          value={discountPct}
          onChange={(e) => setDiscountPct(e.target.value)}
          placeholder="0"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            {tc('actions.cancel')}
          </Button>
          <Button loading={creating} onClick={handleCreate}>
            {tc('actions.create')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

