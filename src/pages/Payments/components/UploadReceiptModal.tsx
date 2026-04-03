import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface UploadReceiptModalProps {
  paymentId: string | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (id: string, url: string) => void;
}

export default function UploadReceiptModal({ paymentId, loading, onClose, onSubmit }: UploadReceiptModalProps) {
  const { t } = useTranslation('payments');
  const { t: tc } = useTranslation('common');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!url.trim()) {
      setError(tc('validation.required'));
      return;
    }
    setError(null);
    if (paymentId) {
      onSubmit(paymentId, url.trim());
    }
  }

  // Reset internal state
  if (!paymentId && url) {
    setUrl('');
    setError(null);
  }

  return (
    <Modal isOpen={!!paymentId} onClose={onClose} title={t('student.uploadModal.title')} size="md">
      <div className="space-y-4">
        <Input
          label={t('student.uploadModal.urlLabel')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('student.uploadModal.urlPlaceholder')}
          type="url"
        />

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {tc('actions.cancel')}
          </Button>
          <Button loading={loading} onClick={handleSubmit}>
            <Upload className="h-4 w-4" />
            {tc('actions.submit')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
