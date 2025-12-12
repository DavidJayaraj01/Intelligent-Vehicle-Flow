from sqlalchemy import Column, Integer, String, DateTime, Text, LargeBinary, JSON
from sqlalchemy.sql import func
from app.database import Base


class GeneratedReport(Base):
    """
    Model for storing generated reports with AI-generated content
    """
    __tablename__ = "generated_reports"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    report_id = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), nullable=False, index=True)
    camera_id = Column(String(50), nullable=False, index=True)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    
    # Report content
    summary = Column(Text, nullable=True)
    full_content = Column(Text, nullable=True)
    metrics = Column(JSON, nullable=True)
    
    # File storage
    pdf_content = Column(LargeBinary, nullable=True)
    file_size = Column(Integer, nullable=True)
    
    # Metadata
    status = Column(String(20), default='completed', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<GeneratedReport(id={self.report_id}, title={self.title})>"
