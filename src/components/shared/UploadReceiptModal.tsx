import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUp } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { uploadFile } from '@/services/upload';

interface UploadReceiptModalProps {
  isOpen: boolean;
  paymentId: string | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (id: string | null, url: string) => void;
}

export default function UploadReceiptModal({
  isOpen,
  paymentId,
  loading,
  onClose,
  onSubmit,
}: UploadReceiptModalProps) {
  const { t } = useTranslation('packages');
  const { t: tc } = useTranslation('common');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError(tc('validation.required'));
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      onSubmit(paymentId, url);
    } catch (err: any) {
      setError(err?.message || t('myPackages.uploadModal.error'));
    } finally {
      setIsUploading(false);
    }
  }

  // Reset internal state
  if (!isOpen && file) {
    setFile(null);
    setError(null);
  }

  const isLoadingTotal = loading || isUploading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('myPackages.uploadModal.title')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label={t('myPackages.uploadModal.fileLabel')}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            disabled={isLoadingTotal}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          />

          {file && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-50 border border-zinc-200">
              <FileUp className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-600 truncate">
                {file.name}
              </span>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoadingTotal}
            type="button"
          >
            {tc('actions.cancel')}
          </Button>
          <Button loading={isLoadingTotal} type="submit" disabled={!file}>
            <FileUp className="h-4 w-4" />
            {t('myPackages.uploadModal.confirm')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
