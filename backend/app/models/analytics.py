from sqlalchemy import Column, Integer, String, DateTime, JSON, DECIMAL, ForeignKey, Index, Boolean
from sqlalchemy.sql import func
from app.database import Base


class MetricsAggregated(Base):
    """
    Pre-computed aggregated metrics for performance.
    """
    __tablename__ = "metrics_aggregated"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    camera_id = Column(String(50), nullable=False)
    interval_start = Column(DateTime(timezone=True), nullable=False)
    interval_end = Column(DateTime(timezone=True), nullable=False)
    interval_minutes = Column(Integer, nullable=False)  # 1, 5, 15, 60
    vehicle_count = Column(Integer, nullable=False, default=0)
    avg_dwell_seconds = Column(DECIMAL(10, 2), nullable=True)
    max_dwell_seconds = Column(DECIMAL(10, 2), nullable=True)
    min_dwell_seconds = Column(DECIMAL(10, 2), nullable=True)
    avg_queue_length = Column(DECIMAL(10, 2), nullable=True)
    class_distribution = Column(JSON, nullable=True)  # {"car": 45, "truck": 12}
    lane_distribution = Column(JSON, nullable=True)  # {"lane_1": 30, "lane_2": 35}
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    __table_args__ = (
        Index('ix_metrics_camera_interval', 'camera_id', 'interval_start'),
    )
    
    def __repr__(self):
        return f"<MetricsAggregated(camera={self.camera_id}, interval={self.interval_minutes}min)>"


class SystemAlert(Base):
    """
    System alerts for monitoring and notifications.
    """
    __tablename__ = "system_alerts"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    camera_id = Column(String(50), nullable=True, index=True)
    alert_type = Column(String(100), nullable=False)  # congestion, anomaly, system_error
    severity = Column(String(20), nullable=False, index=True)  # low, medium, high, critical
    message = Column(String, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)  # Renamed from metadata to avoid SQLAlchemy reserved word
    acknowledged = Column(Boolean, nullable=False, default=False, index=True)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    def __repr__(self):
        return f"<SystemAlert(id={self.id}, type={self.alert_type}, severity={self.severity})>"


class Recommendation(Base):
    """
    AI-generated recommendations from the decision engine.
    """
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    camera_id = Column(String(50), nullable=False, index=True)
    recommendation_type = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    confidence = Column(DECIMAL(5, 4), nullable=True)
    params = Column(JSON, nullable=True)
    based_on_metrics = Column(JSON, nullable=True)
    status = Column(String(50), nullable=False, default='pending', index=True)  # pending, accepted, rejected, expired
    action_id = Column(Integer, ForeignKey('operator_actions.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Recommendation(id={self.id}, type={self.recommendation_type}, status={self.status})>"


class AuditLog(Base):
    """
    Audit log for tracking all system actions.
    """
    __tablename__ = "audit_log"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 max length
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, user_id={self.user_id})>"
