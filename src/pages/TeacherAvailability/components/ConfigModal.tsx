import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Save, Info } from 'lucide-react';
import type { TeacherAvailabilityDTO, AvailabilityRangeDTO } from '@/types';

import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface ConfigModalProps {
  isOpen: boolean;
  initialRanges: TeacherAvailabilityDTO[];
  saving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  onClose: () => void;
  onSubmit: (ranges: AvailabilityRangeDTO[]) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 6; // 06:00 to 21:00
  return `${h.toString().padStart(2, '0')}:00`;
});
const TIME_OPTIONS = HOURS.map((h) => ({ value: h, label: h }));

export default function ConfigModal({
  isOpen,
  initialRanges,
  saving,
  saveError,
  saveSuccess,
  onClose,
  onSubmit,
}: ConfigModalProps) {
  const { t } = useTranslation('availability');
  const { t: tc } = useTranslation('common');

  const [ranges, setRanges] = useState<AvailabilityRangeDTO[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRanges(
        initialRanges.map((a) => ({
          day_of_week: a.day_of_week,
          start_time: a.start_time,
          end_time: a.end_time,
          is_virtual: a.is_virtual,
        }))
      );
    }
  }, [isOpen, initialRanges]);

  function addRange() {
    setRanges((prev) => [
      ...prev,
      { day_of_week: 0, start_time: '08:00', end_time: '09:00', is_virtual: false },
    ]);
  }

  function removeRange(idx: number) {
    setRanges((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRange(idx: number, field: keyof AvailabilityRangeDTO, value: any) {
    setRanges((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  const dayOptions = Array.from({ length: 7 }, (_, idx) => ({
    value: String(idx),
    label: tc(`days.${idx}`),
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('configModal.title')} size="lg">
      <div className="space-y-4">
        {/* Info */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-sky-500/5 border border-sky-500/15">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-300">{t('configModal.replaceNote')}</p>
        </div>

        {/* Ranges */}
        {ranges.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-6">{t('configModal.addRange')}</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {ranges.map((range, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-end gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]"
              >
                <div className="w-32">
                  <Select
                    label={idx === 0 ? t('configModal.day') : undefined}
                    value={String(range.day_of_week)}
                    onChange={(e) => updateRange(idx, 'day_of_week', Number(e.target.value))}
                    options={dayOptions}
                  />
                </div>
                <div className="w-24">
                  <Select
                    label={idx === 0 ? t('configModal.startTime') : undefined}
                    value={range.start_time}
                    onChange={(e) => updateRange(idx, 'start_time', e.target.value)}
                    options={TIME_OPTIONS}
                  />
                </div>
                <div className="w-24">
                  <Select
                    label={idx === 0 ? t('configModal.endTime') : undefined}
                    value={range.end_time}
                    onChange={(e) => updateRange(idx, 'end_time', e.target.value)}
                    options={TIME_OPTIONS}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-300 pb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={range.is_virtual ?? false}
                    onChange={(e) => updateRange(idx, 'is_virtual', e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-zinc-900"
                  />
                  {t('configModal.isVirtual')}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRange(idx)}
                  title={t('configModal.remove')}
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add range */}
        <Button variant="secondary" size="sm" onClick={addRange}>
          <Plus className="w-4 h-4" />
          {t('configModal.addRange')}
        </Button>

        {/* Preview */}
        {ranges.length > 0 && (
          <div className="border-t border-white/[0.06] pt-3">
            <div className="flex flex-wrap gap-2">
              {ranges.map((r, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    r.is_virtual
                      ? 'bg-sky-500/10 text-sky-400 ring-1 ring-inset ring-sky-500/20'
                      : 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20'
                  }`}
                >
                  {tc(`days.${r.day_of_week}`)} {r.start_time}-{r.end_time}
                  {r.is_virtual ? ` (${t('legend.virtual')})` : ` (${t('legend.presencial')})`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Save feedback */}
        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-sm text-emerald-400">{t('configModal.success')}</p>
          </div>
        )}
        {saveError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <p className="text-sm text-rose-400">{saveError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>
            {tc('actions.cancel')}
          </Button>
          <Button size="sm" loading={saving} onClick={() => onSubmit(ranges)}>
            <Save className="w-4 h-4" />
            {t('configModal.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
