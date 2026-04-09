import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyAvailability, setMyAvailability, getTeacherAvailability } from '@/services/availability';
import { listUsers } from '@/services/users';
import type { TeacherAvailabilityDTO, AvailabilityRangeDTO, UserDTO } from '@/types';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

import WeeklyGrid from './components/WeeklyGrid';
import ConfigModal from './components/ConfigModal';

function isFriday(): boolean {
  return new Date().getDay() === 5;
}

function getCurrentDayName(tc: (key: string) => string): string {
  const jsDay = new Date().getDay();
  const apiDay = jsDay === 0 ? 6 : jsDay - 1;
  return tc(`days.${apiDay}`);
}

export default function TeacherAvailability() {
  const { user } = useAuth();
  const { t } = useTranslation('availability');
  const { t: tc } = useTranslation('common');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isTeacher = user?.role === 'teacher';

  /* data */
  const [availability, setAvailability] = useState<TeacherAvailabilityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* admin: teacher selector */
  const [teachers, setTeachers] = useState<UserDTO[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teachersLoading, setTeachersLoading] = useState(false);

  /* modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /* ──── fetch availability ──── */
  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: TeacherAvailabilityDTO[];
      if (isAdmin && selectedTeacherId) {
        data = await getTeacherAvailability(selectedTeacherId);
      } else {
        data = await getMyAvailability();
      }
      setAvailability(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? tc('errors.generic'));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, selectedTeacherId, tc]);

  useEffect(() => {
    if (isAdmin && !selectedTeacherId) {
      setLoading(false);
      return;
    }
    fetchAvailability();
  }, [fetchAvailability, isAdmin, selectedTeacherId]);

  /* admin: fetch teachers list */
  useEffect(() => {
    if (!isAdmin) return;
    setTeachersLoading(true);
    listUsers()
      .then((users) => setTeachers(users.filter((u) => u.role === 'teacher' && u.is_active)))
      .catch(() => {})
      .finally(() => setTeachersLoading(false));
  }, [isAdmin]);

  /* ──── handlers ──── */
  function openConfigModal() {
    setSaveError(null);
    setSaveSuccess(false);
    setModalOpen(true);
  }

  async function handleSave(ranges: AvailabilityRangeDTO[]) {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const result = await setMyAvailability({ ranges });
      setAvailability(result);
      setSaveSuccess(true);
      setTimeout(() => setModalOpen(false), 1200);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string' && (detail.toLowerCase().includes('viernes') || detail.toLowerCase().includes('friday'))) {
        setSaveError(t('configModal.fridayError'));
      } else {
        setSaveError(typeof detail === 'string' ? detail : t('configModal.error'));
      }
    } finally {
      setSaving(false);
    }
  }

  /* ──── render ──── */

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 font-[family-name:var(--font-display)]">
            {isAdmin ? t('adminTitle') : t('title')}
          </h1>
        </div>

        {isTeacher && (
          <Button onClick={openConfigModal}>
            <Clock className="w-4 h-4" />
            {t('configure')}
          </Button>
        )}
      </div>

      {/* Friday warning banner */}
      {isTeacher && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 backdrop-blur-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              {isFriday() ? t('fridayReady') : t('fridayWarning', { day: getCurrentDayName(tc) })}
            </p>
          </div>
        </div>
      )}

      {/* Admin: teacher selector */}
      {isAdmin && (
        <Card className="!p-4">
          <div className="max-w-xs">
            {teachersLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Select
                label={t('selectTeacher')}
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                options={teachers.map((teacher) => ({
                  value: teacher.id,
                  label: teacher.full_name,
                }))}
              />
            )}
          </div>
        </Card>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
            <p className="text-sm text-rose-400">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchAvailability}>
              {tc('actions.retry')}
            </Button>
          </div>
        </Card>
      ) : isAdmin && !selectedTeacherId ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title={t('selectTeacher')}
          description={t('selectTeacher')}
        />
      ) : availability.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-12 w-12" />}
          title={t('noAvailability')}
          description={t('noAvailability')}
          action={
            isTeacher ? (
              <Button onClick={openConfigModal}>
                <Clock className="w-4 h-4" />
                {t('configure')}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <WeeklyGrid availability={availability} />
      )}

      <ConfigModal
        isOpen={modalOpen}
        initialRanges={availability}
        saving={saving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
      />
    </div>
  );
}
