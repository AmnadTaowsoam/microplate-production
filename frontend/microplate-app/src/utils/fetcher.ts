// src/utils/fetcher.ts
import { authApi } from './api/auth';

export async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error('❌ NEXT_PUBLIC_API_BASE_URL is not defined');
  const fullUrl = `${baseUrl}${url}`;

  // helper ที่ทำ request จริง ๆ
  const makeRequest = async (): Promise<Response> => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(fullUrl, { ...options, headers });
  };

  // exponential backoff retry สำหรับ 429
  let response: Response;
  const maxRetries = 3;
  let attempt = 0;
  while (true) {
    response = await makeRequest();
    if (response.status !== 429) break;

    if (attempt >= maxRetries) {
      // เกินจำนวน retry ที่กำหนด ให้ throw error
      const retryText = await response.text();
      throw new Error(`API error 429: ${retryText}`);
    }

    // ถ้ามี Retry-After header ให้ใช้ค่านั้น มิเช่นนั้นใช้ exponential backoff
    const ra = response.headers.get('Retry-After');
    const delayMs = ra
      ? parseInt(ra, 10) * 1000
      : Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
    console.warn(`⚠️  429 received, retrying in ${delayMs}ms (attempt ${attempt + 1})`);
    await new Promise((r) => setTimeout(r, delayMs));
    attempt++;
  }

  // ถ้าเป็น 401 ให้ลอง refresh token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const { accessToken } = await authApi.refresh({ refreshToken });
        localStorage.setItem('accessToken', accessToken);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw new Error('Session expired, please login again.');
      }
      response = await makeRequest();
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}
