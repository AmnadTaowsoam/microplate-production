// src/utils/api/labware.ts
import { fetcher } from '../../utils/fetcher';

export interface LabwareLogin {
  accessToken: string;
  expiresIn: number;
}
export interface LabwareStatus {
  plateId: string;
  interfaceStatus: string;
  timestamp: string;
}

export const labwareApi = {
  login: (username: string, password: string) =>
    fetcher<LabwareLogin>('/labware/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  sendResults: (token: string, plateId: string, data: any[]) =>
    fetcher<{ status: string }>('/labware/results', {
      method: 'POST',
      body: JSON.stringify({ token, plateId, data }),
    }),
  getInterfaceStatus: () =>
    fetcher<LabwareStatus>('/labware/interface-status'),
  // สำหรับ SSE ใช้ EventSource ใน component โดยตรง
};
