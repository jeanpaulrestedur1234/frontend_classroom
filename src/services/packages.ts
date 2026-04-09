import api from '@/services/api';
import type {
  CreatePackageDTO,
  PackageDTO,
  PaginatedResponse,
  PaymentDTO,
  StudentPackageDTO,
} from '@/types';

export async function createPackage(data: CreatePackageDTO): Promise<PackageDTO> {
  const response = await api.post<PackageDTO>('/api/packages', data);
  return response.data;
}

export async function listPackages(): Promise<PackageDTO[]> {
  const response = await api.get<PaginatedResponse<PackageDTO>>('/api/packages');
  return response.data.items;
}

export async function acquirePackage(
  packageId: string,
): Promise<StudentPackageDTO> {
  const response = await api.post<StudentPackageDTO>(
    `/api/packages/${packageId}/acquire`,
  );
  return response.data;
}

export async function getMyPackages(): Promise<StudentPackageDTO[]> {
  const response = await api.get<PaginatedResponse<StudentPackageDTO>>(
    '/api/student-packages/me',
  );
  return response.data.items;
}

export async function activatePackage(
  spId: string,
): Promise<StudentPackageDTO> {
  const response = await api.post<StudentPackageDTO>(
    `/api/student-packages/${spId}/activate`,
  );
  return response.data;
}

export async function createPaymentIntent(spId: string): Promise<PaymentDTO> {
  const response = await api.post<PaymentDTO>(
    `/api/student-packages/${spId}/create-payment`,
  );
  return response.data;
}
