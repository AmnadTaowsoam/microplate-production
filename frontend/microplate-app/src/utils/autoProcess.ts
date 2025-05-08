// src/utils/autoProcess.ts
import { cobotApi, CobotStatus } from '@/utils/api/cobot';
import { cameraApi, ScanQrResponse } from '@/utils/api/camera';
import { predictorApi } from '@/utils/api/predictor';

let _running = false;

export function stopAutoProcess() {
  _running = false;
}

async function execCommand(
  action: 'MOVE' | 'PICK' | 'PLACE',
  target: { x: number; y: number; z: number }
) {
  switch (action) {
    case 'MOVE':
      return cobotApi.move(target);
    case 'PICK':
      return cobotApi.pick(target);
    case 'PLACE':
      return cobotApi.place(target);
    default:
      throw new Error(`Unknown command ${action}`);
  }
}

export async function startAutoProcess(
  onQrScanned: (code: string) => void,
  onPredicted: (result: any) => void,
) {
  _running = true;

  while (_running) {
    try {
      // 1. รอให้ Cobot เข้าสู่สถานะ IDLE
      let status: CobotStatus;
      do {
        status = await cobotApi.getStatus();
        if (status.status !== 'IDLE') {
          await new Promise(r => setTimeout(r, 1000));
        }
      } while (_running && status.status !== 'IDLE');
      if (!_running) break;

      // 2–5: MOVE, PICK, MOVE, MOVE
      await execCommand('MOVE', { x: 100, y: 200, z: 150 });
      await execCommand('PICK', { x: 50,  y: 150, z: 150 });
      await execCommand('MOVE', { x: 50,  y: 200, z: 150 });
      await execCommand('MOVE', { x: 150, y: 200, z: 150 });

      // 6. สแกน QR
      const scanRes: ScanQrResponse = await cameraApi.scanQr();
      let qrCode = '';
      if (scanRes.codes.length > 0) {
        qrCode = scanRes.codes[0].data;
        onQrScanned(qrCode);
      } else {
        console.warn('QR not found');
      }

      // 7–11: MOVE, PLACE, MOVE, PICK, MOVE
      await execCommand('MOVE',  { x: 300, y: 200, z: 150 });
      await execCommand('PLACE', { x: 300, y:  20, z: 150 });
      await execCommand('MOVE',  { x: 100, y: 200, z: 150 });
      await execCommand('PICK',  { x:  50, y: 150, z: 150 });
      await execCommand('MOVE',  { x:  50, y: 200, z: 150 });

      // 12. ส่งให้ Predictor (สมมติรองรับ imageUrl)
      const predResult = await predictorApi.predict({ imageUrl: scanRes.imageUrl });
      onPredicted(predResult);

      // 13–15: MOVE, PLACE, MOVE
      await execCommand('MOVE',  { x: 300, y: 200, z: 150 });
      await execCommand('PLACE', { x: 300, y:  20, z: 150 });
      await execCommand('MOVE',  { x: 100, y: 200, z: 150 });

      // พักก่อนลูปใหม่
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error('AutoProcess error:', err);
      _running = false;
    }
  }
}
