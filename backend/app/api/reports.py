from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import List, Optional
import logging
from io import BytesIO

from app.database import get_db
from app.models.report import GeneratedReport
from app.models.vehicle_event import VehicleEvent
from app.services.report_generator import report_generator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate")
async def generate_report(
    camera_id: str,
    report_type: str = "daily",
    db: Session = Depends(get_db)
):
    """
    Generate report using SAME data as Analytics page.
    Fetches all events for selected camera and calculates metrics.
    """
    
    try:
        # Fetch events EXACTLY like Analytics page does
        # Analytics calls: getEvents({ camera_id: selectedCamera, limit: 10000 })
        query = db.query(VehicleEvent)
        
        if camera_id and camera_id != 'all':
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        # Get all events (Analytics uses limit: 10000)
        events = query.order_by(VehicleEvent.timestamp.desc()).limit(10000).all()
        
        if not events:
            raise HTTPException(status_code=404, detail="No events found for this camera")
        
        # Calculate metrics EXACTLY like Analytics page
        total_vehicles = len(events)
        vehicle_counts = {'car': 0, 'truck': 0, 'bus': 0, 'motorcycle': 0}
        
        for event in events:
            vehicle_type = (event.class_ or '').lower()
            if vehicle_type in vehicle_counts:
                vehicle_counts[vehicle_type] += 1
        
        # Get date range from actual events
        start_date = min(event.timestamp for event in events) if events else datetime.now(timezone.utc)
        end_date = max(event.timestamp for event in events) if events else datetime.now(timezone.utc)
        
        metrics = {
            'camera_id': camera_id,
            'start_date': start_date.strftime('%Y-%m-%d %H:%M'),
            'end_date': end_date.strftime('%Y-%m-%d %H:%M'),
            'total_vehicles': total_vehicles,
            'cars': vehicle_counts['car'],
            'trucks': vehicle_counts['truck'],
            'buses': vehicle_counts['bus'],
            'motorcycles': vehicle_counts['motorcycle'],
            'car_percentage': (vehicle_counts['car'] / total_vehicles * 100) if total_vehicles > 0 else 0,
            'truck_percentage': (vehicle_counts['truck'] / total_vehicles * 100) if total_vehicles > 0 else 0,
            'bus_percentage': (vehicle_counts['bus'] / total_vehicles * 100) if total_vehicles > 0 else 0,
            'motorcycle_percentage': (vehicle_counts['motorcycle'] / total_vehicles * 100) if total_vehicles > 0 else 0,
        }
        
        # Generate report content with AI
        content = await report_generator.generate_report_content(report_type, metrics, events)
        
        # Generate PDF
        title = f"{report_type.replace('-', ' ').title()} Report"
        pdf_buffer = report_generator.generate_pdf(title, content, metrics)
        pdf_content = pdf_buffer.getvalue()
        
        # Generate report ID
        report_id = f"RPT-{datetime.now().strftime('%Y%m%d')}-{db.query(GeneratedReport).count() + 1:03d}"
        
        # Save to database
        db_report = GeneratedReport(
            report_id=report_id,
            title=title,
            report_type=report_type,
            camera_id=camera_id,
            start_date=start_date,
            end_date=end_date,
            summary=content.get('summary', ''),
            full_content=content.get('full_content', ''),
            metrics=metrics,
            pdf_content=pdf_content,
            file_size=len(pdf_content),
            status='completed'
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        logger.info(f"Generated report {report_id}")
        
        return {
            'success': True,
            'report_id': report_id,
            'title': title,
            'metrics': metrics,
            'file_size': len(pdf_content)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_reports(
    camera_id: Optional[str] = None,
    report_type: Optional[str] = None,
    filter_date: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all generated reports with real-time metrics and date filtering"""
    
    try:
        query = db.query(GeneratedReport)
        
        if camera_id:
            query = query.filter(GeneratedReport.camera_id == camera_id)
        
        if report_type:
            query = query.filter(GeneratedReport.report_type == report_type)
        
        # Add single date filtering - show all reports on this specific date
        if filter_date:
            try:
                # Parse the date and create start/end of day
                filter_dt = datetime.strptime(filter_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                start_of_day = filter_dt.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_day = filter_dt.replace(hour=23, minute=59, second=59, microsecond=999999)
                query = query.filter(
                    GeneratedReport.created_at >= start_of_day,
                    GeneratedReport.created_at <= end_of_day
                )
            except ValueError:
                logger.warning(f"Invalid filter_date format: {filter_date}")
        
        reports = query.order_by(GeneratedReport.created_at.desc()).limit(limit).all()
        
        result = []
        for report in reports:
            metrics_data = report.metrics if report.metrics else {}
            
            # Calculate efficiency based on vehicle distribution
            total = metrics_data.get('total_vehicles', 0)
            cars = metrics_data.get('cars', 0)
            efficiency = int((cars / total * 100)) if total > 0 else 0
            
            # Get queue data from database for this camera and time range
            queue_events = db.query(VehicleEvent).filter(
                VehicleEvent.camera_id == report.camera_id,
                VehicleEvent.timestamp >= report.start_date,
                VehicleEvent.timestamp <= report.end_date,
                VehicleEvent.class_.in_(['truck', 'bus'])
            ).count()
            
            avg_queue = queue_events
            
            # Count potential incidents (high confidence detections in short time)
            incidents = 0
            
            result.append({
                'id': report.report_id,
                'title': report.title,
                'type': report.report_type,
                'camera_id': report.camera_id,
                'date': report.start_date.strftime('%Y-%m-%d'),
                'timeRange': f"{report.start_date.strftime('%Y-%m-%d')} - {report.end_date.strftime('%Y-%m-%d')}",
                'status': report.status,
                'size': f"{report.file_size / 1024:.1f} KB" if report.file_size else 'N/A',
                'created_at': report.created_at.isoformat() if report.created_at else None,
                'metrics': {
                    'vehicles': total,
                    'cars': cars,
                    'trucks': metrics_data.get('trucks', 0),
                    'buses': metrics_data.get('buses', 0),
                    'motorcycles': metrics_data.get('motorcycles', 0),
                    'efficiency': efficiency,
                    'avgQueue': avg_queue,
                    'incidents': incidents
                }
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Error listing reports: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preview/{report_id}")
async def preview_report(report_id: str, db: Session = Depends(get_db)):
    """Preview a report's content without downloading"""
    
    try:
        report = db.query(GeneratedReport).filter(
            GeneratedReport.report_id == report_id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {
            'report_id': report.report_id,
            'title': report.title,
            'report_type': report.report_type,
            'camera_id': report.camera_id,
            'date_range': f"{report.start_date.strftime('%Y-%m-%d %H:%M')} - {report.end_date.strftime('%Y-%m-%d %H:%M')}",
            'summary': report.summary,
            'full_content': report.full_content,
            'metrics': report.metrics,
            'status': report.status,
            'created_at': report.created_at.isoformat() if report.created_at else None,
            'file_size': f"{report.file_size / 1024:.1f} KB" if report.file_size else 'N/A'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error previewing report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{report_id}")
async def download_report(report_id: str, db: Session = Depends(get_db)):
    """Download a generated report as PDF"""
    
    try:
        report = db.query(GeneratedReport).filter(
            GeneratedReport.report_id == report_id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        if not report.pdf_content:
            raise HTTPException(status_code=404, detail="PDF content not available")
        
        # Return PDF as streaming response
        pdf_buffer = BytesIO(report.pdf_content)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={report.report_id}.pdf"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{report_id}")
async def delete_report(report_id: str, db: Session = Depends(get_db)):
    """Delete a report by ID"""
    
    try:
        report = db.query(GeneratedReport).filter(
            GeneratedReport.report_id == report_id
        ).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        db.delete(report)
        db.commit()
        
        logger.info(f"Deleted report {report_id}")
        return {"success": True, "message": f"Report {report_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting report: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-today")
async def generate_today_report(
    camera_id: str,
    db: Session = Depends(get_db)
):
    """Auto-generate a new report with today's real-time data"""
    
    try:
        # Get today's date range
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        now = datetime.now(timezone.utc)
        
        # Fetch TODAY's events only
        query = db.query(VehicleEvent).filter(
            VehicleEvent.timestamp >= today,
            VehicleEvent.timestamp <= now
        )
        
        if camera_id and camera_id != 'all':
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        events = query.order_by(VehicleEvent.timestamp.desc()).all()
        
        if not events:
            raise HTTPException(status_code=404, detail="No events found for today")
        
        # Calculate metrics from TODAY's data
        total_vehicles = len(events)
        vehicle_counts = {'car': 0, 'truck': 0, 'bus': 0, 'motorcycle': 0}
        
        for event in events:
            vehicle_type = (event.class_ or '').lower()
            if vehicle_type in vehicle_counts:
                vehicle_counts[vehicle_type] += 1
        
        metrics = {
            'camera_id': camera_id,
            'start_date': today.strftime('%Y-%m-%d %H:%M'),
            'end_date': now.strftime('%Y-%m-%d %H:%M'),
            'total_vehicles': total_vehicles,
            'cars': vehicle_counts['car'],
            'trucks': vehicle_counts['truck'],
            'buses': vehicle_counts['bus'],
            'motorcycles': vehicle_counts['motorcycle'],
            'car_percentage': (vehicle_counts['car'] / total_vehicles * 100) if total_vehicles > 0 else 0,
            'truck_percentage': (vehicle_counts['truck'] / total_vehicles * 100) if total_vehicles > 0 else 0,
            'bus_percentage': (vehicle_counts['bus'] / total_vehicles * 100) if total_vehicles > 0 else 0,
            'motorcycle_percentage': (vehicle_counts['motorcycle'] / total_vehicles * 100) if total_vehicles > 0 else 0,
        }
        
        # Generate report content with AI
        content = await report_generator.generate_report_content('daily', metrics, events)
        
        # Generate PDF
        title = f"Daily Report - {today.strftime('%Y-%m-%d')}"
        pdf_buffer = report_generator.generate_pdf(title, content, metrics)
        pdf_content = pdf_buffer.getvalue()
        
        # Generate report ID with timestamp to ensure uniqueness
        today_str = datetime.now().strftime('%Y%m%d')
        today_count = db.query(GeneratedReport).filter(
            GeneratedReport.report_id.like(f'RPT-{today_str}%')
        ).count()
        report_id = f"RPT-{today_str}-{today_count + 1:03d}"
        
        # Save to database
        db_report = GeneratedReport(
            report_id=report_id,
            title=title,
            report_type='daily',
            camera_id=camera_id,
            start_date=today,
            end_date=now,
            summary=content.get('summary', ''),
            full_content=content.get('full_content', ''),
            metrics=metrics,
            pdf_content=pdf_content,
            file_size=len(pdf_content),
            status='completed'
        )
        
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        logger.info(f"Generated today's report {report_id} with {total_vehicles} vehicles")
        
        return {
            'success': True,
            'report_id': report_id,
            'title': title,
            'metrics': metrics,
            'message': f"Generated report with {total_vehicles} vehicles from today"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating today's report: {e}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_report_stats(
    camera_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get real-time statistics from live vehicle detection data (matches Analytics page)"""
    
    try:
        # Fetch live vehicle events (same as Analytics page)
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        query = db.query(VehicleEvent).filter(
            VehicleEvent.timestamp >= today
        )
        
        if camera_id:
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        events = query.all()
        
        # Calculate vehicle counts by type (same logic as Analytics page)
        total_vehicles = len(events)
        vehicle_counts = {'car': 0, 'truck': 0, 'bus': 0, 'motorcycle': 0}
        
        for event in events:
            vehicle_type = (event.class_ or '').lower()
            if vehicle_type in vehicle_counts:
                vehicle_counts[vehicle_type] += 1
        
        # Calculate efficiency (cars as percentage of total)
        cars_detected = vehicle_counts['car']
        cars_percentage = (cars_detected / total_vehicles * 100) if total_vehicles > 0 else 0
        
        # Commercial vehicles (trucks + buses)
        commercial_vehicles = vehicle_counts['truck'] + vehicle_counts['bus']
        
        # Report statistics
        total_reports = db.query(GeneratedReport).count()
        completed_reports = db.query(GeneratedReport).filter(
            GeneratedReport.status == 'completed'
        ).count()
        
        return {
            'total_reports': total_reports,
            'completed': completed_reports,
            'total_vehicles': total_vehicles,
            'cars_detected': cars_detected,
            'cars_percentage': round(cars_percentage, 1),
            'trucks_buses': commercial_vehicles,
            'motorcycles': vehicle_counts['motorcycle'],
            'avg_efficiency': int(cars_percentage)
        }
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
