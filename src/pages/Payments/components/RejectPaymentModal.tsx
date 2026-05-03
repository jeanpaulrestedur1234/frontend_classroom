import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface RejectPaymentModalProps {
  paymentId: string | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (id: string, reason: string) => void;
}

export default function RejectPaymentModal({ paymentId, loading, onClose, onSubmit }: RejectPaymentModalProps) {
  const { t } = useTranslation('payments');
  const { t: tc } = useTranslation('common');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!reason.trim()) {
      setError(tc('validation.required'));
      return;
    }
    setError(null);
    if (paymentId) {
      onSubmit(paymentId, reason.trim());
    }
  }

  // Reset internal state when modal opens/closes
  if (!paymentId && reason) {
    setReason('');
    setError(null);
  }

  return (
    <Modal isOpen={!!paymentId} onClose={onClose} title={t('admin.rejectModal.title')} size="md">
      <div className="space-y-4">
        <Input
          label={t('admin.rejectModal.reasonLabel')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('admin.rejectModal.reasonPlaceholder')}
        />

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {tc('actions.cancel')}
          </Button>
          <Button variant="danger" loading={loading} onClick={handleSubmit}>
            <XCircle className="h-4 w-4" />
            {tc('actions.reject')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
