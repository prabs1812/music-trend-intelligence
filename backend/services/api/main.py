"""Main FastAPI application for Music Trend Intelligence System."""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from backend.services.api.routes import trends, artists, analytics
from backend.services.api.websocket.manager import manager
from backend.database.mongodb import mongodb_manager
from backend.database.redis_client import redis_manager
from backend.services.kafka_producer.producer import kafka_producer
from backend.services.kafka_consumer.consumer import kafka_consumer
from backend.services.analytics.trend_scorer import trend_scorer
from backend.services.analytics.anomaly_detector import anomaly_detector
from backend.utils.config import settings
from backend.utils.logger import app_logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    app_logger.info("=" * 60)
    app_logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    app_logger.info("=" * 60)

    try:
        # Connect to databases
        app_logger.info("Connecting to databases...")
        await mongodb_manager.connect()
        await redis_manager.connect()

        # Connect to Kafka (optional for Railway deployment)
        try:
            app_logger.info("Connecting to Kafka...")
            kafka_producer.connect()
            kafka_consumer.connect()
            app_logger.info("Kafka connected successfully")
        except Exception as e:
            app_logger.warning(f"Kafka connection failed (running without Kafka): {e}")
            # Continue without Kafka - system will work in degraded mode

        # Start background tasks
        app_logger.info("Starting background tasks...")

        # WebSocket heartbeat
        asyncio.create_task(manager.heartbeat_loop())

        app_logger.info("=" * 60)
        app_logger.info("Application started successfully!")
        app_logger.info(f"API available at: http://{settings.API_HOST}:{settings.API_PORT}")
        app_logger.info(f"API docs at: http://{settings.API_HOST}:{settings.API_PORT}/docs")
        app_logger.info("=" * 60)

    except Exception as e:
        app_logger.error(f"Failed to start application: {e}")
        raise

    yield

    # Shutdown
    app_logger.info("Shutting down application...")

    try:
        # Disconnect from databases
        await mongodb_manager.disconnect()
        await redis_manager.disconnect()

        # Disconnect from Kafka (if connected)
        try:
            if kafka_producer.is_connected():
                kafka_producer.disconnect()
            if kafka_consumer.is_connected():
                kafka_consumer.disconnect()
        except Exception as e:
            app_logger.warning(f"Error disconnecting Kafka: {e}")

        app_logger.info("Application shutdown complete")

    except Exception as e:
        app_logger.error(f"Error during shutdown: {e}")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Near Real-Time Music Trend Intelligence & Analytics System",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS.split(",") if settings.CORS_ALLOW_METHODS != "*" else ["*"],
    allow_headers=settings.CORS_ALLOW_HEADERS.split(",") if settings.CORS_ALLOW_HEADERS != "*" else ["*"],
)

# Include API routers
app.include_router(trends.router, prefix="/api/v1")
app.include_router(artists.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "mongodb": mongodb_manager.is_connected(),
        "redis": redis_manager.is_connected(),
        "kafka_producer": kafka_producer.is_connected(),
        "kafka_consumer": kafka_consumer.is_connected(),
        "websocket_connections": manager.get_connection_count()
    }


@app.get("/api/v1/stats")
async def get_system_stats():
    """Get system statistics."""
    try:
        db = mongodb_manager.db
        if not db:
            return {"error": "Database not connected"}

        total_artists = await db.artists.count_documents({})
        total_trends = await db.trends.count_documents({})
        total_anomalies = await db.anomalies.count_documents({})
        total_comments = await db.comments.count_documents({})

        return {
            "total_artists": total_artists,
            "total_trends": total_trends,
            "total_anomalies": total_anomalies,
            "total_comments": total_comments,
            "websocket_connections": manager.get_connection_count()
        }

    except Exception as e:
        app_logger.error(f"Error fetching stats: {e}")
        return {"error": str(e)}


# WebSocket endpoints
@app.websocket("/ws/trends")
async def websocket_trends(websocket: WebSocket):
    """WebSocket endpoint for real-time trend updates."""
    connected = await manager.connect(websocket, client_id="trends_client")
    if not connected:
        return

    try:
        while True:
            # Wait for messages from client (e.g., ping/pong)
            data = await websocket.receive_text()

            if data == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        app_logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


@app.websocket("/ws/anomalies")
async def websocket_anomalies(websocket: WebSocket):
    """WebSocket endpoint for real-time anomaly alerts."""
    connected = await manager.connect(websocket, client_id="anomalies_client")
    if not connected:
        return

    try:
        while True:
            data = await websocket.receive_text()

            if data == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        app_logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


@app.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    """WebSocket endpoint for combined dashboard feed."""
    connected = await manager.connect(websocket, client_id="dashboard_client")
    if not connected:
        return

    try:
        # Send initial data
        await manager.send_personal_message({
            "type": "connected",
            "message": "Connected to dashboard feed"
        }, websocket)

        while True:
            data = await websocket.receive_text()

            if data == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        app_logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.services.api.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
