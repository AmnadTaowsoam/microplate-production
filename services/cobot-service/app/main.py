# /app/main.py

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import Config
from app.api.v1.endpoints import router as api_router

# ตั้งค่าการล็อกตาม LOG_LEVEL ใน .env.common
logging.basicConfig(
    level=Config.LOG_LEVEL.upper(),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s"
)
logger = logging.getLogger("cobot-service")

# สร้างแอป
app = FastAPI(title="Cobot Service",)

# ติดตั้ง CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ALLOWED_ORIGINS or ["*"],
    allow_credentials=Config.CORS_ALLOW_CREDENTIALS,
    allow_methods=Config.CORS_ALLOW_METHODS,
    allow_headers=Config.CORS_ALLOW_HEADERS,
)

# Health Check
@app.get("/health", tags=["Health Check"])
async def health_check():
    logger.debug("Health check endpoint called")
    return {"status": "healthy"}

# ลงทะเบียน router
app.include_router(api_router, prefix="/api/v1/cobot")

# Main entry point for development
if __name__ == "__main__":
    import uvicorn

    host = getattr(Config, "HOST", "0.0.0.0")
    port = Config.PORT

    logger.info(f"Starting Cobot Service on {host}:{port}")
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level=Config.LOG_LEVEL.lower(),
        workers=2
    )
