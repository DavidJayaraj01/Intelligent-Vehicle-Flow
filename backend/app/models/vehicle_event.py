from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Index
from sqlalchemy.sql import func
from app.database import Base


class VehicleEvent(Base):
    """
    Vehicle event model representing detection/tracking data from cameras.
    Stores individual vehicle observations with bounding boxes and metadata.
    """
    __tablename__ = "vehicle_events"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    camera_id = Column(String(50), nullable=False, index=True)
    track_id = Column(String(100), nullable=False, index=True)
    class_ = Column("class", String(50), nullable=False)  # vehicle class (car, truck, bus, bike)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    enter_time = Column(DateTime(timezone=True), nullable=True)
    exit_time = Column(DateTime(timezone=True), nullable=True)
    dwell_seconds = Column(Float, nullable=True)  # time spent in frame
    lane_id = Column(String(50), nullable=True)
    bbox = Column(JSON, nullable=True)  # bounding box coordinates {x, y, width, height}
    confidence = Column(Float, nullable=False)  # detection confidence score
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Composite indexes for common queries
    __table_args__ = (
        Index('ix_vehicle_events_camera_timestamp', 'camera_id', 'timestamp'),
        Index('ix_vehicle_events_track_timestamp', 'track_id', 'timestamp'),
    )
    
    def __repr__(self):
        return f"<VehicleEvent(id={self.id}, camera={self.camera_id}, track={self.track_id}, class={self.class_})>"
