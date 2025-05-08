// src/utils/autoProcess.ts
import { cobotApi, CobotStatus } from '@/utils/api/cobot';
import { cameraApi, ScanQrResponse } from '@/utils/api/camera';
import { predictorApi } from '@/utils/api/predictor';

let _running = false;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export function stopAutoProcess() {
  _running = false;
}

async function execCommand(
  action: 'MOVE' | 'PICK' | 'PLACE',
  target: { x: number; y: number; z: number }
) {
  switch (action) {
    case 'MOVE': return cobotApi.move(target);
    case 'PICK': return cobotApi.pick(target);
    case 'PLACE': return cobotApi.place(target);
    default: throw new Error(`Unknown command ${action}`);
  }
}

/**
 * Auto Process: continuous flow without manual continue.
 * 1. Move & pick to scan position
 * 2. Capture image and display
 * 3. Scan QR code, get code
 * 4. Predict from captured image, display
 * 5. Execute follow-up Cobot commands
 */
export async function startAutoProcess(
  onQrScanned: (code: string) => void,
  onImageCaptured: (url: string) => void,
  onPredicted: (result: any) => void,
) {
  _running = true;
  let firstRun = true;

  while (_running) {
    try {
      // Wait IDLE except first run
      if (!firstRun) {
        let status: CobotStatus;
        do {
          try { status = await cobotApi.getStatus(); }
          catch (e: any) { console.warn('Status error', e); await delay(2000); continue; }
          if (status.status !== 'IDLE') await delay(2000);
        } while (_running && status.status !== 'IDLE');
        if (!_running) break;
      } else firstRun = false;

      // 1. Move & Pick to scan location
      await execCommand('MOVE',  { x:100, y:200, z:150 });
      await execCommand('PICK',  { x:50,  y:150, z:150 });
      await execCommand('MOVE',  { x:50,  y:200, z:150 });
      await execCommand('MOVE',  { x:150, y:200, z:150 });

      // 2. Capture image via camera API
      let captureRes;
      try {
        captureRes = await cameraApi.capture();
      } catch (e: any) {
        console.warn('Capture error, retrying', e);
        await delay(2000);
        continue;
      }
      const imgUrl = captureRes.imageUrl;
      onImageCaptured(imgUrl);
      // small delay to ensure UI render
      await delay(2000);

      // 3. Scan QR code via API
      let scanRes: ScanQrResponse;
      try {
        scanRes = await cameraApi.scanQr();
      } catch (e: any) {
        console.warn('QR scan error, retrying', e);
        await delay(2000);
        continue;
      }
      const code = scanRes.codes[0]?.data ?? '';
      onQrScanned(code);
      await delay(1000);

      // 4. Predict using captured image
      try {
        const response = await fetch(imgUrl);
        const blob = await response.blob();
        const file = new File([blob], `${code||'image'}.jpg`, { type: blob.type });
        const result = await predictorApi.predict(file, code);
        onPredicted(result);
      } catch (e) {
        console.error('Predict error', e);
      }
      await delay(2000);

      // 5. Follow-up Cobot moves
      await execCommand('PLACE', { x:300, y:20,  z:150 });
      await execCommand('MOVE',  { x:100, y:200, z:150 });
      await execCommand('PICK',  { x:50,  y:150, z:150 });
      await execCommand('MOVE',  { x:50,  y:200, z:150 });
      await execCommand('PLACE', { x:300, y:20,  z:150 });
      await execCommand('MOVE',  { x:100, y:200, z:150 });

    } catch (err) {
      console.error('AutoProcess fatal error', err);
      _running = false;
    }
    // Delay before next cycle
    await delay(2000);
  }
}
