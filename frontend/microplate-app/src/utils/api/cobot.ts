// src/utils/api/cobot.ts
import { fetcher } from '../../utils/fetcher';

export interface CobotStatus {
  status: 'IDLE' | 'MOVING' | 'PICKED' | 'SCANNING' | 'PLACED' | 'ERROR';
  updatedAt: string;
}

export const cobotApi = {
  getStatus: () => fetcher<CobotStatus>('/cobot/status'),
};
