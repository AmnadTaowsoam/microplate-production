# app/services/scan_qr_service.py

from pypylon import pylon
from pyzbar.pyzbar import decode
import cv2

def scan_qr(cam, conv, timeout_ms: int = 2000) -> dict:
    """
    สแกน QR/Barcode จากกล้องที่เปิดไว้ครั้งเดียว:
    - cam:      pylon.InstantCamera (Grabbing อยู่แล้ว)
    - conv:     pylon.ImageFormatConverter
    - timeout_ms: รอเฟรม (ms)
    คืน {"codes": […]} หรือ [] ถ้าไม่เจอ
    """
    # รอดึงเฟรมเดียว
    grab = cam.RetrieveResult(timeout_ms, pylon.TimeoutHandling_ThrowException)
    if not grab.GrabSucceeded():
        grab.Release()
        return {"codes": []}

    # แปลงเป็น numpy
    img = conv.Convert(grab).GetArray()
    grab.Release()

    # แปลงเป็นขาว-ดำ ช่วยให้ decode เร็วและแม่นขึ้น
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # สแกนโค้ด
    raw = decode(gray)
    if not raw:
        return {"codes": []}

    return {
        "codes": [
            {"type": c.type, "data": c.data.decode("utf-8")}
            for c in raw
        ]
    }
