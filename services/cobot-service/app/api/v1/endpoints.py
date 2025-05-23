# app/api/v1/endpoints.py
import logging
from fastapi import APIRouter, Depends, HTTPException, Path, Request
from fastapi.concurrency import run_in_threadpool
from jose import jwt, JWTError

from app.config import Config
from app.services.dobot import DobotMG400
from app.models.schemas import MoveRequest, GripRequest, RobotStatus
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger("cobot-service.api")

# JWT bearer
gbearer = HTTPBearer()

def verify_token(creds: HTTPAuthorizationCredentials = Depends(gbearer)):
    token = creds.credentials
    try:
        jwt.decode(
            token,
            Config.JWT_SECRET_KEY,
            algorithms=[Config.ALGORITHM],
            options={"verify_aud": False}
        )
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
    return True

router = APIRouter(
    prefix="/cobot",
    dependencies=[Depends(verify_token)],
    tags=["cobot"]
)


def get_robot(request: Request):
    """Retrieve the Dobot client and points from app.state via Request"""
    return request.app.state.robot, request.app.state.points

# ——— Basic control endpoints ——————————————————————————————

@router.post("/reset", response_model=RobotStatus, summary="Reset & clear errors")
async def endpoint_reset(robot_data=Depends(get_robot)):
    robot, _ = robot_data
    try:
        resp1 = await run_in_threadpool(robot.reset)
        resp2 = await run_in_threadpool(robot.clear_error)
        resp3 = await run_in_threadpool(robot.continue_)
        mode  = await run_in_threadpool(robot.robot_mode)
        return RobotStatus(mode=mode, last_response=resp1 + resp2 + resp3)
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail=f"Timeout: {e}")

@router.post("/enable", response_model=RobotStatus, summary="Enable robot motors")
async def endpoint_enable(robot_data=Depends(get_robot)):
    robot, _ = robot_data
    try:
        resp = await run_in_threadpool(robot.enable)
        mode = await run_in_threadpool(robot.robot_mode)
        return RobotStatus(mode=mode, last_response=resp)
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail=f"Timeout: {e}")

@router.post("/disable", response_model=RobotStatus, summary="Disable robot motors")
async def endpoint_disable(robot_data=Depends(get_robot)):
    robot, _ = robot_data
    resp = await run_in_threadpool(robot.disable)
    return RobotStatus(mode=-1, last_response=resp)

# ——— Motion & Grip ——————————————————————————————

@router.post("/move", response_model=RobotStatus)
async def move_point(req: MoveRequest, robot_data=Depends(get_robot)):
    robot, pts = robot_data
    if req.point not in pts:
        raise HTTPException(404, "Point not found")
    x, y, z, r = pts[req.point]
    logger.info(f"[API] ▶️ move_point('{req.point}') coords=({x},{y},{z},{r}) …")
    cmd = await run_in_threadpool(robot.movj, x, y, z, r,
                                  speedj=req.speedj, accj=req.accj)
    logger.info(f"[API] ⬅️ movj sent → {cmd}")
    # จับ TimeoutError ไม่ให้หลุดไปเป็น 500
    try:
        await run_in_threadpool(robot.wait_until_idle)
    except TimeoutError as e:
        logger.warning(f"[API] robot.wait_until_idle timed out: {e}")
        # ถ้าจะถือว่ายัง OK ให้ไปอ่าน mode ปัจจุบันต่อ
    mode = await run_in_threadpool(robot.robot_mode)
    logger.info(f"[API] ✅ robot_mode after movj: {mode}")

    return RobotStatus(mode=mode, last_response=cmd)

@router.post("/grip", response_model=RobotStatus)
async def grip(req: GripRequest, robot_data=Depends(get_robot)):
    robot, _ = robot_data
    # แค่สั่ง DO ปิดหรือเปิดกริปเปอร์
    fn   = robot.close_grip if req.action=='close' else robot.release
    resp = await run_in_threadpool(fn)
    mode = await run_in_threadpool(robot.robot_mode)
    return RobotStatus(mode=mode, last_response=resp)

# ——— I/O & Status ——————————————————————————————

@router.get("/di/{index}", response_model=RobotStatus, summary="Read digital input")
async def read_di(
    index: int = Path(..., ge=0, le=7),
    robot_data=Depends(get_robot)
):
    robot, _ = robot_data
    val = await run_in_threadpool(robot.di_execute, index)
    return RobotStatus(mode=val, last_response=f"DI[{index}]={val};")

@router.get("/status", response_model=RobotStatus, summary="Get current robot mode")
async def status(robot_data=Depends(get_robot)):
    robot, _ = robot_data
    mode = await run_in_threadpool(robot.robot_mode)
    return RobotStatus(mode=mode, last_response="OK")