## app/config.py
from dotenv import load_dotenv
import os
from pathlib import Path

# 1. หาโฟลเดอร์ services (สองระดับเหนือไฟล์นี้)
base_services = Path(__file__).resolve().parents[2]

# 2. โหลดค่าจาก .env.common
common_env = base_services / ".env.common"
if common_env.exists():
    load_dotenv(dotenv_path=common_env)
    print(f"Loaded common env: {common_env}")

# 3. โหลดค่าจาก .env.cobot ในโฟลเดอร์ cobot-service
predictor_env = Path(__file__).resolve().parents[1] / ".env.cobot"
if predictor_env.exists():
    # override ค่าเดิมถ้ามีซ้ำกัน
    load_dotenv(dotenv_path=predictor_env, override=True)
    print(f"Loaded cobot env: {predictor_env}")

class Config:
    # CORS Settings
    CORS_ALLOWED_ORIGINS: list = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    CORS_ALLOW_CREDENTIALS: bool = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    CORS_ALLOW_METHODS: list = os.getenv("CORS_ALLOW_METHODS", "GET,POST,PUT,DELETE").split(",")
    CORS_ALLOW_HEADERS: list = os.getenv("CORS_ALLOW_HEADERS", "Authorization,Content-Type,Accept").split(",")

    # API Key and Secrets
    API_KEY: str = os.getenv("API_KEY", "")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")

    # Token Expiration
    TOKEN_EXPIRATION_MINUTES: int = int(os.getenv("TOKEN_EXPIRATION_MINUTES", os.getenv("TOKEN_EXPIRE_MINUTES", "1440")))

    # Logging and Timeouts (อ้างอิงจาก .env.common)
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    CONNECTION_TIMEOUT: int = int(os.getenv("CONNECTION_TIMEOUT", "10"))
    READ_TIMEOUT: int = int(os.getenv("READ_TIMEOUT", "30"))

    # Cobot Service Specific
    DOBOT_PORT: str = os.getenv("DOBOT_PORT", "/dev/ttyUSB0")
    DOBOT_BAUDRATE: int = int(os.getenv("DOBOT_BAUDRATE", "115200"))
    PORT: int = int(os.getenv("PORT", "3102"))

    SIMULATION: bool = os.getenv("SIMULATION", "false").lower() == "true"
    print(f"SIMULATION MODE: {SIMULATION}")
