// src/utils/api/cobot.ts
import { fetcher } from '../fetcher';

export interface CobotStatus {
  status: 'IDLE'|'MOVING'|'PICKED'|'SCANNING'|'PLACED'|'ERROR';
  updatedAt: string;
}

export const cobotApi = {
  // GET /api/v1/cobot/status
  getStatus: () => fetcher<CobotStatus>('/cobot/status'),

  move: (target: { x: number; y: number; z: number }) =>
    fetcher('/cobot/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(target),
    }),

  pick: (target: { x: number; y: number; z: number }) =>
    fetcher('/cobot/pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(target),
    }),

  place: (target: { x: number; y: number; z: number }) =>
    fetcher('/cobot/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(target),
    }),
};
