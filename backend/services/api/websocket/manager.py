"""WebSocket connection manager for real-time updates."""

from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import asyncio
import json
from datetime import datetime
from backend.utils.logger import app_logger
from backend.utils.config import settings


class ConnectionManager:
    """Manages WebSocket connections and broadcasts."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_metadata: Dict[WebSocket, Dict] = {}
        self.max_connections = settings.WS_MAX_CONNECTIONS
        self.heartbeat_interval = settings.WS_HEARTBEAT_INTERVAL

    async def connect(self, websocket: WebSocket, client_id: str = None):
        """Accept and register a new WebSocket connection."""
        if len(self.active_connections) >= self.max_connections:
            await websocket.close(code=1008, reason="Max connections reached")
            app_logger.warning(f"Connection rejected: max connections ({self.max_connections}) reached")
            return False

        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_metadata[websocket] = {
            "client_id": client_id or f"client_{len(self.active_connections)}",
            "connected_at": datetime.utcnow(),
            "last_heartbeat": datetime.utcnow()
        }

        app_logger.info(f"WebSocket connected: {self.connection_metadata[websocket]['client_id']} "
                       f"(Total: {len(self.active_connections)})")
        return True

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            client_id = self.connection_metadata.get(websocket, {}).get("client_id", "unknown")
            self.active_connections.remove(websocket)
            if websocket in self.connection_metadata:
                del self.connection_metadata[websocket]

            app_logger.info(f"WebSocket disconnected: {client_id} "
                           f"(Remaining: {len(self.active_connections)})")

    async def send_personal_message(self, message: Dict[Any, Any], websocket: WebSocket):
        """Send a message to a specific client."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            app_logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: Dict[Any, Any], exclude: WebSocket = None):
        """Broadcast a message to all connected clients."""
        disconnected = []

        for connection in self.active_connections:
            if connection == exclude:
                continue

            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                disconnected.append(connection)
            except Exception as e:
                app_logger.error(f"Error broadcasting to client: {e}")
                disconnected.append(connection)

        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_trend_update(self, trend_data: Dict[Any, Any]):
        """Broadcast trend update to all clients."""
        message = {
            "type": "trend_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": trend_data
        }
        await self.broadcast(message)

    async def broadcast_anomaly_alert(self, anomaly_data: Dict[Any, Any]):
        """Broadcast anomaly alert to all clients."""
        message = {
            "type": "anomaly_alert",
            "timestamp": datetime.utcnow().isoformat(),
            "data": anomaly_data
        }
        await self.broadcast(message)

    async def broadcast_artist_update(self, artist_data: Dict[Any, Any]):
        """Broadcast artist data update to all clients."""
        message = {
            "type": "artist_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": artist_data
        }
        await self.broadcast(message)

    async def send_heartbeat(self):
        """Send heartbeat to all connected clients."""
        message = {
            "type": "heartbeat",
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)

    async def heartbeat_loop(self):
        """Periodic heartbeat to keep connections alive."""
        while True:
            await asyncio.sleep(self.heartbeat_interval)
            await self.send_heartbeat()

            # Update last heartbeat time
            now = datetime.utcnow()
            for ws in self.active_connections:
                if ws in self.connection_metadata:
                    self.connection_metadata[ws]["last_heartbeat"] = now

    def get_connection_count(self) -> int:
        """Get number of active connections."""
        return len(self.active_connections)

    def get_connection_info(self) -> List[Dict]:
        """Get information about all active connections."""
        info = []
        for ws, metadata in self.connection_metadata.items():
            info.append({
                "client_id": metadata["client_id"],
                "connected_at": metadata["connected_at"].isoformat(),
                "last_heartbeat": metadata["last_heartbeat"].isoformat()
            })
        return info


# Global connection manager instance
manager = ConnectionManager()
