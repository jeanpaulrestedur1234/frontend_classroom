import { MapPin } from 'lucide-react';
import type { RoomDTO } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export function StepRoom({ t, tc, rooms, loading, roomId, setRoomId }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-950 mb-1 font-[family-name:var(--font-display)]">
        {t('create.step.room')}
      </h2>
      <p className="text-sm text-zinc-400 mb-6">{t('create.selectRoom')}</p>
      {loading ? (
        <LoadingSpinner />
      ) : rooms.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">{tc('emptyState.noData')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rooms.map((room: RoomDTO) => (
            <button
              key={room.id}
              onClick={() => setRoomId(String(room.id))}
              className={`p-4 rounded-2xl text-left transition-all duration-200 backdrop-blur-xl ${
                roomId === String(room.id)
                  ? 'bg-blue-500/10 border-2 border-blue-500/40 ring-2 ring-blue-500/15 shadow-lg shadow-blue-500/10'
                  : 'bg-zinc-50 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    roomId === String(room.id) ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${roomId === String(room.id) ? 'text-blue-300' : 'text-zinc-800'}`}>
                    {room.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {tc('navigation.rooms')}: {room.capacity}
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
