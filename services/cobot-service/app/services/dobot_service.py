# app/services/dobot_service.py
from app.config import Config

# เลือกใช้ Mock หรือของจริงตาม SIMULATION flag
if Config.SIMULATION:
    from app.services.mock_dobot_service import MockDobot as Dobot
else:
    from pydobot import Dobot

import threading
import logging
from datetime import datetime
from typing import Literal

logger = logging.getLogger("cobot-service")

class SingletonMeta(type):
    """Thread-safe implementation of Singleton."""
    _instances = {}
    _lock: threading.Lock = threading.Lock()

    def __call__(cls, *args, **kwargs):
        with cls._lock:
            if cls not in cls._instances:
                cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class CobotService(metaclass=SingletonMeta):
    """
    Service จัดการ connection และคำสั่งไปยัง Dobot MG400.
    """
    def __init__(self,
                 port: str = Config.DOBOT_PORT,
                 baudrate: int = Config.DOBOT_BAUDRATE):
        self._status: Literal["IDLE", "MOVING", "PICKED", "SCANNING", "PLACED", "ERROR"] = "IDLE"
        self._last_updated: datetime = datetime.utcnow()
        try:
            logger.info(f"Connecting to Dobot on {port}@{baudrate}")
            # pydobot.Dobot เชื่อมต่อใน constructor
            self._robot = Dobot(port, baudrate)
            logger.info("Dobot connected")
        except Exception:
            self._status = "ERROR"
            logger.exception("Failed to connect to Dobot")
            raise

    def get_status(self) -> dict:
        """
        คืนสถานะปัจจุบันพร้อม timestamp
        """
        return {
            "status": self._status,
            "updatedAt": self._last_updated.isoformat() + "Z"
        }

    def move_to(self, x: float, y: float, z: float, speed: float = 100) -> None:
        """
        สั่งให้ Cobot เคลื่อนที่ไปยัง (x, y, z) ด้วยความเร็ว speed
        """
        logger.debug(f"Request move_to(x={x}, y={y}, z={z}, speed={speed})")
        try:
            self._status = "MOVING"
            self._robot.move_to(x, y, z, speed)
            self._robot.wait_until_idle()
            self._status = "IDLE"
            logger.info(f"Moved to ({x}, {y}, {z})")
        except Exception:
            self._status = "ERROR"
            logger.exception("Error during move_to")
            raise
        finally:
            self._last_updated = datetime.utcnow()

    def pick(self, x: float, y: float, z: float) -> None:
        """
        สั่งให้ Cobot ยกชิ้นงานที่ตำแหน่ง (x, y, z)
        """
        logger.debug(f"Picking at ({x}, {y}, {z})")
        try:
            self._status = "PICKED"
            self._robot.move_to(x, y, z, speed=Config.DOBOT_BAUDRATE)
            self._robot.gripper_close()
            logger.info(f"Picked at ({x}, {y}, {z})")
        except Exception:
            self._status = "ERROR"
            logger.exception("Error during pick")
            raise
        finally:
            self._last_updated = datetime.utcnow()

    def place(self, x: float, y: float, z: float) -> None:
        """
        สั่งให้ Cobot วางชิ้นงานที่ตำแหน่ง (x, y, z)
        """
        logger.debug(f"Placing at ({x}, {y}, {z})")
        try:
            self._status = "PLACED"
            self._robot.move_to(x, y, z, speed=Config.DOBOT_BAUDRATE)
            self._robot.gripper_open()
            logger.info(f"Placed at ({x}, {y}, {z})")
        except Exception:
            self._status = "ERROR"
            logger.exception("Error during place")
            raise
        finally:
            self._last_updated = datetime.utcnow()

    def scan(self) -> None:
        """
        สั่งให้ Cobot ทำการสแกน (placeholder)
        """
        logger.debug("Starting scan operation")
        try:
            self._status = "SCANNING"
            # ถ้ามี method จริง ให้เรียก เช่น:
            # self._robot.start_scan()
            # otherwise, placeholder delay:
            # time.sleep(1)
            self._status = "IDLE"
            logger.info("Scan complete")
        except Exception:
            self._status = "ERROR"
            logger.exception("Error during scan")
            raise
        finally:
            self._last_updated = datetime.utcnow()
