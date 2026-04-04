import { Pencil, UserCheck, UserX, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserDTO, UserRole } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface UsersTableProps {
  users: UserDTO[];
  currentUserId: string;
  togglingUserId: string | null;
  onEdit: (u: UserDTO) => void;
  onToggleActive: (u: UserDTO) => void;
  onDelete: (u: UserDTO) => void;
}

const ROLE_BADGE_VARIANT: Record<UserRole, 'success' | 'info' | 'warning' | 'default'> = {
  super_admin: 'success',
  admin: 'info',
  teacher: 'warning',
  student: 'default',
};

export default function UsersTable({
  users,
  currentUserId,
  togglingUserId,
  onEdit,
  onToggleActive,
  onDelete,
}: UsersTableProps) {
  const { t } = useTranslation('users');
  const { t: tc } = useTranslation('common');

  return (
    <div className="bg-zinc-50 backdrop-blur-xl border border-zinc-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-white/[0.04]">
              <th className="px-6 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {t('table.name')}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {t('table.email')}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {t('table.role')}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {t('table.status')}
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {t('table.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr
                key={u.id}
                className={`transition-colors hover:bg-white/[0.04] ${
                  idx !== users.length - 1 ? 'border-b border-zinc-100' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center text-sm font-semibold text-amber-400 shrink-0">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-zinc-950">{u.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={ROLE_BADGE_VARIANT[u.role]}>
                    {tc(`roles.${u.role}`)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={u.is_active ? 'success' : 'danger'}>
                    {u.is_active ? tc('status.active') : tc('status.inactive')}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(u)} title={tc('actions.edit')}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={togglingUserId === u.id}
                      onClick={() => onToggleActive(u)}
                      title={u.is_active ? tc('status.inactive') : tc('actions.activate')}
                    >
                      {u.is_active ? (
                        <UserX className="h-4 w-4 text-amber-400" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-emerald-400" />
                      )}
                    </Button>
                    {u.role !== 'super_admin' && u.id !== currentUserId && (
                      <Button variant="ghost" size="sm" onClick={() => onDelete(u)} title={tc('actions.delete')}>
                        <Trash2 className="h-4 w-4 text-rose-400" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
