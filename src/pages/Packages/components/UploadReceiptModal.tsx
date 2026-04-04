import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUp } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface UploadReceiptModalProps {
  paymentId: string | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (id: string, url: string) => void;
}

export default function UploadReceiptModal({
  paymentId,
  loading,
  onClose,
  onSubmit,
}: UploadReceiptModalProps) {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <Modal
      isOpen={!!paymentId}
      onClose={onClose}
      title={t('myPackages.uploadModal.title')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('myPackages.uploadModal.urlLabel')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('myPackages.uploadModal.urlPlaceholder')}
          type="url"
          required
        />

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            {tc('actions.cancel')}
          </Button>
          <Button loading={loading} type="submit">
            <FileUp className="h-4 w-4" />
            {tc('actions.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
