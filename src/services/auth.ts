import axios from 'axios';
import type { LoginDTO, TokenRefreshDTO, TokenResponseDTO } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export async function login(data: LoginDTO): Promise<TokenResponseDTO> {
  const response = await axios.post<TokenResponseDTO>(
    `${API_BASE_URL}/api/auth/login`,
    data,
  );
  return response.data;
}

/**
 * Uses a raw axios instance (not the interceptor-wrapped one) to avoid
 * circular refresh loops.
 */
export async function refresh(data: TokenRefreshDTO): Promise<TokenResponseDTO> {
  const response = await axios.post<TokenResponseDTO>(
    `${API_BASE_URL}/api/auth/refresh`,
    data,
  );
  return response.data;
}
