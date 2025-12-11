import redis
import json
import asyncio
from typing import AsyncGenerator
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class RedisClient:
    """
    Wrapper for Redis client with pub/sub capabilities.
    Handles connection management and message serialization.
    """
    
    def __init__(self):
        self._client = None
        self._pubsub = None
    
    def get_client(self) -> redis.Redis:
        """
        Get or create Redis client connection.
        
        Returns:
            redis.Redis: Redis client instance
        """
        if self._client is None:
            try:
                self._client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=5
                )
                # Test connection
                self._client.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {e}")
                raise
        return self._client
    
    def publish(self, channel: str, message: dict):
        """
        Publish a message to a Redis channel.
        
        Args:
            channel: Redis channel name
            message: Dictionary to serialize as JSON
        """
        try:
            client = self.get_client()
            message_json = json.dumps(message)
            client.publish(channel, message_json)
            logger.debug(f"Published message to channel '{channel}'")
        except Exception as e:
            logger.error(f"Error publishing to Redis: {e}")
    
    async def subscribe(self, channel: str) -> AsyncGenerator[dict, None]:
        """
        Subscribe to a Redis channel and yield messages.
        
        Args:
            channel: Redis channel name
            
        Yields:
            dict: Deserialized message from channel
        """
        try:
            client = self.get_client()
            pubsub = client.pubsub()
            pubsub.subscribe(channel)
            logger.info(f"Subscribed to Redis channel '{channel}'")
            
            while True:
                message = pubsub.get_message(ignore_subscribe_messages=True)
                if message and message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        yield data
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to decode message: {e}")
                await asyncio.sleep(0.1)  # Prevent tight loop
                
        except Exception as e:
            logger.error(f"Error in Redis subscription: {e}")
        finally:
            if pubsub:
                pubsub.close()
    
    def close(self):
        """Close Redis connections."""
        if self._pubsub:
            self._pubsub.close()
        if self._client:
            self._client.close()
        logger.info("Redis connections closed")


# Global Redis client instance
redis_client = RedisClient()
