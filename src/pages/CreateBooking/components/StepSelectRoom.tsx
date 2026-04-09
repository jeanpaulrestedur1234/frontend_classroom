import { MapPin } from 'lucide-react';
import type { RoomDTO } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function StepRoom({ t, tc, rooms, loading, roomId, setRoomId }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[var(--text-heading)] mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.room')}
      </h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">{t('create.selectRoom')}</p>
      {loading ? (
        <LoadingSpinner />
      ) : rooms.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">{tc('emptyState.noData')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((room: RoomDTO) => (
            <button
              key={room.id}
              onClick={() => setRoomId(String(room.id))}
              className={`p-4 rounded-2xl text-left transition-all duration-200 ${
                roomId === String(room.id)
                  ? 'bg-[var(--presencial)]/10 border-2 border-[var(--presencial)]/40 ring-2 ring-[var(--presencial)]/15 shadow-lg shadow-[var(--presencial)]/10'
                  : 'bg-[var(--bg-subtle)] border-2 border-[var(--border-main)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    roomId === String(room.id)
                      ? 'bg-[var(--presencial)]/15 text-[var(--presencial)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${roomId === String(room.id) ? 'text-[var(--presencial)]' : 'text-[var(--text-main)]'}`}>
                    {room.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Cap. {room.capacity}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
