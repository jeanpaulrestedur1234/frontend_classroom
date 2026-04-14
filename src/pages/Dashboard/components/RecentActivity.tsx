import { Monitor, Building2, CalendarDays, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { StudentBookingDetailDto } from '@/types';

interface RecentActivityProps {
  bookings: StudentBookingDetailDto[];
  title: string;
  emptyMessage: string;
  role: 'admin' | 'teacher' | 'student';
}

function bookingBadgeVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'confirmed': return 'success';
    case 'pending':   return 'warning';
    case 'cancelled': return 'danger';
    case 'completed': return 'success';
    default:          return 'default';
  }
}

export default function RecentActivity({ bookings, title, emptyMessage, role }: RecentActivityProps) {
  const { t: tc } = useTranslation('common');

  return (
    <div className="mt-10 animate-fade-in-up">
      <h2 className="mb-4 text-lg font-semibold text-[var(--text-heading)] font-[family-name:var(--font-display)]">
        {title}
      </h2>
      <Card className="overflow-hidden border-[var(--border-main)] shadow-sm">
        {bookings.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="bg-[var(--bg-subtle)] p-3 rounded-full mb-3">
              <CalendarDays className="h-6 w-6 text-[var(--text-dim)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)] max-w-[200px]">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-main)]">
            {bookings.map((b) => {
              const isVirtual = b.booking_type === 'virtual';
              const teacherName = b.teacher_name || b.teacher?.full_name || tc('roles.teacher');
              const roomName = b.room_name || b.room?.name;
              
              let activityTitle = '';
              if (role === 'admin') {
                activityTitle = `${isVirtual ? tc('bookingTypes.virtual') : tc('bookingTypes.presencial')} - ${teacherName}`;
              } else if (role === 'student') {
                activityTitle = `${tc(`bookingTypes.${b.booking_type}`)} con ${teacherName}`;
              } else {
                activityTitle = `Clase ${tc(`bookingTypes.${b.booking_type}`)} ${roomName ? `en ${roomName}` : ''}`;
              }

              return (
                <li
                  key={b.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 first:pt-4 last:pb-4 transition-all hover:bg-[var(--bg-subtle)]"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className={`p-2.5 rounded-xl shrink-0 transition-all group-hover:scale-110 ${
                      isVirtual 
                        ? 'bg-[var(--virtual-bg)] text-[var(--virtual)] shadow-sm' 
                        : 'bg-[var(--presencial-bg)] text-[var(--presencial)] shadow-sm'
                    }`}>
                      {isVirtual ? <Monitor className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-[var(--text-main)] truncate">
                        {activityTitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-[var(--text-dim)]" />
                          {b.scheduled_date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[var(--text-dim)]" />
                          {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-3">
                    <Badge variant={bookingBadgeVariant(b.status)} className="capitalize ring-1">
                      {tc(`status.${b.status}`)}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
