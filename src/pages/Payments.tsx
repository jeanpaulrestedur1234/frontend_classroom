import { useEffect, useState } from 'react';
import {
  CreditCard,
  ExternalLink,
  CheckCircle,
  XCircle,
  Filter,
  Info,
  AlertCircle,
  Search,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyPackages } from '../services/packages';
import { approvePayment } from '../services/payments';
import type {
  StudentPackageDTO,
  PaymentDTO,
} from '../types';
import {
  formatDate,
  formatCurrency,
  classTypeLabel,
  paymentStatusLabel,
} from '../utils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function paymentBadgeVariant(
  status: string,
): 'warning' | 'success' | 'danger' | 'info' | 'default' {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'notified':
      return 'info';
    case 'confirmed':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'default';
  }
}

/* ─── Student: My Payment History ────────────────────────────────────────── */

function StudentPayments() {
  const [packages, setPackages] = useState<StudentPackageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const data = await getMyPackages();
        setPackages(data);
      } catch {
        setError('No se pudieron cargar tus pagos.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <EmptyState
        icon={<CreditCard className="h-12 w-12" />}
        title="Error al cargar"
        description={error}
      />
    );
  }

  // Collect all payments from packages (if they exist on the DTO)
  // Since StudentPackageDTO doesn't include payments directly,
  // show package payment summary with a link to MyPackages
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen de pagos asociados a tus paquetes.
        </p>
      </div>

      <Card className="flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-gray-700">
            Los pagos estan asociados a cada paquete adquirido. Para gestionar
            pagos, subir comprobantes o activar paquetes, visita{' '}
            <a
              href="/app/my-packages"
              className="font-medium text-indigo-600 hover:text-indigo-700 underline"
            >
              Mis Paquetes
            </a>
            .
          </p>
        </div>
      </Card>

      {packages.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-12 w-12" />}
          title="Sin pagos"
          description="No tienes paquetes adquiridos ni pagos registrados."
        />
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {classTypeLabel(pkg.class_type)} - {pkg.hours_per_week}{' '}
                    hrs/semana
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(pkg.created_at)} &middot; {pkg.duration_weeks}{' '}
                    semanas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(pkg.total_price)}
                </span>
                <Badge
                  variant={
                    pkg.status === 'active' ? 'success' : 'warning'
                  }
                >
                  {pkg.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Admin: Payment Review Interface ────────────────────────────────────── */

function AdminPayments() {
  const [, setPackages] = useState<StudentPackageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Rejection modal
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    paymentId: string;
  }>({ open: false, paymentId: '' });
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Action loading
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Success/error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // In-memory payments extracted from packages
  // Since the API doesn't provide a direct "list all payments" endpoint,
  // and getMyPackages returns the logged-in user's packages (not all students'),
  // we note this limitation and provide the review UI structure.
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [hasApiLimitation, setHasApiLimitation] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    setHasApiLimitation(false);
    try {
      // Attempt to fetch via getMyPackages - for admin, the backend may
      // return all student packages or only the admin's own.
      const data = await getMyPackages();
      setPackages(data);

      // If no packages returned for admin, this likely means the endpoint
      // only returns the current user's packages
      if (data.length === 0) {
        setHasApiLimitation(true);
      }
    } catch {
      // If the endpoint fails for admin, that confirms the API limitation
      setHasApiLimitation(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  async function handleApprove(paymentId: string) {
    setApprovingId(paymentId);
    try {
      const updated = await approvePayment(paymentId, { approve: true });
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? updated : p)),
      );
      showSuccess('Pago aprobado exitosamente.');
      await fetchData();
    } catch {
      setError('Error al aprobar el pago.');
    } finally {
      setApprovingId(null);
    }
  }

  function openRejectModal(paymentId: string) {
    setRejectionReason('');
    setRejectError(null);
    setRejectModal({ open: true, paymentId });
  }

  async function handleReject() {
    setRejectError(null);
    if (!rejectionReason.trim()) {
      setRejectError('Debes indicar un motivo de rechazo.');
      return;
    }

    setRejecting(true);
    try {
      const updated = await approvePayment(rejectModal.paymentId, {
        approve: false,
        rejection_reason: rejectionReason.trim(),
      });
      setPayments((prev) =>
        prev.map((p) => (p.id === rejectModal.paymentId ? updated : p)),
      );
      setRejectModal({ open: false, paymentId: '' });
      showSuccess('Pago rechazado.');
      await fetchData();
    } catch {
      setRejectError('Error al rechazar el pago.');
    } finally {
      setRejecting(false);
    }
  }

  // Filter payments by status
  const filteredPayments =
    statusFilter === 'all'
      ? payments
      : payments.filter((p) => p.status === statusFilter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Pagos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Revisa y aprueba los comprobantes de pago enviados por los estudiantes.
        </p>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Workflow explanation */}
      <Card className="flex items-start gap-3 bg-indigo-50 border-indigo-200">
        <Info className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
        <div className="text-sm text-indigo-900 space-y-1">
          <p className="font-medium">Flujo de pagos</p>
          <ol className="list-decimal list-inside space-y-0.5 text-indigo-800">
            <li>El estudiante adquiere un paquete desde el catalogo.</li>
            <li>Crea un intento de pago y sube su comprobante (URL).</li>
            <li>
              El administrador revisa el comprobante y aprueba o rechaza el
              pago.
            </li>
            <li>
              Una vez aprobado, el estudiante puede activar su paquete.
            </li>
          </ol>
        </div>
      </Card>

      {hasApiLimitation && (
        <Card className="flex items-start gap-3 bg-amber-50 border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900">
            <p className="font-medium">Nota sobre el acceso a pagos</p>
            <p className="mt-1">
              Actualmente, la API no dispone de un endpoint para listar todos
              los pagos de todos los estudiantes. Los pagos se gestionan cuando
              los estudiantes suben sus comprobantes y las notificaciones llegan
              al sistema. Para revisar un pago especifico, utiliza el endpoint
              de aprobacion directamente con el ID del pago proporcionado por el
              estudiante.
            </p>
          </div>
        </Card>
      )}

      {/* Filter */}
      {payments.length > 0 && (
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'pending', label: 'Pendiente' },
              { value: 'notified', label: 'Notificado' },
              { value: 'confirmed', label: 'Confirmado' },
              { value: 'rejected', label: 'Rechazado' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      )}

      {/* Payments table/list */}
      {filteredPayments.length === 0 && !hasApiLimitation ? (
        <EmptyState
          icon={<CreditCard className="h-12 w-12" />}
          title="Sin pagos pendientes"
          description="No hay pagos para revisar en este momento."
        />
      ) : filteredPayments.length > 0 ? (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Pago #{payment.id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      Estudiante ID: {payment.student_id} &middot; Paquete:{' '}
                      {payment.student_package_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </span>
                  <Badge variant={paymentBadgeVariant(payment.status)}>
                    {paymentStatusLabel(payment.status)}
                  </Badge>
                </div>
              </div>

              {/* Details row */}
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                <span>Creado: {formatDate(payment.created_at)}</span>
                {payment.reviewed_at && (
                  <span>Revisado: {formatDate(payment.reviewed_at)}</span>
                )}
                {payment.reviewed_by && (
                  <span>Por: {payment.reviewed_by}</span>
                )}
              </div>

              {/* Proof URL */}
              {payment.payment_proof_url && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Comprobante:</span>
                  <a
                    href={payment.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver comprobante
                  </a>
                </div>
              )}

              {/* Rejection reason */}
              {payment.rejection_reason && (
                <div className="rounded-lg bg-red-50 px-3 py-2">
                  <p className="text-xs text-red-700">
                    <span className="font-medium">Motivo de rechazo:</span>{' '}
                    {payment.rejection_reason}
                  </p>
                </div>
              )}

              {/* Actions - only for pending/notified payments */}
              {(payment.status === 'pending' ||
                payment.status === 'notified') && (
                <div className="flex gap-3 pt-1">
                  <Button
                    size="sm"
                    loading={approvingId === payment.id}
                    onClick={() => handleApprove(payment.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => openRejectModal(payment.id)}
                  >
                    <XCircle className="h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : null}

      {/* If no direct payment data, show a manual search hint */}
      {payments.length === 0 && !loading && (
        <Card className="text-center py-8">
          <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">
            Revisa pagos por ID
          </p>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Cuando un estudiante suba un comprobante, podras aprobar o rechazar
            el pago usando su ID. Los estudiantes pueden compartir su ID de pago
            contigo para agilizar el proceso.
          </p>
        </Card>
      )}

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, paymentId: '' })}
        title="Rechazar Pago"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Indica el motivo por el cual se rechaza este pago. El estudiante
            podra ver esta razon.
          </p>

          <Input
            label="Motivo de Rechazo"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Ej: Comprobante ilegible, monto incorrecto..."
          />

          {rejectError && (
            <p className="text-sm text-red-600">{rejectError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() =>
                setRejectModal({ open: false, paymentId: '' })
              }
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={rejecting}
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4" />
              Rechazar Pago
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Main: Route based on role ──────────────────────────────────────────── */

export default function Payments() {
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  return isAdmin ? <AdminPayments /> : <StudentPayments />;
}
