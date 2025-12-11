import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.main import app
from app.database import Base, get_db
from app.models.vehicle_event import VehicleEvent
from app.models.operator_action import OperatorAction

# Test database URL (SQLite for testing)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db():
    """Create test database and tables"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_client(test_db):
    """Create test client with test database"""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_events():
    """Return sample event data for testing"""
    return {
        "camera_id": "cam01",
        "events": [
            {
                "camera_id": "cam01",
                "track_id": "track_001",
                "class": "car",
                "timestamp": "2025-12-11T10:30:00Z",
                "confidence": 0.95,
                "bbox": {"x": 100, "y": 200, "width": 80, "height": 120},
                "dwell_seconds": 45.5,
                "lane_id": "lane1"
            },
            {
                "camera_id": "cam01",
                "track_id": "track_002",
                "class": "truck",
                "timestamp": "2025-12-11T10:31:00Z",
                "confidence": 0.88,
                "bbox": {"x": 200, "y": 250, "width": 100, "height": 150},
                "dwell_seconds": 60.0,
                "lane_id": "lane2"
            }
        ]
    }
