## app.config.py
from dotenv import load_dotenv
import os
from pathlib import Path

# หาโฟลเดอร์โปรเจกต์ (สองระดับเหนือไฟล์นี้)
base_dir = Path(__file__).resolve().parents[3]

# โหลดค่าจาก .env.common (ถ้ามี)
common_env = base_dir / ".env.comon"
if common_env.exists():
    load_dotenv(dotenv_path=str(common_env))
    print(f"Loaded common env: {common_env}")

# โหลดค่าจาก .env.cobot ในโฟลเดอร์ cobot-service (ถ้ามี)
cobot_env = Path(__file__).resolve().parents[1] / ".env.cobot"
if cobot_env.exists():
    load_dotenv(dotenv_path=str(cobot_env), override=True)
    print(f"Loaded cobot env: {cobot_env}")

class Config:
    # CORS (ตัวอย่าง)
    CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "*").split(",")
    CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    CORS_ALLOW_METHODS = os.getenv("CORS_ALLOW_METHODS", "*").split(",")
    CORS_ALLOW_HEADERS = os.getenv("CORS_ALLOW_HEADERS", "*").split(",")

    # JWT / Auth
    API_KEY         = os.getenv("API_KEY", "")
    JWT_SECRET_KEY  = os.getenv("JWT_SECRET_KEY", "")
    ALGORITHM       = os.getenv("ALGORITHM", "HS256")
    TOKEN_EXPIRE_M  = int(os.getenv("TOKEN_EXPIRATION_MINUTES", "1440"))

    # Logging / Timeouts
    LOG_LEVEL           = os.getenv("LOG_LEVEL", "INFO")
    CONNECTION_TIMEOUT  = int(os.getenv("CONNECTION_TIMEOUT", "10"))
    READ_TIMEOUT        = int(os.getenv("READ_TIMEOUT", "30"))

    # **Cobot settings** – อ่าน env แล้วแปลงให้เป็นชนิดที่ถูกต้อง
    ROBOT_IP       = os.getenv("ROBOT_IP", "192.168.1.6")
    DASH_PORT      = int(os.getenv("DASH_PORT", "29999"))
    MOTION_PORT    = int(os.getenv("MOTION_PORT", "30003"))
    ROBOT_TIMEOUT  = float(os.getenv("TIMEOUT", "60.0"))
    POINT_JSON_PATH = os.getenv("POINT_JSON_PATH", "./app/point.json")

    # Simulation mode
    SIMULATION = os.getenv("SIMULATION", "false").lower() == "true"

    # FastAPI
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "3102"))

    print(f"Loaded Cobot config → IP={ROBOT_IP}  DASH={DASH_PORT}  MOTION={MOTION_PORT}  SIM={SIMULATION}")
