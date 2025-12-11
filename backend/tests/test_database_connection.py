"""
Test script to verify backend can connect to Render PostgreSQL database
and query the tables.
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models import VehicleEvent, OperatorAction, Camera, User


def test_connection():
    """Test basic database connection"""
    print("Testing database connection...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✓ Connected successfully!")
            print(f"  PostgreSQL version: {version[:50]}...")
            return True
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False


def test_tables():
    """Test that all tables exist"""
    print("\nVerifying tables...")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result.fetchall()]
            
            expected_tables = [
                'audit_log',
                'cameras',
                'metrics_aggregated',
                'operator_actions',
                'recommendations',
                'system_alerts',
                'users',
                'vehicle_events'
            ]
            
            print(f"✓ Found {len(tables)} tables:")
            for table in tables:
                status = "✓" if table in expected_tables else "?"
                print(f"  {status} {table}")
            
            missing = set(expected_tables) - set(tables)
            if missing:
                print(f"\n⚠ Missing tables: {missing}")
                return False
            return True
    except Exception as e:
        print(f"✗ Error checking tables: {e}")
        return False


def test_seed_data():
    """Test that seed data was loaded"""
    print("\nChecking seed data...")
    db = SessionLocal()
    try:
        # Check cameras
        camera_count = db.query(Camera).count()
        print(f"✓ Cameras: {camera_count} records")
        
        if camera_count > 0:
            camera = db.query(Camera).first()
            print(f"  Sample: {camera.camera_id} - {camera.name}")
        
        # Check users
        user_count = db.query(User).count()
        print(f"✓ Users: {user_count} records")
        
        if user_count > 0:
            user = db.query(User).first()
            print(f"  Sample: {user.username} ({user.role})")
        
        return True
    except Exception as e:
        print(f"✗ Error checking seed data: {e}")
        return False
    finally:
        db.close()


def test_queries():
    """Test basic ORM queries"""
    print("\nTesting ORM queries...")
    db = SessionLocal()
    try:
        # Test vehicle events query (should be empty initially)
        event_count = db.query(VehicleEvent).count()
        print(f"✓ Vehicle events query: {event_count} records")
        
        # Test operator actions query (should be empty initially)
        action_count = db.query(OperatorAction).count()
        print(f"✓ Operator actions query: {action_count} records")
        
        # Test camera filtering
        active_cameras = db.query(Camera).filter(Camera.status == 'active').all()
        print(f"✓ Active cameras: {len(active_cameras)} found")
        
        return True
    except Exception as e:
        print(f"✗ Error testing queries: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def main():
    """Run all tests"""
    print("=" * 60)
    print("Backend Database Connection Test")
    print("=" * 60)
    
    tests = [
        ("Connection", test_connection),
        ("Tables", test_tables),
        ("Seed Data", test_seed_data),
        ("Queries", test_queries)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ Test '{name}' crashed: {e}")
            results.append((name, False))
        print()
    
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    all_passed = all(result for _, result in results)
    print("\n" + ("=" * 60))
    if all_passed:
        print("✓ All tests passed! Backend is ready to use.")
    else:
        print("✗ Some tests failed. Please check the errors above.")
    print("=" * 60)


if __name__ == "__main__":
    main()
