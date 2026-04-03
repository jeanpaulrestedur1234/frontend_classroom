import api from './api';
import type { CreateRoomDTO, PaginatedResponse, RoomDTO, UpdateRoomDTO } from '../types';

export async function createRoom(data: CreateRoomDTO): Promise<RoomDTO> {
  const response = await api.post<RoomDTO>('/api/rooms', data);
  return response.data;
}

export async function listRooms(): Promise<RoomDTO[]> {
  const response = await api.get<PaginatedResponse<RoomDTO>>('/api/rooms');
  return response.data.items;
}

export async function getRoom(id: number): Promise<RoomDTO> {
  const response = await api.get<RoomDTO>(`/api/rooms/${id}`);
  return response.data;
}

export async function updateRoom(
  id: number,
  data: UpdateRoomDTO,
): Promise<RoomDTO> {
  const response = await api.patch<RoomDTO>(`/api/rooms/${id}`, data);
  return response.data;
}

export async function deleteRoom(id: number): Promise<void> {
  await api.delete(`/api/rooms/${id}`);
}
