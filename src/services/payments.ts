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
): Promise<PaginatedResponse<PaymentDTO>> {
  const response = await api.get<PaginatedResponse<PaymentDTO>>(
    '/api/payments',
    { params: { page, page_size: pageSize } },
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