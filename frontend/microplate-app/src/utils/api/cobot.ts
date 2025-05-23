// src/utils/api/cobot.ts
import { fetcher } from '../fetcher';

/**
 * ตาม schema ฝั่ง backend:
 *   RobotStatus: { mode: number; last_response: string }
 *   MoveRequest: { point: string; speedj?: number; accj?: number }
 *   GripRequest: { action: 'close' | 'release' }
 */
export interface RobotStatus {
  mode: number;
  last_response: string;
}

export interface MoveRequest {
  point: string;
  speedj?: number;
  accj?: number;
}

export interface GripRequest {
  action: 'close' | 'release';
}

export const cobotApi = {
  // GET /api/v1/cobot/status
  getStatus: (): Promise<RobotStatus> =>
    fetcher<RobotStatus>('/cobot/status'),

  // POST /api/v1/cobot/reset
  reset: (): Promise<RobotStatus> =>
    fetcher<RobotStatus>('/cobot/reset', {
      method: 'POST',
    }),

  // POST /api/v1/cobot/enable
  enable: (): Promise<RobotStatus> =>
    fetcher<RobotStatus>('/cobot/enable', {
      method: 'POST',
    }),

  // POST /api/v1/cobot/disable
  disable: (): Promise<RobotStatus> =>
    fetcher<RobotStatus>('/cobot/disable', {
      method: 'POST',
    }),

  // POST /api/v1/cobot/move
  move: (data: MoveRequest): Promise<RobotStatus> =>
    fetcher<RobotStatus>('/cobot/move', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /api/v1/cobot/grip
  grip: (data: GripRequest): Promise<RobotStatus> =>
    fetcher<RobotStatus>('/cobot/grip', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /api/v1/cobot/di/{index}
  readDI: (index: number): Promise<RobotStatus> =>
    fetcher<RobotStatus>(`/cobot/di/${index}`),
};
