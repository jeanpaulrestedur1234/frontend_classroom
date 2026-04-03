export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function classTypeLabel(ct: string): string {
  const map: Record<string, string> = {
    open_group: 'Grupo Abierto',
    closed_group: 'Grupo Cerrado',
    private: 'Privado',
  };
  return map[ct] ?? ct;
}

export function bookingStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
  };
  return map[status] ?? status;
}

export function paymentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    notified: 'Notificado',
    confirmed: 'Confirmado',
    rejected: 'Rechazado',
  };
  return map[status] ?? status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'active':
      return 'text-green-600';
    case 'pending':
    case 'notified':
      return 'text-yellow-600';
    case 'cancelled':
    case 'rejected':
      return 'text-red-600';
    case 'completed':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}
