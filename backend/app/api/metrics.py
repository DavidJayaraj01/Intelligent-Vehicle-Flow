from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import logging

from app.database import get_db
from app.schemas.metrics import MetricsResponse, MetricsTimeSeriesResponse
from app.services.metrics_service import metrics_service
from app.services.decision_engine import decision_engine
from app.services.websocket_manager import ws_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/", response_model=MetricsResponse)
async def get_metrics(
    camera_id: Optional[str] = Query(None, description="Filter by camera ID"),
    from_time: Optional[datetime] = Query(None, description="Start time (ISO format)"),
    to_time: Optional[datetime] = Query(None, description="End time (ISO format)"),
    interval: int = Query(1, ge=1, le=60, description="Time interval in minutes"),
    db: Session = Depends(get_db)
):
    """
    Get aggregated traffic metrics for a time period.
    
    - **camera_id**: Optional camera filter
    - **from_time**: Start time (defaults to 1 hour ago)
    - **to_time**: End time (defaults to now)
    - **interval**: Time interval in minutes for grouping
    
    Returns aggregated metrics including vehicles/min, dwell time, queue length.
    """
    try:
        # Calculate metrics
        metrics = metrics_service.calculate_metrics(
            db=db,
            camera_id=camera_id,
            from_time=from_time,
            to_time=to_time,
            interval=interval
        )
        
        # Analyze metrics and generate recommendations
        try:
            recommendation = decision_engine.analyze_metrics(
                metrics=metrics.dict(),
                camera_id=camera_id
            )
            
            if recommendation:
                # Broadcast recommendation via WebSocket
                await ws_manager.broadcast({
                    "type": "recommendation",
                    "data": recommendation.dict(),
                    "timestamp": datetime.utcnow().isoformat()
                })
                logger.info(f"Generated recommendation: {recommendation.type}")
        except Exception as e:
            logger.error(f"Error analyzing metrics: {e}")
        
        return metrics
        
    except Exception as e:
        logger.error(f"Error calculating metrics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate metrics: {str(e)}"
        )


@router.get("/timeseries", response_model=MetricsTimeSeriesResponse)
async def get_timeseries(
    metric_name: str = Query("vehicles_per_min", description="Metric name"),
    camera_id: Optional[str] = Query(None, description="Filter by camera ID"),
    from_time: Optional[datetime] = Query(None, description="Start time"),
    to_time: Optional[datetime] = Query(None, description="End time"),
    interval: int = Query(1, ge=1, le=60, description="Time interval in minutes"),
    db: Session = Depends(get_db)
):
    """
    Get time series data for a specific metric.
    
    - **metric_name**: Name of metric (vehicles_per_min, avg_dwell_time)
    - **camera_id**: Optional camera filter
    - **from_time**: Start time
    - **to_time**: End time
    - **interval**: Time bucket interval in minutes
    """
    try:
        time_series = metrics_service.get_time_series(
            db=db,
            camera_id=camera_id,
            from_time=from_time,
            to_time=to_time,
            interval=interval,
            metric_name=metric_name
        )
        
        # Broadcast update via WebSocket
        await ws_manager.broadcast({
            "type": "kpi_update",
            "metric_name": metric_name,
            "latest_value": time_series.data_points[-1].value if time_series.data_points else 0,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return time_series
        
    except Exception as e:
        logger.error(f"Error getting time series: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get time series: {str(e)}"
        )
