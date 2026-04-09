import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RoomDTO } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface RoomDeleteModalProps {
  room: RoomDTO | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export default function RoomDeleteModal({ room, isSubmitting, onClose, onConfirm }: RoomDeleteModalProps) {
  const { t } = useTranslation('rooms');
  const { t: tc } = useTranslation('common');

  return (
    <Modal isOpen={!!room} onClose={onClose} title={t('delete.title')} size="sm">
      {room && (
        <div>
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-inset ring-rose-500/20">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t('delete.message', { name: room.name })}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              {tc('confirm.no')}
            </Button>
            <Button variant="danger" loading={isSubmitting} onClick={() => onConfirm(room.id)}>
              {tc('confirm.yes')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
