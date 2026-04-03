import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proofUrl: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function UploadReceiptModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
}: UploadReceiptModalProps) {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');

  const [proofUrl, setProofUrl] = useState('');

  function handleClose() {
    setProofUrl('');
    onClose();
  }

  async function handleSubmit() {
    await onSubmit(proofUrl.trim());
    if (!error) {
      setProofUrl('');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('myPackages.uploadModal.title')} size="md">
      <div className="space-y-4">
        <Input
          label={t('myPackages.uploadModal.urlLabel')}
          type="url"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          placeholder={t('myPackages.uploadModal.urlPlaceholder')}
        />

        {error && (
          <p className="text-sm text-rose-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
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
