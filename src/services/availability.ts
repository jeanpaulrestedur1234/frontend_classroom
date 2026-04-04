import api from '@/services/api';
import type { SetAvailabilityDTO, TeacherAvailabilityDTO, TeacherBookingAvailabilityDTO } from '@/types';

export async function getMyAvailability(): Promise<TeacherAvailabilityDTO[]> {
  const response = await api.get<TeacherAvailabilityDTO[]>(
    '/api/teachers/availability',
  );
  return response.data;
}

export async function setMyAvailability(
  data: SetAvailabilityDTO,
): Promise<TeacherAvailabilityDTO[]> {
  const response = await api.post<TeacherAvailabilityDTO[]>(
    '/api/teachers/availability',
    data,
  );
  return response.data;
}

export async function getTeacherAvailability(
  teacherId: string,
): Promise<TeacherBookingAvailabilityDTO[]> {
  const response = await api.get<TeacherBookingAvailabilityDTO[]>(
    `/api/teachers/${teacherId}/availability`,
  );
  return response.data;
}
