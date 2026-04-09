import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface BookingsFilterProps {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onClear: () => void;
}

export default function BookingsFilter({
  statusFilter,
  setStatusFilter,
  onClear,
}: BookingsFilterProps) {
  const { t } = useTranslation('bookings');
  const { t: tc } = useTranslation('common');

  return (
    <Card className="!p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <Filter className="hidden sm:block w-5 h-5 text-zinc-500 mt-1" />
        <Select
          label={t('filterByStatus')}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'pending', label: tc('status.pending') },
            { value: 'confirmed', label: tc('status.confirmed') },
            { value: 'cancelled', label: tc('status.cancelled') },
            { value: 'completed', label: tc('status.completed') },
          ]}
        />
        {statusFilter && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            {tc('actions.clearFilters')}
          </Button>
        )}
      </div>
    </Card>
  );
}
