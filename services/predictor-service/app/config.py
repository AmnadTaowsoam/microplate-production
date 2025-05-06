# utils/config.py
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

# 3. โหลดค่าจาก .env.predictor ในโฟลเดอร์ predictor-service
predictor_env = Path(__file__).resolve().parents[1] / ".env.predictor"
if predictor_env.exists():
    # override ค่าเดิมถ้ามีซ้ำกัน
    load_dotenv(dotenv_path=predictor_env, override=True)
    print(f"Loaded predictor env: {predictor_env}")

class Config:
    # Database Config
    DB_NAME: str = os.getenv("DB_NAME", "")
    DB_USERNAME: str = os.getenv("DB_USER", "")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_HOST: str = os.getenv("DB_HOST", "host.docker.internal")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    
    # Full Database URL
    FULL_DATABASE_URL: str = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
   
    # CORS Settings
    CORS_ALLOWED_ORIGINS: list = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    CORS_ALLOW_CREDENTIALS: bool = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    CORS_ALLOW_METHODS: list = os.getenv("CORS_ALLOW_METHODS", "GET,POST,PUT,DELETE").split(",")
    CORS_ALLOW_HEADERS: list = os.getenv("CORS_ALLOW_HEADERS", "Authorization,Content-Type,Accept").split(",")
    
    # API Key and Secrets
    API_KEY: str = os.getenv("API_KEY", "default_api_key")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    
    # Logging and Timeouts
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "DEBUG")
    CONNECTION_TIMEOUT: int = int(os.getenv("CONNECTION_TIMEOUT", "10"))
    READ_TIMEOUT: int = int(os.getenv("READ_TIMEOUT", "30"))
    TOKEN_EXPIRE_MINUTES: int = int(os.getenv("TOKEN_EXPIRE_MINUTES", "30"))

    MODEL_VERSION : str = os.getenv("MODEL_VERSION", "0.0")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/tmp")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "")
    PORT: int = int(os.getenv("PORT", "3104"))
