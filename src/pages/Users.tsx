import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Users as UsersIcon,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listUsers, createUser, adminUpdateUser, deleteUser } from '../services/users';
import type { UserDTO, CreateUserDTO, AdminUpdateUserDTO, UserRole } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

/* ────────────────────────────── helpers ───────────────────────────────────── */

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  teacher: 'Profesor',
  student: 'Estudiante',
};

const ROLE_BADGE_VARIANT: Record<UserRole, 'success' | 'info' | 'warning' | 'default'> = {
  super_admin: 'success',
  admin: 'info',
  teacher: 'warning',
  student: 'default',
};

function getRoleOptions(currentUserRole: UserRole): { value: string; label: string }[] {
  if (currentUserRole === 'super_admin') {
    return [
      { value: 'super_admin', label: 'Super Admin' },
      { value: 'admin', label: 'Administrador' },
      { value: 'teacher', label: 'Profesor' },
      { value: 'student', label: 'Estudiante' },
    ];
  }
  return [
    { value: 'teacher', label: 'Profesor' },
    { value: 'student', label: 'Estudiante' },
  ];
}

const ROLE_FILTER_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Administrador' },
  { value: 'teacher', label: 'Profesor' },
  { value: 'student', label: 'Estudiante' },
];

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    // Axios-style error
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

/* ────────────────────────── create user form ─────────────────────────────── */

interface CreateFormState {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: string;
}

const EMPTY_CREATE_FORM: CreateFormState = {
  email: '',
  password: '',
  full_name: '',
  phone: '',
  role: '',
};

/* ────────────────────────── edit user form ────────────────────────────────── */

interface EditFormState {
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
}

/* ──────────────────────────── main component ─────────────────────────────── */

