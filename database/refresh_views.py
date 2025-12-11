"""
Script to refresh materialized views for the Vehicle Flow Analyzer.
Run this periodically (e.g., every minute via cron) to keep real-time metrics updated.
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import text
from app.database import engine
from datetime import datetime


def refresh_materialized_views():
    """Refresh all materialized views"""
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Refreshing materialized views...")
    
    views = [
        ('mv_realtime_metrics', 'Real-time metrics (last hour)'),
        ('mv_hourly_stats', 'Hourly statistics')
    ]
    
    try:
        with engine.connect() as conn:
            conn.execute(text("COMMIT"))  # Close any open transaction
            
            for view_name, description in views:
                try:
                    print(f"  Refreshing {view_name}...", end=" ")
                    # Use CONCURRENTLY to avoid locking the view
                    conn.execute(text(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view_name}"))
                    conn.execute(text("COMMIT"))
                    print(f"✓ Done")
                except Exception as e:
                    print(f"✗ Error: {e}")
                    # If CONCURRENTLY fails (e.g., no unique index), try without it
                    if "CONCURRENTLY" in str(e):
                        try:
                            print(f"  Retrying without CONCURRENTLY...", end=" ")
                            conn.execute(text(f"REFRESH MATERIALIZED VIEW {view_name}"))
                            conn.execute(text("COMMIT"))
                            print(f"✓ Done")
                        except Exception as e2:
                            print(f"✗ Error: {e2}")
        
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Refresh complete\n")
        return True
        
    except Exception as e:
        print(f"✗ Fatal error: {e}")
        return False


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Refresh materialized views")
    parser.add_argument("--loop", action="store_true", help="Run continuously every 60 seconds")
    parser.add_argument("--interval", type=int, default=60, help="Interval in seconds (default: 60)")
    args = parser.parse_args()
    
    if args.loop:
        import time
        print(f"Starting continuous refresh every {args.interval} seconds...")
        print("Press Ctrl+C to stop\n")
        
        try:
            while True:
                refresh_materialized_views()
                time.sleep(args.interval)
        except KeyboardInterrupt:
            print("\nStopped by user")
    else:
        # Single run
        refresh_materialized_views()
