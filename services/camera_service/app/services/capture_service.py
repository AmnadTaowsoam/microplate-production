# app/services/capture_service.py

from pypylon import pylon
import cv2, io
from fastapi.responses import StreamingResponse

def capture_image_stream(cam, conv) -> StreamingResponse:
    """
    ดึงภาพล่าสุดจากกล้องและ converter ที่เปิดไว้ใน app.state
    คืนเป็น StreamingResponse (media_type='image/jpeg')
    """
    # ดึง frame ล่าสุด (timeout 0 = non-blocking)
    grab = cam.RetrieveResult(0, pylon.TimeoutHandling_Return)
    if not grab.GrabSucceeded():
        grab.Release()
        raise RuntimeError("Failed to grab image")

    img = conv.Convert(grab).GetArray()
    grab.Release()

    success, buf = cv2.imencode('.jpg', img)
    if not success:
        raise RuntimeError("Failed to encode image")

    return StreamingResponse(
        io.BytesIO(buf.tobytes()),
        media_type="image/jpeg"
    )
