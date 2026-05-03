import api from '@/services/api';
import type {
  AdminUpdateUserDTO,
  CreateUserDTO,
  PaginatedResponse,
  UpdateUserDTO,
  UserDTO,
} from '@/types';

export async function createUser(data: CreateUserDTO): Promise<UserDTO> {
  const response = await api.post<UserDTO>('/api/users', data);
  return response.data;
}

export async function listUsers(): Promise<UserDTO[]> {
  const response = await api.get<PaginatedResponse<UserDTO>>('/api/users');
  return response.data.items;
}

export async function getMe(): Promise<UserDTO> {
  const response = await api.get<UserDTO>('/api/users/me');
  return response.data;
}

export async function updateMe(data: UpdateUserDTO): Promise<UserDTO> {
  const response = await api.patch<UserDTO>('/api/users/me', data);
  return response.data;
}

export async function getUser(id: string): Promise<UserDTO> {
  const response = await api.get<UserDTO>(`/api/users/${id}`);
  return response.data;
}

export async function adminUpdateUser(
  id: string,
  data: AdminUpdateUserDTO,
): Promise<UserDTO> {
  const response = await api.patch<UserDTO>(`/api/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`);
}

export async function listTeachers(): Promise<UserDTO[]> {
  const response = await api.get<PaginatedResponse<UserDTO>>('/api/users/teachers');
  return response.data.items;
}
