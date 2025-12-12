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
    report_type: str,
    days: int = 1,
    db: Session = Depends(get_db)
):
    """Generate a new report using Gemini AI"""
    
    try:
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Fetch events
        events = db.query(VehicleEvent).filter(
            VehicleEvent.camera_id == camera_id,
            VehicleEvent.timestamp >= start_date,
            VehicleEvent.timestamp <= end_date
        ).all()
        
        if not events:
            raise HTTPException(status_code=404, detail="No events found for the specified period")
        
        # Calculate metrics
        total_vehicles = len(events)
        vehicle_counts = {'car': 0, 'truck': 0, 'bus': 0, 'motorcycle': 0}
        
        for event in events:
            vehicle_type = (event.class_ or '').lower()
            if vehicle_type in vehicle_counts:
                vehicle_counts[vehicle_type] += 1
        
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
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all generated reports"""
    
    try:
        query = db.query(GeneratedReport)
        
        if camera_id:
            query = query.filter(GeneratedReport.camera_id == camera_id)
        
        if report_type:
            query = query.filter(GeneratedReport.report_type == report_type)
        
        reports = query.order_by(GeneratedReport.created_at.desc()).limit(limit).all()
        
        return [{
            'id': report.report_id,
            'title': report.title,
            'type': report.report_type,
            'date': report.start_date.strftime('%Y-%m-%d'),
            'timeRange': f"{report.start_date.strftime('%Y-%m-%d')} - {report.end_date.strftime('%Y-%m-%d')}",
            'status': report.status,
            'size': f"{report.file_size / 1024:.1f} KB" if report.file_size else 'N/A',
            'metrics': {
                'vehicles': report.metrics.get('total_vehicles', 0) if report.metrics else 0,
                'efficiency': 87,
                'avgQueue': 0,
                'incidents': 0
            }
        } for report in reports]
        
    except Exception as e:
        logger.error(f"Error listing reports: {e}")
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
