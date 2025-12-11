import pytest
from datetime import datetime


def test_health_endpoint(test_client):
    """Test health check endpoint"""
    response = test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_root_endpoint(test_client):
    """Test root endpoint"""
    response = test_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_post_events(test_client, sample_events):
    """Test posting events"""
    response = test_client.post("/api/v1/events/", json=sample_events)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["events_created"] == 2
    assert data["camera_id"] == "cam01"


def test_get_events(test_client, test_db, sample_events):
    """Test retrieving events"""
    # First post some events
    test_client.post("/api/v1/events/", json=sample_events)
    
    # Then retrieve them
    response = test_client.get("/api/v1/events/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_get_events_with_camera_filter(test_client, sample_events):
    """Test retrieving events with camera filter"""
    # Post events
    test_client.post("/api/v1/events/", json=sample_events)
    
    # Get with filter
    response = test_client.get("/api/v1/events/?camera_id=cam01")
    assert response.status_code == 200
    data = response.json()
    assert all(event["camera_id"] == "cam01" for event in data)


def test_get_metrics(test_client, sample_events):
    """Test metrics endpoint"""
    # Post events first
    test_client.post("/api/v1/events/", json=sample_events)
    
    # Get metrics
    response = test_client.get("/api/v1/metrics/")
    assert response.status_code == 200
    data = response.json()
    assert "total_events" in data
    assert "vehicles_per_min" in data
    assert "avg_dwell_time" in data
    assert "queue_length" in data


def test_get_tracks(test_client, sample_events):
    """Test tracks endpoint"""
    # Post events
    test_client.post("/api/v1/events/", json=sample_events)
    
    # Get track
    response = test_client.get("/api/v1/tracks/?track_id=track_001")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert all(event["track_id"] == "track_001" for event in data)


def test_get_tracks_not_found(test_client):
    """Test tracks endpoint with non-existent track"""
    response = test_client.get("/api/v1/tracks/?track_id=nonexistent")
    assert response.status_code == 404


def test_post_action(test_client):
    """Test posting operator action"""
    action_data = {
        "operator_id": "operator_001",
        "action_type": "extend_green_light",
        "params": {"duration_seconds": 30, "reason": "test"},
        "camera_id": "cam01"
    }
    
    response = test_client.post("/api/v1/actions/", json=action_data)
    assert response.status_code == 201
    data = response.json()
    assert data["operator_id"] == "operator_001"
    assert data["action_type"] == "extend_green_light"
    assert "id" in data
    assert "created_at" in data


def test_get_actions(test_client):
    """Test retrieving actions"""
    # Post an action first
    action_data = {
        "operator_id": "operator_001",
        "action_type": "extend_green_light",
        "params": {"duration_seconds": 30},
        "camera_id": "cam01"
    }
    test_client.post("/api/v1/actions/", json=action_data)
    
    # Get actions
    response = test_client.get("/api/v1/actions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_action_stats(test_client):
    """Test action statistics endpoint"""
    # Post some actions
    for i in range(3):
        action_data = {
            "operator_id": f"operator_{i}",
            "action_type": "extend_green_light",
            "params": {},
            "camera_id": "cam01"
        }
        test_client.post("/api/v1/actions/", json=action_data)
    
    # Get stats
    response = test_client.get("/api/v1/actions/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_actions" in data
    assert "action_breakdown" in data
    assert data["total_actions"] >= 3


def test_metrics_timeseries(test_client, sample_events):
    """Test time series metrics endpoint"""
    # Post events
    test_client.post("/api/v1/events/", json=sample_events)
    
    # Get time series
    response = test_client.get("/api/v1/metrics/timeseries?metric_name=vehicles_per_min&interval=1")
    assert response.status_code == 200
    data = response.json()
    assert "metric_name" in data
    assert "data_points" in data
    assert isinstance(data["data_points"], list)
