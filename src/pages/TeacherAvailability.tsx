import { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  Info,
  Monitor,
  Building2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getMyAvailability,
  setMyAvailability,
  getTeacherAvailability,
} from '../services/availability';
import { listUsers } from '../services/users';
import type {
  TeacherAvailabilityDTO,
  AvailabilityRangeDTO,
  UserDTO,
} from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

/* ────────────────────────── constants ───────────────────────────────────── */

const DAY_NAMES = [
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
  'Domingo',
];

const HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 6; // 06:00 to 21:00
  const hh = h.toString().padStart(2, '0');
  return `${hh}:00`;
});

const DAY_OPTIONS = DAY_NAMES.map((name, idx) => ({
  value: String(idx),
  label: name,
}));

const TIME_OPTIONS = HOURS.map((h) => ({ value: h, label: h }));

/* ────────────────────────── helpers ──────────────────────────────────────── */

/** Check if a given time falls within an availability range */
function isSlotCovered(
  day: number,
  hour: string,
  slots: TeacherAvailabilityDTO[],
): TeacherAvailabilityDTO | undefined {
  return slots.find(
    (s) => s.day_of_week === day && s.start_time <= hour && s.end_time > hour,
  );
}

function isFriday(): boolean {
  return new Date().getDay() === 5;
}

/* ────────────────────────── component ───────────────────────────────────── */

