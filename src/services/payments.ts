import api from './api';
import type {
  AdminReviewPaymentDTO,
  PaymentDTO,
  PaymentUploadReceiptDTO,
} from '../types';

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
