import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Building2, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation } from '@/hooks';
import { useToast } from '@/context/ToastContext';
import { listRooms, createRoom, updateRoom, deleteRoom } from '@/services/rooms';
import type { RoomDTO } from '@/types';

import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import RoomCard from './components/RoomCard';
import RoomModal from './components/RoomModal';
import RoomDeleteModal from './components/RoomDeleteModal';

export default function Rooms() {
  const { t } = useTranslation('rooms');
  const { t: tc } = useTranslation('common');
  const { success: toastSuccess, error: toastError } = useToast();

  const { data: rooms, loading, error, refetch } = useQuery(listRooms);
  const createMut = useMutation(createRoom);
  const updateMut = useMutation(updateRoom);
  const deleteMut = useMutation(deleteRoom);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomDTO | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<RoomDTO | null>(null);

  /* ─────────────────────── Handlers ─────────────────────────────────────── */

  async function handleCreateOrEdit(id: number | null, data: { name: string; capacity: number; is_active: boolean }) {
    try {
      if (id) {
        await updateMut.execute(id, data);
        toastSuccess(t('edit.success'));
        setEditingRoom(null);
      } else {
        await createMut.execute(data);
        toastSuccess(t('create.success'));
        setCreateModalOpen(false);
      }
      refetch();
    } catch {
      toastError(id ? t('edit.error') : t('create.error'));
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMut.execute(id);
      toastSuccess(t('delete.success'));
      setDeletingRoom(null);
      refetch();
    } catch {
      toastError(t('delete.error'));
    }
  }

  /* ─────────────────────── Render ───────────────────────────────────────── */

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
          {t('title')}
        </h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t('newRoom')}
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-6">
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12" />}
            title={tc('errors.generic')}
            description={error}
            action={
              <Button variant="secondary" onClick={refetch}>
                {tc('actions.retry')}
              </Button>
            }
          />
        </div>
      ) : rooms?.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-6">
          <EmptyState
            icon={<Building2 className="h-12 w-12" />}
            title={t('empty.title')}
            description={t('empty.description')}
            action={
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                {t('newRoom')}
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(rooms ?? []).map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={setEditingRoom}
              onDelete={setDeletingRoom}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <RoomModal
        isOpen={createModalOpen}
        room={null}
        isSubmitting={createMut.loading}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateOrEdit}
      />

      <RoomModal
        isOpen={!!editingRoom}
        room={editingRoom}
        isSubmitting={updateMut.loading}
        onClose={() => setEditingRoom(null)}
        onSubmit={handleCreateOrEdit}
      />

      <RoomDeleteModal
        room={deletingRoom}
        isSubmitting={deleteMut.loading}
        onClose={() => setDeletingRoom(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
