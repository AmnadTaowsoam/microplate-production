// src/utils/fetcher.ts
import { authApi } from './api/auth';

/**
 * fetcher with automatic token refresh on 401 and simple retry on 429
 */
export async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('❌ NEXT_PUBLIC_API_BASE_URL is not defined');
  }

  const fullUrl = `${baseUrl}${url}`;
  console.log('🔗 fetcher called:', fullUrl, options);

  const makeRequest = async (): Promise<Response> => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🛡️ Attaching token to headers');
    }

    console.log('➡️  fetch:', fullUrl, { ...options, headers });
    const res = await fetch(fullUrl, { ...options, headers });
    console.log('⬅️  response status:', res.status);
    return res;
  };

  let response = await makeRequest();

  // simple retry on 429
  if (response.status === 429) {
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : 1000;
    console.warn(`⚠️  Rate limited, retrying after ${retryAfter}ms`);
    await new Promise((r) => setTimeout(r, retryAfter));
    response = await makeRequest();
  }

  // try refresh on 401
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      console.warn('⚠️  Unauthorized, attempting token refresh');
      try {
        const { accessToken } = await authApi.refresh({ refreshToken });
        console.log('🔄  Got new access token');
        localStorage.setItem('accessToken', accessToken);
      } catch (err) {
        console.error('❌  Refresh failed, forcing logout', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/api/v1/auth/login';
        throw new Error('Session expired, please login again.');
      }
      response = await makeRequest();
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API error', response.status, errorText);
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  console.log('✅ fetcher returning JSON');
  return response.json();
}
