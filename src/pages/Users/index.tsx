import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Users as UsersIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useQuery, useMutation } from '@/hooks';
import { listUsers, createUser, adminUpdateUser, deleteUser } from '@/services/users';
import type { UserDTO, CreateUserDTO, AdminUpdateUserDTO, UserRole } from '@/types';

import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import UsersTable from './components/UsersTable';
import UserCreateModal from './components/UserCreateModal';
import UserEditModal from './components/UserEditModal';
import UserDeleteModal from './components/UserDeleteModal';

const ALL_ROLES: UserRole[] = ['super_admin', 'admin', 'teacher', 'student'];

function getRoleOptions(currentUserRole: UserRole, tc: (key: string) => string) {
  const roles: UserRole[] =
    currentUserRole === 'super_admin' ? ['super_admin', 'admin', 'teacher', 'student'] : ['teacher', 'student'];
  return roles.map((r) => ({ value: r, label: tc(`roles.${r}`) }));
}

export default function Users() {
  const { t } = useTranslation('users');
  const { t: tc } = useTranslation('common');
  const { user: currentUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Queries & Mutations
  const { data: users, loading, error, refetch } = useQuery(listUsers);
  const createMut = useMutation(createUser);
  const updateMut = useMutation(adminUpdateUser);
  const deleteMut = useMutation(deleteUser);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserDTO | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Derived state
  const filteredUsers = useMemo(() => {
    let result = users ?? [];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }
    return result;
  }, [users, search, roleFilter]);

  const roleOptions = currentUser ? getRoleOptions(currentUser.role, tc) : [];
  const roleFilterOptions = ALL_ROLES.map((r) => ({ value: r, label: tc(`roles.${r}`) }));

  if (!currentUser) return null;

  /* ─────────────────────── Handlers ───────────────────────────────────── */

  async function handleCreate(dto: CreateUserDTO) {
    try {
      await createMut.execute(dto);
      setShowCreate(false);
      toastSuccess(t('create.success'));
      refetch();
    } catch {
      toastError(t('create.error'));
    }
  }

  async function handleEdit(id: string, dto: AdminUpdateUserDTO) {
    try {
      await updateMut.execute(id, dto);
      setEditingUser(null);
      toastSuccess(t('edit.success'));
      refetch();
    } catch {
      toastError(t('edit.error'));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMut.execute(id);
      setDeletingUser(null);
      toastSuccess(t('delete.success'));
      refetch();
    } catch {
      toastError(t('delete.error'));
    }
  }

  async function handleToggleActive(u: UserDTO) {
    setTogglingUserId(u.id);
    try {
      await updateMut.execute(u.id, { is_active: !u.is_active });
      toastSuccess(!u.is_active ? t('toggleActive.activateSuccess') : t('toggleActive.deactivateSuccess'));
      refetch();
    } catch {
      toastError(t('toggleActive.error'));
    } finally {
      setTogglingUserId(null); // Local loading state to avoid blanketing the whole table
    }
  }

  /* ─────────────────────── Render ─────────────────────────────────────── */

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
          {t('title')}
        </h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          {t('newUser')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)] placeholder:text-[var(--text-dim)] transition-all duration-200 hover:border-[var(--primary)]/50 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>
        <Select
          options={roleFilterOptions}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:w-52"
        />
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
      ) : filteredUsers.length === 0 ? (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-2xl p-6">
          <EmptyState
            icon={<UsersIcon className="h-12 w-12" />}
            title={users?.length === 0 ? t('empty.title') : tc('emptyState.noResults')}
            description={users?.length === 0 ? t('empty.description') : undefined}
            action={
              users?.length === 0 ? (
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="h-4 w-4" />
                  {t('newUser')}
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <UsersTable
            users={filteredUsers}
            currentUserId={currentUser?.id ?? ''}
            togglingUserId={togglingUserId}
            onEdit={setEditingUser}
            onToggleActive={handleToggleActive}
            onDelete={setDeletingUser}
          />
          {/* Result count */}
          <div className="border-t border-[var(--border-main)] px-6 py-3 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-main)]">
            {tc('pagination.showing')} {filteredUsers.length} {tc('pagination.of')} {(users ?? []).length}{' '}
            {tc('pagination.results')}
          </div>
        </div>
      )}

      {/* Modals */}
      <UserCreateModal
        isOpen={showCreate}
        isSubmitting={createMut.loading}
        roleOptions={roleOptions}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />

      <UserEditModal
        user={editingUser}
        isSubmitting={updateMut.loading}
        roleOptions={roleOptions}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEdit}
      />

      <UserDeleteModal
        user={deletingUser}
        isSubmitting={deleteMut.loading}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
