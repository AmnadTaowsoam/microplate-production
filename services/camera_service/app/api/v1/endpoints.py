# app/api/v1/endpoints.py

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt, JWTError

from app.services.status_service import get_status
from app.services.scan_qr_service    import scan_qr
from app.services.capture_service    import capture_image_stream
from app.config                       import Config

router = APIRouter(
    prefix="/api/v1",
    tags=["Camera"],
    dependencies=[Depends(lambda creds=Depends(HTTPBearer()): _verify_token(creds))]
)

class TriggerRequest(BaseModel):
    trigger: bool

def _verify_token(creds: HTTPAuthorizationCredentials):
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


@router.get("/status")
async def camera_status():
    """
    ตรวจสอบสถานะ server & กล้อง
    """
    return get_status()


@router.post("/scan-qr")
async def camera_scan_qr(request: Request, payload: TriggerRequest):
    """
    POST { "trigger": true }
    สแกน QR code ครั้งเดียว (timeout 2 000 ms)
    """
    if not payload.trigger:
        raise HTTPException(status_code=400, detail="trigger must be true")

    cam  = request.app.state.camera
    conv = request.app.state.converter

    result = scan_qr(cam, conv, timeout_ms=2000)
    if result is None:
        raise HTTPException(status_code=504, detail="QR scan timed out")
    return result


@router.post(
    "/capture",
    response_class=StreamingResponse,
)
async def camera_capture_stream(request: Request, payload: TriggerRequest):
    """
    POST { "trigger": true }
    ถ่ายภาพแล้วคืน JPEG stream
    """
    if not payload.trigger:
        raise HTTPException(status_code=400, detail="trigger must be true")

    cam  = request.app.state.camera
    conv = request.app.state.converter

    # capture_image_stream must return an iterator of raw JPEG bytes
    stream = capture_image_stream(cam, conv)
    return StreamingResponse(stream, media_type="image/jpeg")
