"""
Script to generate sample vehicle detection data for testing the camera feed.
This simulates real-time vehicle detections with bounding boxes.
"""
import sys
import time
import random
from datetime import datetime
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.services.api import api
from app.config import settings

# Sample vehicle classes
VEHICLE_CLASSES = ['car', 'truck', 'bus', 'bike']

# Camera IDs
CAMERAS = ['cam01', 'cam02', 'cam03']


def generate_bbox():
    """Generate random bounding box coordinates"""
    x = random.randint(50, 600)
    y = random.randint(50, 300)
    width = random.randint(60, 120)
    height = random.randint(80, 150)
    return [x, y, width, height]


def generate_detection(camera_id: str, track_counter: int):
    """Generate a single vehicle detection event"""
    return {
        "camera_id": camera_id,
        "track_id": f"track_{camera_id}_{track_counter}",
        "class": random.choice(VEHICLE_CLASSES),
        "bbox": generate_bbox(),
        "confidence": round(random.uniform(0.85, 0.99), 4),
        "timestamp": datetime.utcnow().isoformat(),
        "dwell_seconds": round(random.uniform(1, 30), 2),
    }


def send_batch_events(events: list):
    """Send batch of events to API"""
    import requests
    
    url = "http://localhost:8000/api/v1/events/"
    headers = {
        "X-API-Key": "vfa_admin_key_12345",
        "Content-Type": "application/json",
    }
    
    try:
        response = requests.post(url, json=events, headers=headers)
        if response.status_code == 200:
            print(f"✓ Sent {len(events)} events successfully")
            return True
        else:
            print(f"✗ Error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Failed to send events: {e}")
        return False


def main():
    """Main function to generate and send vehicle detections"""
    print("=" * 60)
    print("Vehicle Detection Data Generator")
    print("=" * 60)
    print()
    print("Generating sample vehicle detections...")
    print("Press Ctrl+C to stop")
    print()
    
    track_counter = 0
    
    try:
        while True:
            # Generate 2-5 detections per iteration
            num_detections = random.randint(2, 5)
            events = []
            
            for _ in range(num_detections):
                camera_id = random.choice(CAMERAS)
                track_counter += 1
                event = generate_detection(camera_id, track_counter)
                events.append(event)
            
            # Send events to backend
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"[{timestamp}] Generating {num_detections} detections...", end=" ")
            
            success = send_batch_events(events)
            
            if success:
                for event in events:
                    print(f"  - {event['camera_id']}: {event['class']} at {event['bbox']}")
            
            # Wait before next batch
            time.sleep(random.uniform(1, 3))
            
    except KeyboardInterrupt:
        print("\n\nStopped by user")
        print(f"\nTotal detections generated: {track_counter}")


if __name__ == "__main__":
    # Check if requests is installed
    try:
        import requests
    except ImportError:
        print("Error: 'requests' package is required")
        print("Install it with: pip install requests")
        sys.exit(1)
    
    main()
