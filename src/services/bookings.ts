import api from '@/services/api';
import type {
  BookStudentPackageDTO,
  CreateStudentBookingDTO,
  PaginatedResponse,
  RoomAvailabilityResponse,
  StudentBookingDetailDto,
} from '@/types';

export async function createBooking(
  data: CreateStudentBookingDTO,
  studentPackageId?: string,
): Promise<StudentBookingDetailDto> {
  const url = studentPackageId
    ? `/api/bookings?student_package_id=${encodeURIComponent(studentPackageId)}`
    : '/api/bookings';
  const response = await api.post<StudentBookingDetailDto>(url, data);
  return response.data;
}

export async function listMyBookings(
  params: { status?: string; page?: number; page_size?: number } = {},
): Promise<PaginatedResponse<StudentBookingDetailDto>> {
  const response = await api.get<PaginatedResponse<StudentBookingDetailDto>>(
    '/api/bookings',
    { params },
  );
  return response.data;
}

export async function addPackageToBooking(
  bookingId: string,
  data: { student_package_id: string },
): Promise<BookStudentPackageDTO> {
  const response = await api.post<BookStudentPackageDTO>(
    `/api/bookings/${bookingId}/packages`,
    {
      student_package_id: data.student_package_id,
      booking_id: bookingId,
    },
  );
  return response.data;
}

export async function confirmBooking(
  bookingId: string,
): Promise<StudentBookingDetailDto> {
  const response = await api.post<StudentBookingDetailDto>(
    `/api/bookings/${bookingId}/confirm`,
  );
  return response.data;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await api.delete(`/api/bookings/${bookingId}`);
}

export async function getBookingDetails(
  bookingId: string,
): Promise<StudentBookingDetailDto> {
  const response = await api.get<StudentBookingDetailDto>(
    `/api/bookings/${bookingId}`,
  );
  return response.data;
}

export async function getTeacherBookingAvailability(
  teacherId: string,
  startDate: string,
  endDate: string,
): Promise<StudentBookingDetailDto[]> {
  const response = await api.get<PaginatedResponse<StudentBookingDetailDto>>(
    `/api/bookings/teacher/${teacherId}/availability`,
    { params: { start_date: startDate, end_date: endDate } },
  );
  return Array.isArray(response.data.items)
    ? response.data.items
    : Array.isArray(response.data)
      ? (response.data as unknown as StudentBookingDetailDto[])
      : [];
}

export async function getRoomBookingAvailability(
  roomId: number,
  startDate: string,
  endDate: string,
): Promise<RoomAvailabilityResponse> {
  const response = await api.get<RoomAvailabilityResponse>(
    `/api/bookings/room/${roomId}/availability`,
    { params: { start_date: startDate, end_date: endDate } },
  );
  return response.data;
}
