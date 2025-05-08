# app/services/mock_dobot_service.py
import logging
import time
from datetime import datetime
from typing import Literal

logger = logging.getLogger("cobot-service")

class MockDobot:
    """
    Mock Dobot สำหรับ simulation mode
    """
    def __init__(self, port: str, baudrate: int):
        logger.info(f"[SIM] Connecting to Mock Dobot on {port}@{baudrate}")
        self._status: Literal["IDLE","MOVING","PICKED","SCANNING","PLACED","ERROR"] = "IDLE"
        self._last_updated: datetime = datetime.utcnow()

    def move_to(self, x: float, y: float, z: float, speed: float = 100) -> None:
        logger.info(f"[SIM] move_to(x={x}, y={y}, z={z}, speed={speed})")
        self._status = "MOVING"
        time.sleep(0.5)
        self._status = "IDLE"
        self._last_updated = datetime.utcnow()

    def wait_until_idle(self) -> None:
        logger.info("[SIM] wait_until_idle()")
        return

    def gripper_open(self) -> None:
        logger.info("[SIM] gripper_open()")

    def gripper_close(self) -> None:
        logger.info("[SIM] gripper_close()")
