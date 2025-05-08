# app/api/v1/endpoints.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from datetime import datetime
from app.services.dobot_service import CobotService
from app.config import Config

router = APIRouter(tags=["cobot"])

# กำหนด Enum ของสถานะ
StatusEnum = Literal["IDLE", "MOVING", "PICKED", "SCANNING", "PLACED", "ERROR"]

class StatusResponse(BaseModel):
    status: StatusEnum
    updatedAt: datetime

class MovePayload(BaseModel):
    x: float
    y: float
    z: float

@router.get("/status",response_model=StatusResponse,summary="Get current Cobot status")
async def get_status():
    """
    Returns the current status of the Dobot MG400 cobot.
    """
    svc = CobotService(Config.DOBOT_PORT, Config.DOBOT_BAUDRATE)
    return svc.get_status()

@router.post("/move",response_model=StatusResponse,summary="Move cobot to specified coordinates")
async def move_cobot(payload: MovePayload):
    """
    Move the Cobot to the given x, y, z coordinates.
    """
    svc = CobotService(Config.DOBOT_PORT, Config.DOBOT_BAUDRATE)
    try:
        svc.move_to(payload.x, payload.y, payload.z)
        return svc.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pick",response_model=StatusResponse,summary="Pick an item at specified coordinates")
async def pick_cobot(payload: MovePayload):
    """
    Command the Cobot to pick up an item at x, y, z.
    """
    svc = CobotService(Config.DOBOT_PORT, Config.DOBOT_BAUDRATE)
    try:
        svc.pick(payload.x, payload.y, payload.z)
        return svc.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/place",response_model=StatusResponse,summary="Place an item at specified coordinates")
async def place_cobot(payload: MovePayload):
    """
    Command the Cobot to place the picked item at x, y, z.
    """
    svc = CobotService(Config.DOBOT_PORT, Config.DOBOT_BAUDRATE)
    try:
        svc.place(payload.x, payload.y, payload.z)
        return svc.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/scan",response_model=StatusResponse,summary="Trigger scanning phase")
async def scan_cobot():
    """
    Command the Cobot to perform a scanning operation.
    """
    svc = CobotService(Config.DOBOT_PORT, Config.DOBOT_BAUDRATE)
    try:
        # ถ้าต้องการให้ CobotService มี method scan() ก็เพิ่มใน service
        svc.scan()
        return svc.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

