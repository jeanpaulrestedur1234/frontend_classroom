import { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  CalendarDays,
  CreditCard,
  Upload,
  Play,
  Plus,
  ExternalLink,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  getMyPackages,
  activatePackage,
  createPaymentIntent,
} from '../services/packages';
import { uploadReceipt } from '../services/payments';
import type {
  StudentPackageDTO,
  PaymentDTO,
  ClassType,
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
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function statusBadgeVariant(
  status: string,
): 'warning' | 'success' | 'danger' | 'info' | 'default' {
  switch (status) {
    case 'inactive':
      return 'warning';
    case 'active':
      return 'success';
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

function packageStatusLabel(status: string): string {
  switch (status) {
    case 'inactive':
      return 'Inactivo';
    case 'active':
      return 'Activo';
    default:
      return status;
  }
}

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

/* ─── Types (extended for UI state) ──────────────────────────────────────── */

interface StudentPackageWithPayments extends StudentPackageDTO {
  payments?: PaymentDTO[];
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function MyPackages() {
  const [packages, setPackages] = useState<StudentPackageWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action loading states
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [creatingPaymentId, setCreatingPaymentId] = useState<string | null>(null);

  // Upload receipt modal
  const [uploadModal, setUploadModal] = useState<{
    open: boolean;
    paymentId: string;
    packageId: string;
  }>({ open: false, paymentId: '', packageId: '' });
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Success messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyPackages();
      setPackages(data);
    } catch {
      setError('No se pudieron cargar tus paquetes.');
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  async function handleActivate(spId: string) {
    setActivatingId(spId);
    try {
      await activatePackage(spId);
      showSuccess('Paquete activado exitosamente.');
      await fetchPackages();
    } catch {
      setError('Error al activar el paquete.');
    } finally {
      setActivatingId(null);
    }
  }

  async function handleCreatePayment(spId: string) {
    setCreatingPaymentId(spId);
    try {
      const payment = await createPaymentIntent(spId);
      showSuccess('Intento de pago creado. Sube tu comprobante.');
      // Update the local state to reflect the new payment
      setPackages((prev) =>
        prev.map((p) => {
          if (p.id === spId) {
            return {
              ...p,
              payments: [...(p.payments || []), payment],
            };
          }
          return p;
        }),
      );
      // Open upload modal immediately
      setUploadModal({ open: true, paymentId: payment.id, packageId: spId });
    } catch {
      setError('Error al crear el intento de pago.');
    } finally {
      setCreatingPaymentId(null);
    }
  }

  function openUploadModal(paymentId: string, packageId: string) {
    setProofUrl('');
    setUploadError(null);
    setUploadModal({ open: true, paymentId, packageId });
  }

  async function handleUploadReceipt() {
    setUploadError(null);
    if (!proofUrl.trim()) {
      setUploadError('Ingresa la URL del comprobante de pago.');
      return;
    }

    setUploading(true);
    try {
      await uploadReceipt(uploadModal.paymentId, {
        payment_proof_url: proofUrl.trim(),
      });
      setUploadModal({ open: false, paymentId: '', packageId: '' });
      showSuccess('Comprobante subido exitosamente.');
      await fetchPackages();
    } catch {
      setUploadError('Error al subir el comprobante. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  /* ─── Render ─────────────────────────────────────────────────────────── */

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Paquetes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona tus paquetes adquiridos, pagos y activaciones.
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

      {/* Package list */}
      {packages.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="Sin paquetes"
          description="No has adquirido ningun paquete todavia. Visita el catalogo de paquetes para comenzar."
          action={
            <Button onClick={() => (window.location.href = '/app/packages')}>
              Ver Paquetes
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {packages.map((pkg) => {
            const totalSessions = pkg.hours_per_week * pkg.duration_weeks;
            const payments = pkg.payments || [];
            const hasConfirmedPayment = payments.some(
              (p) => p.status === 'confirmed',
            );
            const hasPendingPayment = payments.some(
              (p) => p.status === 'pending' || p.status === 'notified',
            );

            return (
              <Card key={pkg.id} className="space-y-4">
                {/* Package header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={classTypeBadgeVariant(pkg.class_type)}>
                          {classTypeLabel(pkg.class_type)}
                        </Badge>
                        <Badge variant={statusBadgeVariant(pkg.status)}>
                          {packageStatusLabel(pkg.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {pkg.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(pkg.total_price)}
                  </span>
                </div>

                {/* Package details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{pkg.hours_per_week} hrs/semana</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span>{pkg.duration_weeks} semanas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span>{totalSessions} hrs totales</span>
                  </div>
                  {pkg.discount_pct > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span>{pkg.discount_pct}% descuento</span>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                  <span>Creado: {formatDate(pkg.created_at)}</span>
                  {pkg.activated_at && (
                    <span>Activado: {formatDate(pkg.activated_at)}</span>
                  )}
                  {pkg.expires_at && (
                    <span>Expira: {formatDate(pkg.expires_at)}</span>
                  )}
                </div>

                {/* Payments section */}
                {payments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Pagos</h4>
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                {formatCurrency(payment.amount)}
                              </span>
                              <span className="ml-3">
                                <Badge
                                  variant={statusBadgeVariant(payment.status)}
                                >
                                  {paymentStatusLabel(payment.status)}
                                </Badge>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {payment.payment_proof_url && (
                              <a
                                href={payment.payment_proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Ver comprobante
                              </a>
                            )}
                            {payment.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  openUploadModal(payment.id, pkg.id)
                                }
                              >
                                <Upload className="h-3 w-3" />
                                Subir Comprobante
                              </Button>
                            )}
                            {payment.rejection_reason && (
                              <span className="text-xs text-red-600">
                                Motivo: {payment.rejection_reason}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {pkg.status === 'inactive' && hasConfirmedPayment && (
                    <Button
                      size="sm"
                      loading={activatingId === pkg.id}
                      onClick={() => handleActivate(pkg.id)}
                    >
                      <Play className="h-4 w-4" />
                      Activar Paquete
                    </Button>
                  )}

                  {!hasConfirmedPayment && !hasPendingPayment && (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={creatingPaymentId === pkg.id}
                      onClick={() => handleCreatePayment(pkg.id)}
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo Pago
                    </Button>
                  )}

                  {hasPendingPayment && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const pendingPayment = payments.find(
                          (p) => p.status === 'pending',
                        );
                        if (pendingPayment) {
                          openUploadModal(pendingPayment.id, pkg.id);
                        }
                      }}
                    >
                      <Upload className="h-4 w-4" />
                      Subir Comprobante
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Receipt Modal */}
      <Modal
        isOpen={uploadModal.open}
        onClose={() =>
          setUploadModal({ open: false, paymentId: '', packageId: '' })
        }
        title="Subir Comprobante de Pago"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ingresa la URL de tu comprobante de pago (imagen o documento). Puede
            ser un enlace de Google Drive, Dropbox, Imgur u otro servicio de
            almacenamiento.
          </p>

          <Input
            label="URL del Comprobante"
            type="url"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="https://..."
          />

          {uploadError && (
            <p className="text-sm text-red-600">{uploadError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() =>
                setUploadModal({ open: false, paymentId: '', packageId: '' })
              }
            >
              Cancelar
            </Button>
            <Button loading={uploading} onClick={handleUploadReceipt}>
              <Upload className="h-4 w-4" />
              Subir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
