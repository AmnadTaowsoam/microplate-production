// src/utils/api/camera.ts

import { fetcher } from '../../utils/fetcher';
// src/utils/api/camera.ts
const API_GATEWAY = process.env.NEXT_PUBLIC_API_BASE_URL!;
export interface ScanQrResponse {
  imageUrl: string;
  codes: string[];
}

export const cameraApi = {
  getStatus: async (): Promise<{ status: string; updatedAt: string }> => {
    const status = await fetcher<string>('/camera/status');
    return {
      status,
      updatedAt: new Date().toISOString(),
    };
  },

  scanQr: (): Promise<ScanQrResponse> =>
    fetcher<ScanQrResponse>('/camera/scan-qr', {
      method: 'POST',
      body: JSON.stringify({ trigger: true }),
    }),

  capture: async (): Promise<{ imageUrl: string }> => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const response = await fetch(`${API_GATEWAY}/camera/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ trigger: true }),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Camera capture failed ${response.status}: ${message}`);
    }
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    return { imageUrl };
  },
};