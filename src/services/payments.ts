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
  studentPackageId?: string,
): Promise<PaginatedResponse<PaymentDTO>> {
  const params: Record<string, any> = { page, page_size: pageSize };
  if (studentPackageId) params.student_package_id = studentPackageId;

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

