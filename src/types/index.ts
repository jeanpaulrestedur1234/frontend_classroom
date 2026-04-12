// ─── Enums (string literal unions) ───────────────────────────────────────────

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type BookingType = 'virtual' | 'presencial';

export type ClassType = 'open_group' | 'closed_group' | 'private';

export type PaymentStatus = 'pending' | 'notified' | 'confirmed' | 'rejected';

export type StudentPackageStatus = 'inactive' | 'active';

// ─── Auth ────────────────────────────────────────────────────────────────────

export type LoginDTO = {
  email: string;
  password: string;
};

export type TokenResponseDTO = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type TokenRefreshDTO = {
  refresh_token: string;
};

// ─── Users ───────────────────────────────────────────────────────────────────

export type UserDTO = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  metadata: Record<string, any>;
};

export type CreateUserDTO = {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: string;
  metadata?: Record<string, any>;
};

export type UpdateUserDTO = {
  full_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
};

export type AdminUpdateUserDTO = {
  full_name?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
};

// ─── Rooms ───────────────────────────────────────────────────────────────────

export type RoomDTO = {
  id: number;
  name: string;
  capacity: number;
  is_active: boolean;
};

export type CreateRoomDTO = {
  name: string;
  capacity: number;
  is_active?: boolean;
};

export type UpdateRoomDTO = {
  name?: string;
  capacity?: number;
  is_active?: boolean;
};

// ─── Packages ────────────────────────────────────────────────────────────────

export type PackageDTO = {
  id: string;
  class_type: ClassType;
  hours_per_week: number;
  duration_weeks: number;
  base_price: number;
  discount_pct: number;
};

export type CreatePackageDTO = {
  class_type: ClassType;
  hours_per_week: number;
  duration_weeks: number;
  base_price: number;
  discount_pct?: number;
};

export type StudentPackageDTO = {
  id: string;
  student_id: number;
  class_type: ClassType;
  hours_per_week: number;
  duration_weeks: number;
  base_price: number;
  discount_pct: number;
  total_price: number;
  status: StudentPackageStatus;
  created_at: string;
  activated_at: string | null;
  expires_at: string | null;
  bookings_count: number;
  updated_at: string;
};

export type AcquirePackageResponse = {
  student_package: StudentPackageDTO;
  payment: PaymentDTO;
};

// ─── Payments ────────────────────────────────────────────────────────────────

export type PaymentDTO = {
  id: string;
  student_id: number;
  student_package_id: string;
  amount: number;
  status: PaymentStatus;
  payment_proof_url: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentUploadReceiptDTO = {
  payment_proof_url: string;
};

export type AdminReviewPaymentDTO = {
  approve: boolean;
  rejection_reason?: string;
};

// ─── Teacher Availability ────────────────────────────────────────────────────

export type TeacherAvailabilityDTO = {
  id: string;
  teacher_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_virtual: boolean;
  created_at: string;
};

export type AvailabilityRangeDTO = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_virtual?: boolean;
};

export type SetAvailabilityDTO = {
  ranges: AvailabilityRangeDTO[];
};

// ─── Teacher Booking Availability (with slot occupancy) ───────────────────────

export type BookingStudentRef = {
  student_package_id: string;
  student_id: number;
  student_name: string;
};

export type SlotBookingInfo = {
  booking_id: string;
  booking_type: BookingType;
  status: BookingStatus;
  scheduled_date: string;
  student_count: number;
  students: BookingStudentRef[];
  room: { id: number; name: string; capacity: number } | null;
};

export type AvailabilitySlot = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_virtual: boolean;
  is_booked: boolean;
  booking: SlotBookingInfo | null;
};

export type TeacherBookingAvailabilityDTO = {
  availability_id: string;
  teacher_id: number;
  day_of_week: number;
  is_virtual: boolean;
  range_start: string;
  range_end: string;
  slots: AvailabilitySlot[];
};

// ─── Ref types (embedded references) ─────────────────────────────────────────

export type TeacherRef = {
  id: number;
  full_name: string;
  email: string;
};

export type RoomRef = {
  id: number;
  name: string;
  capacity: number;
};

// ─── Bookings ────────────────────────────────────────────────────────────────

export type CreateStudentBookingDTO = {
  teacher_id: string;
  booking_type?: BookingType;
  room_id?: string;
  scheduled_date: string;
  start_time: string;
};

export type StudentBookingDetailDto = {
  id: string;
  teacher_id: string;
  room_id?: string;
  booking_type: BookingType;
  status: BookingStatus;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  teacher?: TeacherRef;
  room?: RoomRef;
};

export type BookStudentPackageDTO = {
  student_package_id: string;
  booking_id: string;
};

// ─── Room Availability Response ──────────────────────────────────────────────

export type RoomAvailabilitySlot = {
  booking_id: string;
  teacher_id: string;
  teacher_name?: string;
  booking_type: BookingType;
  status: BookingStatus;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  student_count: number;
};

export type RoomAvailabilityResponse = {
  room_id: number;
  room_name: string;
  room_capacity: number;
  start_date: string;
  end_date: string;
  total_slots: number;
  slots: RoomAvailabilitySlot[];
};

// ─── Auth context ────────────────────────────────────────────────────────────

export type AuthUser = UserDTO;

// ─── Paginated response (API wraps lists in this) ──────────────────────────

export type PaginatedResponse<T> = {
  total: number;
  page: number;
  page_size: number;
  items: T[];
};

// ─── API errors ──────────────────────────────────────────────────────────────

export type ApiError = {
  detail: string | Array<{ loc: any[]; msg: string; type: string }>;
};
