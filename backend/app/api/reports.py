"""
Reports API
Endpoints for generating and downloading analytics reports
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import io
import csv
import json
import logging
from sqlalchemy import func

from app.database import get_db
from app.models.vehicle_event import VehicleEvent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportRequest(BaseModel):
    start_date: str
    end_date: str
    camera_id: Optional[str] = None
    report_type: str = "traffic-analysis"  # traffic-analysis, queue-performance, vehicle-types


class ReportSummary(BaseModel):
    total_vehicles: int
    unique_vehicles: int
    avg_queue_time: float
    max_queue_time: float
    vehicles_by_type: dict
    peak_hour: str
    start_date: str
    end_date: str


@router.post("/generate")
async def generate_report(request: ReportRequest):
    """
    Generate analytics report for specified date range
    
    Args:
        request: Report parameters
        
    Returns:
        Report summary and statistics
    """
    try:
        db = next(get_db())
        
        # Parse dates
        start_dt = datetime.fromisoformat(request.start_date.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(request.end_date.replace('Z', '+00:00'))
        
        # Query detections
        query = db.query(VehicleEvent).filter(
            VehicleEvent.timestamp >= start_dt,
            VehicleEvent.timestamp <= end_dt
        )
        
        if request.camera_id:
            query = query.filter(VehicleEvent.camera_id == request.camera_id)
        
        detections = query.all()
        
        if not detections:
            return {
                "status": "no_data",
                "message": "No detections found for the specified period",
                "summary": None
            }
        
        # Calculate statistics
        total_vehicles = len(detections)
        unique_vehicles = len(set(d.track_id for d in detections if d.track_id))
        
        # Get queue times from dwell_seconds in vehicle_events
        queue_times = [float(d.dwell_seconds) for d in detections if d.dwell_seconds and float(d.dwell_seconds) > 0]
        avg_queue_time = sum(queue_times) / len(queue_times) if queue_times else 0
        max_queue_time = max(queue_times) if queue_times else 0
        
        # Vehicles by type
        vehicles_by_type = {}
        for det in detections:
            vehicle_type = det.class_ or 'unknown'
            vehicles_by_type[vehicle_type] = vehicles_by_type.get(vehicle_type, 0) + 1
        
        # Find peak hour
        hourly_counts = {}
        for det in detections:
            hour = det.timestamp.strftime('%H:00')
            hourly_counts[hour] = hourly_counts.get(hour, 0) + 1
        
        peak_hour = max(hourly_counts.items(), key=lambda x: x[1])[0] if hourly_counts else "N/A"
        
        summary = ReportSummary(
            total_vehicles=total_vehicles,
            unique_vehicles=unique_vehicles,
            avg_queue_time=round(avg_queue_time, 2),
            max_queue_time=round(max_queue_time, 2),
            vehicles_by_type=vehicles_by_type,
            peak_hour=peak_hour,
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        return {
            "status": "success",
            "summary": summary,
            "details": {
                "total_detections": total_vehicles,
                "hourly_distribution": hourly_counts,
                "queue_statistics": {
                    "average": avg_queue_time,
                    "maximum": max_queue_time,
                    "minimum": min(queue_times) if queue_times else 0,
                    "total_samples": len(queue_times)
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/download/csv")
async def download_csv_report(
    start_date: str = Query(..., description="Start date (ISO format)"),
    end_date: str = Query(..., description="End date (ISO format)"),
    camera_id: Optional[str] = Query(None, description="Camera ID filter")
):
    """
    Download detections report as CSV
    
    Args:
        start_date: Start date
        end_date: End date
        camera_id: Optional camera filter
        
    Returns:
        CSV file stream
    """
    try:
        db = next(get_db())
        
        # Parse dates
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        # Query detections
        query = db.query(VehicleEvent).filter(
            VehicleEvent.timestamp >= start_dt,
            VehicleEvent.timestamp <= end_dt
        ).order_by(VehicleEvent.timestamp)
        
        if camera_id:
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        detections = query.all()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Timestamp',
            'Camera ID',
            'Track ID',
            'Vehicle Type',
            'Confidence',
            'BBox X1',
            'BBox Y1',
            'BBox X2',
            'BBox Y2'
        ])
        
        # Write data
        for det in detections:
            bbox = det.bbox or {}
            writer.writerow([
                det.timestamp.isoformat(),
                det.camera_id,
                det.track_id,
                det.class_,
                f"{float(det.confidence):.3f}",
                f"{bbox.get('x', 0):.2f}",
                f"{bbox.get('y', 0):.2f}",
                f"{bbox.get('x', 0) + bbox.get('width', 0):.2f}",
                f"{bbox.get('y', 0) + bbox.get('height', 0):.2f}"
            ])
        
        # Prepare response
        output.seek(0)
        filename = f"detections_{start_date}_{end_date}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Error generating CSV report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/download/json")
async def download_json_report(
    start_date: str = Query(..., description="Start date (ISO format)"),
    end_date: str = Query(..., description="End date (ISO format)"),
    camera_id: Optional[str] = Query(None, description="Camera ID filter")
):
    """
    Download analytics report as JSON
    
    Args:
        start_date: Start date
        end_date: End date
        camera_id: Optional camera filter
        
    Returns:
        JSON file stream
    """
    try:
        db = next(get_db())
        
        # Parse dates
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        # Query detections
        query = db.query(VehicleEvent).filter(
            VehicleEvent.timestamp >= start_dt,
            VehicleEvent.timestamp <= end_dt
        )
        
        if camera_id:
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        detections = query.all()
        
        # Build JSON structure
        report_data = {
            "report_metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "start_date": start_date,
                "end_date": end_date,
                "camera_id": camera_id,
                "total_detections": len(detections)
            },
            "detections": []
        }
        
        for det in detections:
            bbox = det.bbox or {}
            report_data["detections"].append({
                "id": det.id,
                "timestamp": det.timestamp.isoformat(),
                "camera_id": det.camera_id,
                "track_id": det.track_id,
                "vehicle_type": det.class_,
                "confidence": float(det.confidence),
                "bbox": {
                    "x": bbox.get('x', 0),
                    "y": bbox.get('y', 0),
                    "width": bbox.get('width', 0),
                    "height": bbox.get('height', 0)
                },
                "queue_time": float(det.dwell_seconds) if det.dwell_seconds else 0
            })
        
        # Convert to JSON string
        json_str = json.dumps(report_data, indent=2)
        
        filename = f"analytics_{start_date}_{end_date}.json"
        
        return StreamingResponse(
            iter([json_str]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Error generating JSON report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/summary/today")
async def get_today_summary():
    """Get summary statistics for today"""
    try:
        db = next(get_db())
        
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.utcnow()
        
        detections = db.query(VehicleEvent).filter(
            VehicleEvent.timestamp >= today_start,
            VehicleEvent.timestamp <= today_end
        ).all()
        
        # Calculate statistics
        total = len(detections)
        unique = len(set(d.track_id for d in detections if d.track_id))
        
        vehicles_by_type = {}
        for det in detections:
            vtype = det.class_ or 'unknown'
            vehicles_by_type[vtype] = vehicles_by_type.get(vtype, 0) + 1
        
        return {
            "date": today_start.date().isoformat(),
            "total_detections": total,
            "unique_vehicles": unique,
            "vehicles_by_type": vehicles_by_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting today summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/summary/week")
async def get_week_summary():
    """Get summary statistics for the past 7 days"""
    try:
        db = next(get_db())
        
        week_start = datetime.utcnow() - timedelta(days=7)
        week_end = datetime.utcnow()
        
        detections = db.query(VehicleEvent).filter(
            VehicleEvent.timestamp >= week_start,
            VehicleEvent.timestamp <= week_end
        ).all()
        
        # Daily breakdown
        daily_stats = {}
        for det in detections:
            day = det.timestamp.date().isoformat()
            if day not in daily_stats:
                daily_stats[day] = {'total': 0, 'by_type': {}}
            daily_stats[day]['total'] += 1
            vtype = det.class_ or 'unknown'
            daily_stats[day]['by_type'][vtype] = daily_stats[day]['by_type'].get(vtype, 0) + 1
        
        return {
            "period": "7_days",
            "start_date": week_start.date().isoformat(),
            "end_date": week_end.date().isoformat(),
            "total_detections": len(detections),
            "unique_vehicles": len(set(d.track_id for d in detections if d.track_id)),
            "daily_breakdown": daily_stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting week summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
