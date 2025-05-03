## app/man.py

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.logger import get_logger
from app.config import Config
from app.api.v1.endpoint import router as api_router
from app.database import Base, DbConnect

# Initialize FastAPI app
app = FastAPI()

# Initialize Logger
logger = get_logger(__name__)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ALLOWED_ORIGINS,  # Parse comma-separated CORS origins
    allow_credentials=Config.CORS_ALLOW_CREDENTIALS,
    allow_methods=Config.CORS_ALLOW_METHODS,  # Parse comma-separated allowed methods
    allow_headers=Config.CORS_ALLOW_HEADERS,  # Parse comma-separated allowed headers
)

# Health Check Endpoint
@app.get("/health", tags=["Health Check"])
async def health_check():
    logger.debug("Health check endpoint called.")
    return {"status": "healthy"}

# Route Registration
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def create_tables():
    db_connect = DbConnect()
    Base.metadata.create_all(bind=db_connect.engine)

# Main entry point for development
if __name__ == "__main__":
    import uvicorn
    HOST = "0.0.0.0"  # แก้ไขให้ใช้ IP แบบ Global
    PORT = Config.USER_MANAGEMENT_PORT
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True, workers=2)
