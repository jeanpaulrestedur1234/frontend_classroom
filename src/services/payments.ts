import api from '@/services/api';
import type {
  AdminReviewPaymentDTO,
  PaginatedResponse,
  PaymentDTO,
  PaymentUploadReceiptDTO,
} from '@/types';

export async function listPayments(
  page = 1,
  pageSize = 50,
  filters: {
    studentPackageId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {},
): Promise<PaginatedResponse<PaymentDTO>> {
  const params: Record<string, any> = { page, page_size: pageSize };
  if (filters.studentPackageId) params.student_package_id = filters.studentPackageId;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;

  const response = await api.get<PaginatedResponse<PaymentDTO>>(
    '/api/payments',
    { params },
  );
  return response.data;
}

export async function uploadReceipt(
  paymentId: string,
  data: PaymentUploadReceiptDTO,
): Promise<PaymentDTO> {
  const response = await api.post<PaymentDTO>(
    `/api/payments/${paymentId}/upload-receipt`,
    data,
  );
  return response.data;
}

export async function approvePayment(
  paymentId: string,
  data: AdminReviewPaymentDTO,
): Promise<PaymentDTO> {
  const response = await api.post<PaymentDTO>(
    `/api/admin/payments/${paymentId}/approve`,
    data,
  );
  return response.data;
}

export async function getPaymentByPackageId(studentPackageId: string): Promise<PaymentDTO[]> {
  const response = await api.get<PaymentDTO[]>(
    `/api/student-packages/${encodeURIComponent(studentPackageId)}/payments`,
  );
  return response.data;
}

