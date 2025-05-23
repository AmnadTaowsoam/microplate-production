# app/services/dobot.py
import socket
import time
import json
import re
import threading
import logging
from app.config import Config

logger = logging.getLogger("cobot-service.dobot")

class DobotMG400:
    def __init__(self, ip=None, dash_port=None, motion_port=None, timeout=None):
        self.sim = Config.SIMULATION
        self._lock = threading.Lock()
        if not self.sim:
            self.ip        = ip or Config.ROBOT_IP
            dash_p         = dash_port   or Config.DASH_PORT
            motion_p       = motion_port or Config.MOTION_PORT
            to             = timeout     or Config.ROBOT_TIMEOUT
            self.dash      = socket.create_connection((self.ip, dash_p),   timeout=to)
            self.motion    = socket.create_connection((self.ip, motion_p), timeout=to)
            for s in (self.dash, self.motion):
                s.settimeout(to)
            logger.info(f"Connected to Dobot at {self.ip} (dash:{dash_p}, motion:{motion_p})")
        else:
            logger.info("🔧 SIMULATION mode – no real socket")

    def _send(self, sock: socket.socket, cmd: str) -> str:
        """
        ส่งคำสั่ง ASCII แล้วอ่านข้อความจนเจอ ';'
        """
        sock.sendall(cmd.encode('ascii'))
        buf = bytearray()
        while True:
            chunk = sock.recv(1024)
            if not chunk:
                break
            buf.extend(chunk)
            if b';' in chunk:
                break
        return buf.decode('ascii')

    # ── Basic control commands ─────────────────────────────────────────
    def reset(self)       -> str: return self._send(self.dash,   "ResetRobot()")
    def clear_error(self) -> str: return self._send(self.dash,   "ClearError()")
    def continue_(self)   -> str: return self._send(self.dash,   "Continue()")
    def enable(self)      -> str: return self._send(self.dash,   "EnableRobot()")
    def disable(self)     -> str: return self._send(self.dash,   "DisableRobot()")

    # ── Status and waiting ────────────────────────────────────────────
    def robot_mode(self) -> int:
        # ในโหมด simulation ให้ถือว่า Idle เสมอ
        if self.sim:
            return 5
        resp = self._send(self.dash, "RobotMode()")
        nums = re.findall(r'-?\d+', resp)
        return int(nums[1]) if len(nums) > 1 else -1

    def wait_until_idle(self, timeout: float = None):
        """
        Poll RobotMode() จนกลับมาเป็น 5 (Idle) หรือครบ timeout
        ใน simulation จะข้ามการรอ
        """
        if self.sim:
            return

        td = timeout or Config.ROBOT_TIMEOUT
        deadline = time.time() + td
        while time.time() < deadline:
            if self.robot_mode() == 5:
                return
            time.sleep(0.1)
        raise TimeoutError("Timeout waiting for robot to become idle")

    # ── Digital input ─────────────────────────────────────────────────
    def di_execute(self, index: int) -> int:
        """
        อ่านสถานะ DIExecute(index) คืน 0 หรือ 1
        """
        resp = self._send(self.dash, f"DIExecute({index})")
        nums = re.findall(r'\d+', resp)
        return int(nums[1]) if len(nums) >= 2 else -1

    # ── Queued IO commands ─────────────────────────────────────────────
    def do(self, index: int, status: int) -> str:
        cmd = f"DO({index},{status});"
        with self._lock:          # ป้องกัน race condition ใน dash socket
            return self._send(self.dash, cmd)

    def ensure_open(self) -> str:
        """DO(1,0) เปิดกริปเปอร์"""
        return self.do(1, 0)

    def close_grip(self) -> str:
        """สั่งจับกริปเปอร์"""
        # (ถ้าต่อกริปเปอร์ไว้ที่ช่อง n ก็ใช้ do(n,1))
        return self.do(1, 1)
    
    def release(self) -> str:
        """สั่งปล่อยกริปเปอร์"""
        return self.do(1, 0)   # OFF → ปล่อย


    # ── Motion commands ───────────────────────────────────────────────
    def movj(self, x, y, z, r,
             speedj: int = None, accj: int = None, cp: int = None) -> str:
        """
        MovJ(X,Y,Z,R[,SpeedJ,AccJ,CP])
        """
        args = [str(x), str(y), str(z), str(r)]
        if speedj is not None: args.append(f"SpeedJ={speedj}")
        if accj   is not None: args.append(f"AccJ={accj}")
        if cp     is not None: args.append(f"CP={cp}")
        return self._send(self.motion, f"MovJ({','.join(args)})")

    # ── Load points ──────────────────────────────────────────────────
    @staticmethod
    def load_points(path: str) -> dict:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return {pt['name']: tuple(pt['coordinate'][:4]) for pt in data}

    # ── Close connections ────────────────────────────────────────────
    def close(self):
        if not self.sim:
            for s in (self.dash, self.motion):
                try:
                    s.close()
                except:
                    pass
            logger.info("Dobot connections closed")
        else:
            logger.info("[SIM] Closed simulated connections")