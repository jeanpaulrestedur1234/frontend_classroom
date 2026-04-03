import { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Clock,
  CalendarDays,
  Percent,
  ShoppingCart,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  listPackages,
  createPackage,
  acquirePackage,
} from '../services/packages';
import type { PackageDTO, CreatePackageDTO, ClassType } from '../types';
import {
  formatCurrency,
  classTypeLabel,
} from '../utils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

/* ─── Class type badge variant mapping ───────────────────────────────────── */

function classTypeBadgeVariant(ct: ClassType): 'info' | 'success' | 'warning' {
  switch (ct) {
    case 'open_group':
      return 'info';
    case 'closed_group':
      return 'success';
    case 'private':
      return 'warning';
  }
}

/* ─── Admin: Package catalog management ──────────────────────────────────── */

function AdminPackages() {
  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [classType, setClassType] = useState<string>('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discountPct, setDiscountPct] = useState('0');

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    setError(null);
    try {
      const data = await listPackages();
      setPackages(data);
    } catch {
      setError('No se pudieron cargar los paquetes.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setClassType('');
    setHoursPerWeek('');
    setDurationWeeks('');
    setBasePrice('');
    setDiscountPct('0');
    setFormError(null);
  }

  function openModal() {
    resetForm();
    setShowModal(true);
  }

  async function handleCreate() {
    setFormError(null);

    if (!classType || !hoursPerWeek || !durationWeeks || !basePrice) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }

    const dto: CreatePackageDTO = {
      class_type: classType as ClassType,
      hours_per_week: Number(hoursPerWeek),
      duration_weeks: Number(durationWeeks),
      base_price: Number(basePrice),
      discount_pct: Number(discountPct) || 0,
    };

    setCreating(true);
    try {
      await createPackage(dto);
      setShowModal(false);
      await fetchPackages();
    } catch {
      setFormError('Error al crear el paquete. Verifica los datos e intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="Error al cargar"
        description={error}
        action={<Button onClick={fetchPackages}>Reintentar</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogo de Paquetes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los paquetes disponibles para los estudiantes.
          </p>
        </div>
        <Button onClick={openModal}>
          <Plus className="h-4 w-4" />
          Nuevo Paquete
        </Button>
      </div>

      {/* Package grid */}
      {packages.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="Sin paquetes"
          description="No hay paquetes creados todavia. Crea el primero."
          action={
            <Button onClick={openModal}>
              <Plus className="h-4 w-4" />
              Nuevo Paquete
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const finalPrice =
              pkg.discount_pct > 0
                ? pkg.base_price * (1 - pkg.discount_pct / 100)
                : pkg.base_price;

            return (
              <Card key={pkg.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Badge variant={classTypeBadgeVariant(pkg.class_type)}>
                    {classTypeLabel(pkg.class_type)}
                  </Badge>
                  {pkg.discount_pct > 0 && (
                    <Badge variant="danger">
                      <Percent className="mr-1 h-3 w-3 inline" />
                      {pkg.discount_pct}% OFF
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{pkg.hours_per_week} hrs/semana</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span>{pkg.duration_weeks} semanas</span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100">
                  {pkg.discount_pct > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(finalPrice)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(pkg.base_price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(pkg.base_price)}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Package Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Paquete"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Tipo de Clase"
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            options={[
              { value: 'open_group', label: 'Grupo Abierto' },
              { value: 'closed_group', label: 'Grupo Cerrado' },
              { value: 'private', label: 'Privado' },
            ]}
          />

          <Input
            label="Horas por semana"
            type="number"
            min={1}
            step={1}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            placeholder="Ej: 4"
          />

          <Input
            label="Duracion (semanas)"
            type="number"
            min={1}
            step={1}
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(e.target.value)}
            placeholder="Ej: 8"
          />

          <Input
            label="Precio base (USD)"
            type="number"
            min={0}
            step={0.01}
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            placeholder="Ej: 250.00"
          />

          <Input
            label="Descuento (%)"
            type="number"
            min={0}
            max={100}
            step={1}
            value={discountPct}
            onChange={(e) => setDiscountPct(e.target.value)}
            placeholder="0"
          />

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button loading={creating} onClick={handleCreate}>
              Crear Paquete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Student: Available packages to acquire ─────────────────────────────── */

function StudentPackages() {
  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acquiringId, setAcquiringId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    setError(null);
    try {
      const data = await listPackages();
      setPackages(data);
    } catch {
      setError('No se pudieron cargar los paquetes disponibles.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcquire(packageId: string) {
    setAcquiringId(packageId);
    setError(null);
    try {
      await acquirePackage(packageId);
      setSuccessId(packageId);
      setTimeout(() => setSuccessId(null), 3000);
    } catch {
      setError('Error al adquirir el paquete. Intenta de nuevo.');
    } finally {
      setAcquiringId(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error && packages.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="Error al cargar"
        description={error}
        action={<Button onClick={fetchPackages}>Reintentar</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paquetes Disponibles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Explora y adquiere los paquetes de clases disponibles.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Package grid */}
      {packages.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="Sin paquetes disponibles"
          description="No hay paquetes disponibles en este momento."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const finalPrice =
              pkg.discount_pct > 0
                ? pkg.base_price * (1 - pkg.discount_pct / 100)
                : pkg.base_price;
            const isAcquiring = acquiringId === pkg.id;
            const isSuccess = successId === pkg.id;

            return (
              <Card key={pkg.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Badge variant={classTypeBadgeVariant(pkg.class_type)}>
                    {classTypeLabel(pkg.class_type)}
                  </Badge>
                  {pkg.discount_pct > 0 && (
                    <Badge variant="danger">
                      <Percent className="mr-1 h-3 w-3 inline" />
                      {pkg.discount_pct}% OFF
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{pkg.hours_per_week} hrs/semana</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span>{pkg.duration_weeks} semanas</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  {pkg.discount_pct > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(finalPrice)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(pkg.base_price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(pkg.base_price)}
                    </span>
                  )}
                </div>

                <div className="mt-auto">
                  {isSuccess ? (
                    <Button variant="secondary" disabled className="w-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Adquirido
                    </Button>
                  ) : (
                    <Button
                      loading={isAcquiring}
                      onClick={() => handleAcquire(pkg.id)}
                      className="w-full"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Adquirir
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main: Route based on role ──────────────────────────────────────────── */

export default function Packages() {
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  return isAdmin ? <AdminPackages /> : <StudentPackages />;
}
