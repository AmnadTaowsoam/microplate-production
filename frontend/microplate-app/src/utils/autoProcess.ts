// src/utils/autoProcess.ts
import { cobotApi } from '@/utils/api/cobot';
import { cameraApi, ScanQrResponse } from '@/utils/api/camera';
import { predictorApi } from '@/utils/api/predictor';

let _running = false;
let _paused = false;
let _controller: AbortController | null = null;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * หยุดการทำงานอัตโนมัติทั้งหมด
 */
export function stopAutoProcess() {
  _running = false;
  _paused = false;
  if (_controller) {
    _controller.abort();
    _controller = null;
  }
}

/**
 * หยุดชั่วคราว แบบ pause/resume
 */
export function pauseAutoProcess() {
  if (_running) _paused = true;
}

/**
 * กลับมาทำงานต่อหลัง pause
 */
export function resumeAutoProcess() {
  if (_running) _paused = false;
}

/**
 * รอจน resume (ถ้า paused)
 */
async function waitIfPaused() {
  while (_paused && _running) {
    await delay(50);
  }
}

// mapping สำหรับ speed & accj แต่ละจุด (และ delay หลังเรียก)
const pointConfig: Record<string, { speedj: number; accj: number; postDelay: number }> = {
  P1: { speedj: 20, accj: 20, postDelay: 2000 },
  P2: { speedj: 20, accj: 20, postDelay: 2000 },
  P3: { speedj: 10, accj: 10, postDelay: 2000 }, // slower for pick
  P4: { speedj: 10, accj: 10, postDelay: 2000},
  P5: { speedj: 10, accj: 10, postDelay: 2000 },
  P7: { speedj: 20, accj: 20, postDelay: 2000 },
  P8: { speedj: 20, accj: 20, postDelay: 2000 },
  P9: { speedj: 20, accj: 20, postDelay: 2000 },
  P10: { speedj: 20, accj: 20, postDelay: 2000 },
  P11: { speedj: 20, accj: 20, postDelay: 2000 },
};

/**
 * เรียก cobotApi.move ด้วย point, speedj, accj ตาม config
 */
async function movePoint(point: string) {
  console.log(`[Auto] ▶️ Request movePoint('${point}')`);
  if (!_running) throw new Error('Process stopped');
  await waitIfPaused();
  const cfg = pointConfig[point] || { speedj: 10, accj: 10, postDelay: 1000 };

  const t0 = performance.now();
  const res = await cobotApi.move({ point, speedj: cfg.speedj, accj: cfg.accj });
  const ms = (performance.now() - t0).toFixed(0);
  console.log(`[Auto] ⬅️ Response movePoint('${point}') in ${ms}ms →`, res);

  console.log(`[Auto] ⏱️ postDelay ${cfg.postDelay}ms for '${point}'`);
  await delay(cfg.postDelay);
  console.log(`[Auto] ✅ postDelay done for '${point}'`);

  return res;
}

/**
 * เรียก grip close/open
 */
async function grip(action: 'close' | 'open') {
  if (!_running) throw new Error('Process stopped');
  await waitIfPaused();
  return cobotApi.grip({ action });
}

/**
 * รันชุดคำสั่ง auto process
 * @param cycles จำนวนรอบที่จะวน (default 10)
 * @param pickPoints ชื่อจุดสำหรับขั้นตอน pick แยกตามรอบ
 */
export async function startAutoProcess(
  onQrScanned: (code: string) => void,
  onImageCaptured: (url: string) => void,
  onPredicted: (result: any) => void,
  cycles = 2,
  pickPoints: string[] = []
) {
  _running = true;
  _paused = false;

  for (let i = 0; i < cycles && _running; i++) {
    try {
      // 1) P1 → P2 → dynamic P3
      await movePoint('P1');
      await movePoint('P2');
      const pickPoint = pickPoints[i] ?? 'P3';
      await movePoint(pickPoint);

      // 2) จับชิ้นงาน
      await grip('close');

      // 3) P4 → P5 → P6 
      await movePoint('P4');
      await movePoint('P5');
      await movePoint('P6');

      // 4) สแกน QR code (หลัง P6 จบแล้ว)
      if (!_running) break;
      await waitIfPaused();
      _controller = new AbortController();
      let scanRes: ScanQrResponse;
      try {
        scanRes = await Promise.race([
          cameraApi.scanQr({ trigger: true }),
          new Promise<never>((_, reject) => _controller!.signal.addEventListener('abort', () => reject(new Error('Scan aborted'))))
        ]);
      } catch (e) {
        console.warn('QR scan aborted or error, retrying...', e);
        _controller = null;
        i--; await delay(1000);
        continue;
      }
      _controller = null;
      const code = scanRes.codes[0]?.data ?? '';
      onQrScanned(code);

      // 5) ถ่ายภาพ (หลังสแกนเสร็จแล้ว)
      if (!_running) break;
      await waitIfPaused();
      _controller = new AbortController();
      let capRes;
      try {
        capRes = await Promise.race([
          cameraApi.capture({ trigger: true }),
          new Promise<never>((_, reject) => _controller!.signal.addEventListener('abort', () => reject(new Error('Capture aborted'))))
        ]);
      } catch (e) {
        console.warn('Capture aborted or error, retrying...', e);
        _controller = null;
        i--; await delay(1000);
        continue;
      }
      _controller = null;
      onImageCaptured(capRes.imageUrl);

      // 6) Predict (หลัง capture)
      if (!_running) break;
      await waitIfPaused();
      try {
        const resp = await fetch(capRes.imageUrl);
        const blob = await resp.blob();
        const file = new File([blob], `${code || 'image'}.jpg`, { type: blob.type });
        const result = await predictorApi.predict(file, code);
        onPredicted(result);
      } catch (e) {
        console.error('Predict error', e);
      }

      // 7) P7 → P8 → P9
      await movePoint('P7');
      await movePoint('P8');
      await movePoint('P9');

      // 8) ปล่อยชิ้นงาน
      await grip('open');

      // 9) P10 …
      await movePoint('P10');
    } catch (err) {
      console.error('AutoProcess fatal error:', err);
      break;
    }
  }

  // cleanup
  _running = false;
  _paused = false;
  if (_controller) {
    _controller.abort();
    _controller = null;
  }
}