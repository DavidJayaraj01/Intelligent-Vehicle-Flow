from fastapi import WebSocket
from typing import List
import json
import asyncio
import logging

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Manages WebSocket connections and broadcasts messages to connected clients.
    Handles connection lifecycle and message distribution.
    """
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket):
        """
        Accept and register a new WebSocket connection.
        
        Args:
            websocket: FastAPI WebSocket instance
        """
        await websocket.accept()
        async with self._lock:
            self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    async def disconnect(self, websocket: WebSocket):
        """
        Remove a WebSocket connection from the active list.
        
        Args:
            websocket: FastAPI WebSocket instance to remove
        """
        async with self._lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        """
        Send a message to all connected WebSocket clients.
        Automatically removes disconnected clients.
        
        Args:
            message: Dictionary to serialize and send as JSON
        """
        if not self.active_connections:
            return
        
        message_json = json.dumps(message)
        disconnected = []
        
        async with self._lock:
            for connection in self.active_connections:
                try:
                    await connection.send_text(message_json)
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {e}")
                    disconnected.append(connection)
            
            # Remove disconnected clients
            for conn in disconnected:
                if conn in self.active_connections:
                    self.active_connections.remove(conn)
        
        if disconnected:
            logger.info(f"Removed {len(disconnected)} disconnected clients")
    
    async def send_personal(self, message: dict, websocket: WebSocket):
        """
        Send a message to a specific WebSocket client.
        
        Args:
            message: Dictionary to serialize and send as JSON
            websocket: Target WebSocket connection
        """
        try:
            message_json = json.dumps(message)
            await websocket.send_text(message_json)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            await self.disconnect(websocket)


# Global WebSocket manager instance
ws_manager = WebSocketManager()
