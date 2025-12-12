from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import logging

from app.config import settings
from app.database import init_db
from app.api import events, metrics, tracks, actions, detection, queue, emergency, live_stream
from app.services.websocket_manager import ws_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events"""
    # Startup
    logger.info("Starting Vehicle Flow Analyzer API...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Vehicle Flow Analyzer API...")
    try:
        from app.core.redis_client import redis_client
        redis_client.close()
        logger.info("Redis connections closed")
    except Exception as e:
        logger.error(f"Error closing connections: {e}")


# Create FastAPI application
app = FastAPI(
    title="Vehicle Flow Analyzer API",
    description="Real-time vehicle tracking and traffic flow analysis system",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers with prefix
app.include_router(events.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")
app.include_router(tracks.router, prefix="/api/v1")
app.include_router(actions.router, prefix="/api/v1")
app.include_router(detection.router, prefix="/api/v1")
app.include_router(queue.router, prefix="/api/v1")
app.include_router(emergency.router, prefix="/api/v1")
app.include_router(live_stream.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns API status and current timestamp.
    """
    return {
        "status": "healthy",
        "service": "Vehicle Flow Analyzer API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Vehicle Flow Analyzer API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    """
    WebSocket endpoint for real-time metrics updates.
    Clients connect here to receive live updates about events, actions, and KPIs.
    """
    await ws_manager.connect(websocket)
    logger.info("New WebSocket client connected")
    
    try:
        # Send initial connection confirmation
        await ws_manager.send_personal({
            "type": "connected",
            "message": "Connected to Vehicle Flow Analyzer",
            "timestamp": datetime.utcnow().isoformat()
        }, websocket)
        
        # Keep connection alive and listen for client messages
        while True:
            try:
                # Receive messages from client (if any)
                data = await websocket.receive_text()
                logger.debug(f"Received WebSocket message: {data}")
                
                # Echo back or handle client requests here if needed
                await ws_manager.send_personal({
                    "type": "ack",
                    "message": "Message received",
                    "timestamp": datetime.utcnow().isoformat()
                }, websocket)
                
            except WebSocketDisconnect:
                logger.info("WebSocket client disconnected")
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
    
    finally:
        await ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
