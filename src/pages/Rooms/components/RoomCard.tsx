import { Pencil, Trash2, Users, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RoomDTO } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface RoomCardProps {
  room: RoomDTO;
  onEdit: (room: RoomDTO) => void;
  onDelete: (room: RoomDTO) => void;
}

export default function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  const { t } = useTranslation('rooms');
  const { t: tc } = useTranslation('common');

  return (
    <Card hover className="flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-50 font-[family-name:var(--font-display)]">
                {room.name}
              </h3>
              <Badge variant={room.is_active ? 'success' : 'danger'}>
                {room.is_active ? tc('status.active') : tc('status.inactive')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Users className="h-4 w-4 text-zinc-500" />
          <span>
            {t('capacity')}: <span className="font-medium text-zinc-200">{room.capacity}</span> {t('students')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/[0.06]">
        <Button variant="ghost" size="sm" onClick={() => onEdit(room)} className="flex-1">
          <Pencil className="h-3.5 w-3.5" />
          {tc('actions.edit')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(room)} className="flex-1 text-rose-400 hover:text-rose-300">
          <Trash2 className="h-3.5 w-3.5" />
          {tc('actions.delete')}
        </Button>
      </div>
    </Card>
  );
}
