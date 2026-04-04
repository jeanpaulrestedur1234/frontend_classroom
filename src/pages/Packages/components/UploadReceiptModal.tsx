import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileUp } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void>;
}

export default function UploadReceiptModal({
  isOpen,
  onClose,
  onConfirm,
}: UploadReceiptModalProps) {
  const { t } = useTranslation('packages');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      await onConfirm(file);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error uploading receipt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('myPackages.uploadModal.title')}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label={t('myPackages.uploadModal.fileLabel')}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          />
          
          {file && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-100 border border-zinc-200">
              <FileUp className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-600 truncate">{file.name}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!file}>
            {t('myPackages.uploadModal.confirm')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
