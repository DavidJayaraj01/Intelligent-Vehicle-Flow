from sqlalchemy import Column, Integer, String, JSON, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base


class Camera(Base):
    """
    Camera model for managing camera metadata and configuration.
    """
    __tablename__ = "cameras"
    
    camera_id = Column(String(50), primary_key=True)
    name = Column(String(200), nullable=False)
    location = Column(String(500), nullable=True)
    coordinates = Column(JSON, nullable=True)  # {lat, lng}
    status = Column(String(50), nullable=False, default='active')  # active, inactive, maintenance
    config = Column(JSON, nullable=True)  # camera-specific configuration
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Camera(id={self.camera_id}, name={self.name}, status={self.status})>"
