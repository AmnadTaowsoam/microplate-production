// src/utils/api/auth.ts
import { fetcher } from '../../utils/fetcher';

/**
 * Request payloads
 */
export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface RefreshRequest {
  refreshToken: string;
}

/**
 * Response payloads
 */
export interface SignupResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}
export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}
export interface RefreshResponse {
  accessToken: string;
}

/**
 * Auth API client
 */
export const authApi = {
  /**
   * Sign up a new user and store tokens in localStorage
   */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const res = await fetcher<SignupResponse>('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    localStorage.setItem('accessToken', res.accessToken);
    if (res.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken);
    }
    return res;
  },

  /**
   * Log in a user, store tokens in localStorage
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await fetcher<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    return res;
  },

  /**
   * Refresh access token and update localStorage
   */
  refresh: async (data: RefreshRequest): Promise<RefreshResponse> => {
    const res = await fetcher<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    localStorage.setItem('accessToken', res.accessToken);
    return res;
  },
};