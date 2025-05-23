// src/utils/fetcher.ts

export async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error('❌ NEXT_PUBLIC_API_BASE_URL is not defined');
  const fullUrl = `${baseUrl}${url}`;

  // ฟังก์ชันสำหรับส่ง request พร้อม access token ปัจจุบัน
  const makeRequest = async (): Promise<Response> => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(fullUrl, {
      ...options,
      headers,
    });
  };

  // ขั้นตอน retry แบบ exponential backoff สำหรับ 429
  let response: Response;
  const maxRetries = 3;
  let attempt = 0;
  while (true) {
    response = await makeRequest();
    if (response.status !== 429) break;

    if (attempt >= maxRetries) {
      const retryText = await response.text();
      throw new Error(`API error 429: ${retryText}`);
    }

    const ra = response.headers.get('Retry-After');
    const delayMs = ra
      ? parseInt(ra, 10) * 1000
      : Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
    console.warn(`⚠️  429 received, retrying in ${delayMs}ms (attempt ${attempt + 1})`);
    await new Promise((r) => setTimeout(r, delayMs));
    attempt++;
  }

  // ถ้าเจอ 401 ให้ลองเรียก refresh token ด้วย raw fetch
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // เรียก /auth/refresh โดยตรง ไม่ผ่าน fetcher
      const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json() as { accessToken: string };
        localStorage.setItem('accessToken', data.accessToken);
        // รีเทริน request เดิมอีกครั้ง
        response = await makeRequest();
      } else {
        // ถ้า refresh ไม่สำเร็จ ให้เคลียร์ token แล้ว redirect ไปหน้า login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        throw new Error('Session expired, please log in again.');
      }
    } else {
      // ไม่มี refresh token ให้ redirect ไปหน้า login
      window.location.href = '/auth/login';
      throw new Error('Not authenticated. Please log in.');
    }
  }

  // ถ้ายังไม่ ok ให้ throw error ออกไป
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}
