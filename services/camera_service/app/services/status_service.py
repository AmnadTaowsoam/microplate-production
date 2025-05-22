# app/services/status_service.py

from pypylon import pylon

def get_status() -> dict:
    """
    ตรวจสอบสถานะของบริการและการเชื่อมต่อกล้อง Basler
    คืนค่า dict:
      - server: "running"
      - cameras: รายการชื่อกล้องที่เชื่อมต่อ หรือ [] ถ้าไม่มี
    """
    try:
        tl_factory = pylon.TlFactory.GetInstance()
        devices = tl_factory.EnumerateDevices()
        camera_list = [dev.GetFriendlyName() for dev in devices]
    except Exception as e:
        # ถ้าไม่สามารถดึงรายชื่อกล้องได้ ให้คืนค่าพร้อม error
        return {"server": "running", "cameras": [], "error": str(e)}
    return {"server": "running", "cameras": camera_list}

def get_status():
    return "OK"