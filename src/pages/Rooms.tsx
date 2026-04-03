import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { listRooms, createRoom, updateRoom, deleteRoom } from '../services/rooms';
import type { RoomDTO, CreateRoomDTO, UpdateRoomDTO } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

/* ────────────────────────────── helpers ───────────────────────────────────── */

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const axiosErr = err as any;
    const detail = axiosErr?.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) return detail[0].msg;
    return err.message;
  }
  return 'Ocurrio un error inesperado.';
}

/* ────────────────────────────── toast ─────────────────────────────────────── */

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

let toastIdCounter = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium text-white transition-all ${
            t.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <span>{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-2 hover:opacity-70">
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────── room form state ──────────────────────────────── */

interface RoomFormState {
  name: string;
  capacity: string;
  is_active: boolean;
}

const EMPTY_ROOM_FORM: RoomFormState = {
  name: '',
  capacity: '',
  is_active: true,
};

/* ──────────────────────────── main component ─────────────────────────────── */

export default function Rooms() {
  // Data
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<RoomFormState>(EMPTY_ROOM_FORM);
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof RoomFormState, string>>>({});
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit modal
  const [editingRoom, setEditingRoom] = useState<RoomDTO | null>(null);
  const [editForm, setEditForm] = useState<RoomFormState>(EMPTY_ROOM_FORM);
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof RoomFormState, string>>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete confirmation
  const [deletingRoom, setDeletingRoom] = useState<RoomDTO | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  function addToast(type: 'success' | 'error', message: string) {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  /* ── fetch ──────────────────────────────────────────────────────────────── */

  const fetchRooms = useCallback(async () => {
    try {
      setFetchError(null);
      const data = await listRooms();
      setRooms(data);
    } catch (err) {
      setFetchError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  /* ── validation ─────────────────────────────────────────────────────────── */

  function validateForm(form: RoomFormState): Partial<Record<keyof RoomFormState, string>> {
    const errors: Partial<Record<keyof RoomFormState, string>> = {};
    if (!form.name.trim()) errors.name = 'El nombre es requerido.';
    if (!form.capacity.trim()) {
      errors.capacity = 'La capacidad es requerida.';
    } else {
      const num = parseInt(form.capacity, 10);
      if (isNaN(num) || num < 1) errors.capacity = 'Debe ser un numero mayor a 0.';
    }
    return errors;
  }

  /* ── create ─────────────────────────────────────────────────────────────── */

  function openCreateModal() {
    setCreateForm(EMPTY_ROOM_FORM);
    setCreateErrors({});
    setShowCreateModal(true);
  }

  async function handleCreate() {
    const errors = validateForm(createForm);
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setCreateSubmitting(true);
    try {
      const dto: CreateRoomDTO = {
        name: createForm.name.trim(),
        capacity: parseInt(createForm.capacity, 10),
        is_active: createForm.is_active,
      };
      await createRoom(dto);
      setShowCreateModal(false);
      addToast('success', 'Salon creado exitosamente.');
      await fetchRooms();
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setCreateSubmitting(false);
    }
  }

  /* ── edit ────────────────────────────────────────────────────────────────── */

  function openEditModal(room: RoomDTO) {
    setEditingRoom(room);
    setEditForm({
      name: room.name,
      capacity: String(room.capacity),
      is_active: room.is_active,
    });
    setEditErrors({});
  }

  async function handleEdit() {
    if (!editingRoom) return;
    const errors = validateForm(editForm);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setEditSubmitting(true);
    try {
      const dto: UpdateRoomDTO = {
        name: editForm.name.trim(),
        capacity: parseInt(editForm.capacity, 10),
        is_active: editForm.is_active,
      };
      await updateRoom(editingRoom.id, dto);
      setEditingRoom(null);
      addToast('success', 'Salon actualizado exitosamente.');
      await fetchRooms();
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setEditSubmitting(false);
    }
  }

  /* ── delete ─────────────────────────────────────────────────────────────── */

  async function handleDelete() {
    if (!deletingRoom) return;
    setDeleteSubmitting(true);
    try {
      await deleteRoom(deletingRoom.id);
      setDeletingRoom(null);
      addToast('success', 'Salon eliminado exitosamente.');
      await fetchRooms();
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  /* ── room form component (shared between create/edit) ───────────────────── */

  function RoomForm({
    form,
    errors,
    submitting,
    submitLabel,
    onUpdate,
    onSubmit,
    onCancel,
  }: {
    form: RoomFormState;
    errors: Partial<Record<keyof RoomFormState, string>>;
    submitting: boolean;
    submitLabel: string;
    onUpdate: (patch: Partial<RoomFormState>) => void;
    onSubmit: () => void;
    onCancel: () => void;
  }) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        <Input
          label="Nombre del salon"
          placeholder="Ej: Salon A"
          value={form.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          error={errors.name}
          required
        />
        <Input
          label="Capacidad"
          type="number"
          min={1}
          placeholder="Ej: 20"
          value={form.capacity}
          onChange={(e) => onUpdate({ capacity: e.target.value })}
          error={errors.capacity}
          required
        />
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => onUpdate({ is_active: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
          </label>
          <span className="text-sm font-medium text-gray-700">
            {form.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  /* ── render ─────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Salones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los salones disponibles para clases.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Nuevo Salon
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : fetchError ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12" />}
            title="Error al cargar salones"
            description={fetchError}
            action={
              <Button variant="secondary" onClick={() => { setLoading(true); fetchRooms(); }}>
                Reintentar
              </Button>
            }
          />
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <EmptyState
            icon={<Building2 className="h-12 w-12" />}
            title="No hay salones"
            description="Crea el primer salon para comenzar."
            action={
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4" />
                Nuevo Salon
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id} className="flex flex-col justify-between">
              <div>
                {/* Room header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{room.name}</h3>
                      <Badge variant={room.is_active ? 'success' : 'danger'}>
                        {room.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                  <Users className="h-4 w-4" />
                  <span>
                    Capacidad: <span className="font-medium text-gray-700">{room.capacity}</span>{' '}
                    {room.capacity === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditModal(room)}
                  className="flex-1"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeletingRoom(room)}
                  className="flex-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Salon"
        size="md"
      >
        <RoomForm
          form={createForm}
          errors={createErrors}
          submitting={createSubmitting}
          submitLabel="Crear Salon"
          onUpdate={(patch) => setCreateForm((f) => ({ ...f, ...patch }))}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        title="Editar Salon"
        size="md"
      >
        {editingRoom && (
          <RoomForm
            form={editForm}
            errors={editErrors}
            submitting={editSubmitting}
            submitLabel="Guardar Cambios"
            onUpdate={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
            onSubmit={handleEdit}
            onCancel={() => setEditingRoom(null)}
          />
        )}
      </Modal>

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={!!deletingRoom}
        onClose={() => setDeletingRoom(null)}
        title="Confirmar Eliminacion"
        size="sm"
      >
        {deletingRoom && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  Estas seguro de que deseas eliminar el salon{' '}
                  <span className="font-semibold">{deletingRoom.name}</span>?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Esta accion no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingRoom(null)}
                disabled={deleteSubmitting}
              >
                Cancelar
              </Button>
              <Button variant="danger" loading={deleteSubmitting} onClick={handleDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
