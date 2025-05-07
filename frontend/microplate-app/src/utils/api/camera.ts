// src/utils/api/camera.ts

import { fetcher } from '../../utils/fetcher';

export interface ScanQrResponse {
  imageUrl: string;
  codes: string[];
}

export const cameraApi = {
  getStatus: () => fetcher<{ status: string }>('/camera/status'),
  scanQr: (): Promise<ScanQrResponse> => {
    console.log('👉 cameraApi.scanQr()');
    return fetcher<ScanQrResponse>('/camera/scan-qr', {
      method: 'POST',
      body: JSON.stringify({ trigger: true }),
    });
  },
  capture: () =>
    fetcher<{ imageUrl: string }>('/camera/capture', {
      method: 'POST',
      body: JSON.stringify({ trigger: true }),
    }),
};



