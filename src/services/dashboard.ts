import api from '@/services/api';

export type AdminDashboardStats = {
  total_users: number;
  active_rooms: number;
  available_packages: number;
  pending_bookings: number;
  completed_bookings: number;
};

export type TeacherDashboardStats = {
  pending_bookings: number;
  completed_bookings: number;
};

export type StudentDashboardStats = {
  active_packages: number;
  pending_bookings: number;
  completed_bookings: number;
};

export type DashboardStats = AdminDashboardStats | TeacherDashboardStats | StudentDashboardStats;

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>('/api/dashboard/stats');
  return response.data;
}