export default function Users() {
  const { user: currentUser } = useAuth();

  // Data
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(EMPTY_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateFormState, string>>>({});
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit modal
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ full_name: '', phone: '', role: '', is_active: true });
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof EditFormState, string>>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete confirmation
  const [deletingUser, setDeletingUser] = useState<UserDTO | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Toggle active
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

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

  const fetchUsers = useCallback(async () => {
    try {
      setFetchError(null);
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setFetchError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ── filtered users ─────────────────────────────────────────────────────── */

  const filteredUsers = useMemo(() => {
    let result = users;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    return result;
  }, [users, search, roleFilter]);

  /* ── create ─────────────────────────────────────────────────────────────── */

  function openCreateModal() {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateErrors({});
    setShowCreateModal(true);
  }

  function validateCreateForm(): boolean {
    const errors: Partial<Record<keyof CreateFormState, string>> = {};
    if (!createForm.email.trim()) errors.email = 'El email es requerido.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim()))
      errors.email = 'Email invalido.';
    if (!createForm.password.trim()) errors.password = 'La contrasena es requerida.';
    else if (createForm.password.length < 6) errors.password = 'Minimo 6 caracteres.';
    if (!createForm.full_name.trim()) errors.full_name = 'El nombre es requerido.';
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate() {
    if (!validateCreateForm()) return;
    setCreateSubmitting(true);
    try {
      const dto: CreateUserDTO = {
        email: createForm.email.trim(),
        password: createForm.password,
        full_name: createForm.full_name.trim(),
        ...(createForm.phone.trim() && { phone: createForm.phone.trim() }),
        ...(createForm.role && { role: createForm.role }),
      };
      await createUser(dto);
      setShowCreateModal(false);
      addToast('success', 'Usuario creado exitosamente.');
      await fetchUsers();
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setCreateSubmitting(false);
    }
  }

  /* ── edit ────────────────────────────────────────────────────────────────── */

  function openEditModal(u: UserDTO) {
    setEditingUser(u);
    setEditForm({
      full_name: u.full_name,
      phone: u.phone || '',
      role: u.role,
      is_active: u.is_active,
    });
    setEditErrors({});
  }

  function validateEditForm(): boolean {
    const errors: Partial<Record<keyof EditFormState, string>> = {};
    if (!editForm.full_name.trim()) errors.full_name = 'El nombre es requerido.';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleEdit() {
    if (!editingUser || !validateEditForm()) return;
    setEditSubmitting(true);
    try {
      const dto: AdminUpdateUserDTO = {
        full_name: editForm.full_name.trim(),
        ...(editForm.phone.trim() ? { phone: editForm.phone.trim() } : { phone: undefined }),
        role: editForm.role,
        is_active: editForm.is_active,
      };
      await adminUpdateUser(editingUser.id, dto);
      setEditingUser(null);
      addToast('success', 'Usuario actualizado exitosamente.');
      await fetchUsers();
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setEditSubmitting(false);
    }
  }

  /* ── toggle active ──────────────────────────────────────────────────────── */

  async function handleToggleActive(u: UserDTO) {
    setTogglingUserId(u.id);
    try {
      await adminUpdateUser(u.id, { is_active: !u.is_active });
      addToast('success', `Usuario ${!u.is_active ? 'activado' : 'desactivado'} exitosamente.`);
      await fetchUsers();
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setTogglingUserId(null);
    }
  }

  /* ── delete ─────────────────────────────────────────────────────────────── */

  async function handleDelete() {
    if (!deletingUser) return;
    setDeleteSubmitting(true);
    try {
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
      addToast('success', 'Usuario eliminado exitosamente.');
      await fetchUsers();
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  /* ── role options based on current user ─────────────────────────────────── */

  const roleOptions = currentUser ? getRoleOptions(currentUser.role) : [];

  /* ── render ─────────────────────────────────────────────────────────────── */

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los usuarios de la plataforma.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search / Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <Select
          options={ROLE_FILTER_OPTIONS}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : fetchError ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12" />}
            title="Error al cargar usuarios"
            description={fetchError}
            action={
              <Button variant="secondary" onClick={() => { setLoading(true); fetchUsers(); }}>
                Reintentar
              </Button>
            }
          />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <EmptyState
            icon={<UsersIcon className="h-12 w-12" />}
            title={users.length === 0 ? 'No hay usuarios' : 'Sin resultados'}
            description={
              users.length === 0
                ? 'Crea el primer usuario para comenzar.'
                : 'No se encontraron usuarios con los filtros aplicados.'
            }
            action={
              users.length === 0 ? (
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4" />
                  Nuevo Usuario
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={ROLE_BADGE_VARIANT[u.role]}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={u.is_active ? 'success' : 'danger'}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(u)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={togglingUserId === u.id}
                          onClick={() => handleToggleActive(u)}
                          title={u.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {u.is_active ? (
                            <UserX className="h-4 w-4 text-amber-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingUser(u)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Result count */}
          <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
            {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ── Create Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Usuario"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="space-y-4"
        >
          <Input
            label="Nombre completo"
            placeholder="Ej: Juan Perez"
            value={createForm.full_name}
            onChange={(e) => setCreateForm((f) => ({ ...f, full_name: e.target.value }))}
            error={createErrors.full_name}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={createForm.email}
            onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
            error={createErrors.email}
            required
          />
          <Input
            label="Contrasena"
            type="password"
            placeholder="Minimo 6 caracteres"
            value={createForm.password}
            onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
            error={createErrors.password}
            required
          />
          <Input
            label="Telefono"
            type="tel"
            placeholder="Opcional"
            value={createForm.phone}
            onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Select
            label="Rol"
            options={roleOptions}
            value={createForm.role}
            onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={createSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={createSubmitting}>
              Crear Usuario
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Editar Usuario"
        size="md"
      >
        {editingUser && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit();
            }}
            className="space-y-4"
          >
            <Input
              label="Nombre completo"
              value={editForm.full_name}
              onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
              error={editErrors.full_name}
              required
            />
            <Input
              label="Telefono"
              type="tel"
              placeholder="Opcional"
              value={editForm.phone}
              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <Select
              label="Rol"
              options={roleOptions}
              value={editForm.role}
              onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
            />
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
              </label>
              <span className="text-sm font-medium text-gray-700">
                {editForm.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingUser(null)}
                disabled={editSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" loading={editSubmitting}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Confirmar Eliminacion"
        size="sm"
      >
        {deletingUser && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  Estas seguro de que deseas eliminar al usuario{' '}
                  <span className="font-semibold">{deletingUser.full_name}</span>?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Esta accion no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingUser(null)}
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
