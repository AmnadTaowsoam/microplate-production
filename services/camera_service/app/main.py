# app/main.py

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pypylon import pylon

from app.config          import Config
from app.api.v1.endpoints import router as api_router

logging.basicConfig(
    level=Config.LOG_LEVEL.upper(),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("cobot-service")

app = FastAPI(title="Cobot Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ALLOWED_ORIGINS or ["*"],
    allow_credentials=Config.CORS_ALLOW_CREDENTIALS,
    allow_methods=Config.CORS_ALLOW_METHODS,
    allow_headers=Config.CORS_ALLOW_HEADERS,
)

# mount API routes (all endpoints now require a valid JWT)
app.include_router(api_router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "alive"}


@app.on_event("startup")
def startup_camera():
    factory = pylon.TlFactory.GetInstance()
    device  = factory.CreateFirstDevice()
    cam     = pylon.InstantCamera(device)
    cam.Open()
    cam.StartGrabbing(pylon.GrabStrategy_LatestImageOnly)

    conv = pylon.ImageFormatConverter()
    conv.OutputPixelFormat  = pylon.PixelType_BGR8packed
    conv.OutputBitAlignment = pylon.OutputBitAlignment_MsbAligned

    app.state.camera    = cam
    app.state.converter = conv
    logger.info("Camera initialized and grabbing started.")


@app.on_event("shutdown")
def shutdown_camera():
    cam = getattr(app.state, "camera", None)
    if cam and cam.IsOpen():
        cam.StopGrabbing()
        cam.Close()
        logger.info("Camera stopped and closed.")


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
