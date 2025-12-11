from sqlalchemy import Column, Integer, String, JSON, DateTime, Index
from sqlalchemy.sql import func
from app.database import Base


class OperatorAction(Base):
    """
    Operator action model for tracking manual interventions and decisions.
    Records actions taken by operators in response to traffic events.
    """
    __tablename__ = "operator_actions"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    operator_id = Column(String(100), nullable=False, index=True)
    action_type = Column(String(100), nullable=False)  # e.g., 'extend_green_light', 'trigger_alert'
    params = Column(JSON, nullable=True)  # additional action parameters
    camera_id = Column(String(50), nullable=True, index=True)
    status = Column(String(50), nullable=False, default='pending')  # pending, executed, failed, cancelled
    executed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Index for querying actions by camera and time
    __table_args__ = (
        Index('ix_operator_actions_camera_created', 'camera_id', 'created_at'),
    )
    
    def __repr__(self):
        return f"<OperatorAction(id={self.id}, operator={self.operator_id}, type={self.action_type})>"
