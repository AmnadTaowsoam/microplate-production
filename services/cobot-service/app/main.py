# app/main.py

import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool

from app.config import Config
from app.services.dobot import DobotMG400
from app.api.v1.endpoints import router as api_router

logger = logging.getLogger("cobot‑service")
logging.basicConfig(
    level=Config.LOG_LEVEL.upper(),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

app = FastAPI(title="Cobot Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ALLOWED_ORIGINS or ["*"],
    allow_credentials=Config.CORS_ALLOW_CREDENTIALS,
    allow_methods=Config.CORS_ALLOW_METHODS,
    allow_headers=Config.CORS_ALLOW_HEADERS,
)

# mount API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "alive"}

@app.on_event("startup")
async def startup_robot():
    robot = DobotMG400(
        ip=Config.ROBOT_IP,
        dash_port=Config.DASH_PORT,
        motion_port=Config.MOTION_PORT,
        timeout=Config.ROBOT_TIMEOUT,
    )
    # — Initial enable sequence (run-in-threadpool)
    for fn in (robot.reset, robot.clear_error, robot.continue_, robot.enable):
        await run_in_threadpool(fn)
    # (รอ idle เล็กน้อย)
    await asyncio.sleep(0.3)
    await run_in_threadpool(robot.wait_until_idle)

    # โหลดจุด และเก็บไว้ใน state
    points = robot.load_points(Config.POINT_JSON_PATH)
    app.state.robot  = robot
    app.state.points = points

@app.on_event("shutdown")
async def shutdown_robot():
    """
    1) Disable motors
    2) ปิดการเชื่อมต่อ
    """
    robot = app.state.robot
    try:
        await run_in_threadpool(robot.disable)
    except Exception:
        pass
    robot.close()
    logger.info("☑️ Robot disabled and connection closed")


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
    )