export default function TeacherAvailability() {
  const { user } = useAuth();
  const isAdmin =
    user?.role === 'admin' || user?.role === 'super_admin';
  const isTeacher = user?.role === 'teacher';

  /* data */
  const [availability, setAvailability] = useState<TeacherAvailabilityDTO[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* admin: teacher selector */
  const [teachers, setTeachers] = useState<UserDTO[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teachersLoading, setTeachersLoading] = useState(false);

  /* modal */
  const [modalOpen, setModalOpen] = useState(false);
  const [ranges, setRanges] = useState<AvailabilityRangeDTO[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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
      setError(
        err?.response?.data?.detail ??
          'Error al cargar la disponibilidad.',
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin, selectedTeacherId]);

  useEffect(() => {
    // For admin: only fetch when a teacher is selected, or fetch own if teacher
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
      .then((users) =>
        setTeachers(users.filter((u) => u.role === 'teacher' && u.is_active)),
      )
      .catch(() => {})
      .finally(() => setTeachersLoading(false));
  }, [isAdmin]);

  /* ──── modal management ──── */
  function openConfigModal() {
    // Pre-populate with current availability
    setRanges(
      availability.map((a) => ({
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
        is_virtual: a.is_virtual,
      })),
    );
    setSaveError('');
    setModalOpen(true);
  }

  function addRange() {
    setRanges((prev) => [
      ...prev,
      { day_of_week: 0, start_time: '08:00', end_time: '09:00', is_virtual: false },
    ]);
  }

  function removeRange(idx: number) {
    setRanges((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRange(
    idx: number,
    field: keyof AvailabilityRangeDTO,
    value: any,
  ) {
    setRanges((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const result = await setMyAvailability({ ranges });
      setAvailability(result);
      setModalOpen(false);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (
        typeof detail === 'string' &&
        (detail.toLowerCase().includes('viernes') ||
          detail.toLowerCase().includes('friday'))
      ) {
        setSaveError(
          'La disponibilidad solo puede modificarse los dias viernes. Por favor intenta de nuevo el viernes.',
        );
      } else {
        setSaveError(
          typeof detail === 'string'
            ? detail
            : 'Error al guardar la disponibilidad.',
        );
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin
              ? 'Disponibilidad de Profesores'
              : 'Mi Disponibilidad Semanal'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin
              ? 'Consulta la disponibilidad de cada profesor.'
              : 'Configura tus horarios disponibles para clases.'}
          </p>
        </div>

        {isTeacher && (
          <Button onClick={openConfigModal}>
            <Clock className="w-4 h-4" />
            Configurar Disponibilidad
          </Button>
        )}
      </div>

      {/* Friday warning banner */}
      {isTeacher && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              La disponibilidad solo puede modificarse los viernes
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {isFriday()
                ? 'Hoy es viernes, puedes actualizar tu disponibilidad.'
                : 'Tendras que esperar hasta el proximo viernes para hacer cambios.'}
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
                label="Seleccionar Profesor"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                options={teachers.map((t) => ({
                  value: t.id,
                  label: t.full_name,
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
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="secondary" size="sm" onClick={fetchAvailability}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : isAdmin && !selectedTeacherId ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="Selecciona un profesor"
          description="Elige un profesor del menu desplegable para ver su disponibilidad."
        />
      ) : availability.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-12 w-12" />}
          title="Sin disponibilidad configurada"
          description="No hay bloques de disponibilidad registrados."
          action={
            isTeacher ? (
              <Button onClick={openConfigModal}>
                <Plus className="w-4 h-4" />
                Configurar Ahora
              </Button>
            ) : undefined
          }
        />
      ) : (
        /* Weekly grid */
        <Card className="!p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="sticky left-0 bg-white z-10 px-4 py-3 text-left font-medium text-gray-500 w-20">
                  Hora
                </th>
                {DAY_NAMES.map((day) => (
                  <th
                    key={day}
                    className="px-2 py-3 text-center font-medium text-gray-500 min-w-[100px]"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr
                  key={hour}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="sticky left-0 bg-white z-10 px-4 py-2 text-xs text-gray-500 font-mono">
                    {hour}
                  </td>
                  {DAY_NAMES.map((_, dayIdx) => {
                    const slot = isSlotCovered(dayIdx, hour, availability);
                    return (
                      <td key={dayIdx} className="px-2 py-2 text-center">
                        {slot ? (
                          <div
                            className={`rounded-md px-2 py-1 text-xs font-medium ${
                              slot.is_virtual
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                            title={`${slot.start_time} - ${slot.end_time} (${slot.is_virtual ? 'Virtual' : 'Presencial'})`}
                          >
                            {slot.is_virtual ? (
                              <span className="flex items-center justify-center gap-1">
                                <Monitor className="w-3 h-3" /> Virtual
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-1">
                                <Building2 className="w-3 h-3" /> Presencial
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-6" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Summary legend */}
      {availability.length > 0 && (
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100" />
            <span>Virtual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-indigo-100" />
            <span>Presencial</span>
          </div>
        </div>
      )}

      {/* ──── Config Modal ──── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Configurar Disponibilidad"
        size="lg"
      >
        <div className="space-y-4">
          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Define los bloques de tiempo en los que estas disponible para
              dar clases. Al guardar se reemplazara toda tu disponibilidad
              actual.
            </p>
          </div>

          {/* Ranges */}
          {ranges.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay bloques definidos. Agrega uno para comenzar.
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {ranges.map((range, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-end gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <div className="w-32">
                    <Select
                      label={idx === 0 ? 'Dia' : undefined}
                      value={String(range.day_of_week)}
                      onChange={(e) =>
                        updateRange(idx, 'day_of_week', Number(e.target.value))
                      }
                      options={DAY_OPTIONS}
                    />
                  </div>
                  <div className="w-24">
                    <Select
                      label={idx === 0 ? 'Inicio' : undefined}
                      value={range.start_time}
                      onChange={(e) =>
                        updateRange(idx, 'start_time', e.target.value)
                      }
                      options={TIME_OPTIONS}
                    />
                  </div>
                  <div className="w-24">
                    <Select
                      label={idx === 0 ? 'Fin' : undefined}
                      value={range.end_time}
                      onChange={(e) =>
                        updateRange(idx, 'end_time', e.target.value)
                      }
                      options={TIME_OPTIONS}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 pb-1">
                    <input
                      type="checkbox"
                      checked={range.is_virtual ?? false}
                      onChange={(e) =>
                        updateRange(idx, 'is_virtual', e.target.checked)
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Virtual
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRange(idx)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add range */}
          <Button variant="secondary" size="sm" onClick={addRange}>
            <Plus className="w-4 h-4" />
            Agregar Bloque
          </Button>

          {/* Preview */}
          {ranges.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Vista Previa
              </p>
              <div className="flex flex-wrap gap-2">
                {ranges.map((r, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      r.is_virtual
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {DAY_NAMES[r.day_of_week]} {r.start_time}-{r.end_time}
                    {r.is_virtual ? ' (V)' : ' (P)'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Save error */}
          {saveError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button size="sm" loading={saving} onClick={handleSave}>
              <Save className="w-4 h-4" />
              Guardar Disponibilidad
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
