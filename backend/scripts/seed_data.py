#!/usr/bin/env python3
"""
Seed script to populate database with sample vehicle event data.
Run this after the database is initialized to test the system.
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, init_db
from app.models.vehicle_event import VehicleEvent
from app.models.operator_action import OperatorAction


def generate_random_bbox():
    """Generate random bounding box coordinates"""
    x = random.randint(50, 800)
    y = random.randint(50, 500)
    width = random.randint(60, 150)
    height = random.randint(80, 200)
    return {"x": x, "y": y, "width": width, "height": height}


def seed_vehicle_events(db, num_events=100):
    """Create sample vehicle events"""
    camera_ids = ["cam01", "cam02", "cam03"]
    classes = ["car", "truck", "bus", "bike"]
    lanes = ["lane1", "lane2", "lane3", "lane4"]
    
    base_time = datetime.utcnow() - timedelta(hours=2)
    
    events = []
    for i in range(num_events):
        camera_id = random.choice(camera_ids)
        vehicle_class = random.choice(classes)
        lane_id = random.choice(lanes)
        
        # Generate timestamps
        timestamp = base_time + timedelta(minutes=random.randint(0, 120))
        enter_time = timestamp - timedelta(seconds=random.randint(5, 60))
        exit_time = timestamp + timedelta(seconds=random.randint(5, 120))
        dwell_seconds = (exit_time - enter_time).total_seconds()
        
        event = VehicleEvent(
            camera_id=camera_id,
            track_id=f"track_{camera_id}_{i:04d}",
            class_=vehicle_class,
            timestamp=timestamp,
            enter_time=enter_time,
            exit_time=exit_time,
            dwell_seconds=dwell_seconds,
            lane_id=lane_id,
            bbox=generate_random_bbox(),
            confidence=round(random.uniform(0.80, 0.99), 2)
        )
        events.append(event)
    
    db.bulk_save_objects(events)
    db.commit()
    print(f"✓ Created {num_events} vehicle events")


def seed_operator_actions(db, num_actions=20):
    """Create sample operator actions"""
    action_types = [
        "extend_green_light",
        "trigger_congestion_alert",
        "optimize_signal_timing",
        "manual_override"
    ]
    operators = ["operator_001", "operator_002", "operator_003"]
    camera_ids = ["cam01", "cam02", "cam03"]
    
    base_time = datetime.utcnow() - timedelta(hours=2)
    
    actions = []
    for i in range(num_actions):
        action_type = random.choice(action_types)
        operator_id = random.choice(operators)
        camera_id = random.choice(camera_ids)
        
        params = {
            "duration_seconds": random.randint(10, 60),
            "reason": random.choice(["high_traffic", "congestion", "accident", "manual"])
        }
        
        action = OperatorAction(
            operator_id=operator_id,
            action_type=action_type,
            params=params,
            camera_id=camera_id
        )
        # Manually set created_at to distribute over time
        action.created_at = base_time + timedelta(minutes=random.randint(0, 120))
        
        actions.append(action)
    
    db.bulk_save_objects(actions)
    db.commit()
    print(f"✓ Created {num_actions} operator actions")


def main():
    """Main seeding function"""
    print("=== Vehicle Flow Analyzer - Database Seeding ===\n")
    
    try:
        # Initialize database
        print("Initializing database...")
        init_db()
        print("✓ Database initialized\n")
        
        # Create session
        db = SessionLocal()
        
        try:
            # Seed data
            print("Seeding vehicle events...")
            seed_vehicle_events(db, num_events=100)
            
            print("\nSeeding operator actions...")
            seed_operator_actions(db, num_actions=20)
            
            print("\n=== Seeding Complete ===")
            print(f"Total records created:")
            print(f"  - Vehicle Events: 100")
            print(f"  - Operator Actions: 20")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
