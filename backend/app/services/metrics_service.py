from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, timezone
from app.models.vehicle_event import VehicleEvent
from app.schemas.metrics import MetricsResponse, TimeSeriesPoint, MetricsTimeSeriesResponse
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)


class MetricsService:
    """
    Service for calculating and aggregating vehicle flow metrics.
    Provides time-based analytics and statistical analysis.
    """
    
    @staticmethod
    def calculate_metrics(
        db: Session,
        camera_id: Optional[str] = None,
        from_time: datetime = None,
        to_time: datetime = None,
        interval: int = 1
    ) -> MetricsResponse:
        """
        Calculate aggregated metrics for a time period.
        
        Args:
            db: Database session
            camera_id: Optional camera filter
            from_time: Start time for analysis
            to_time: End time for analysis
            interval: Time interval in minutes (not used for aggregate, but kept for API consistency)
            
        Returns:
            MetricsResponse with calculated metrics
        """
        # Default time range: last hour
        if to_time is None:
            to_time = datetime.now(timezone.utc)
        if from_time is None:
            from_time = to_time - timedelta(hours=1)
        
        # Build query
        query = db.query(VehicleEvent).filter(
            and_(
                VehicleEvent.timestamp >= from_time,
                VehicleEvent.timestamp <= to_time
            )
        )
        
        if camera_id:
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        # Get all events in range
        events = query.all()
        total_events = len(events)
        
        if total_events == 0:
            logger.info("No events found for the specified criteria")
            return MetricsResponse(
                camera_id=camera_id,
                from_time=from_time,
                to_time=to_time,
                total_events=0,
                vehicles_per_min=0.0,
                avg_dwell_time=0.0,
                queue_length=0,
                class_distribution={}
            )
        
        # Calculate time span in minutes
        time_span_minutes = (to_time - from_time).total_seconds() / 60.0
        vehicles_per_min = total_events / time_span_minutes if time_span_minutes > 0 else 0.0
        
        # Calculate average dwell time
        dwell_times = [e.dwell_seconds for e in events if e.dwell_seconds is not None]
        avg_dwell_time = sum(dwell_times) / len(dwell_times) if dwell_times else 0.0
        
        # Estimate queue length (vehicles with dwell time > 60 seconds)
        queue_length = sum(1 for dt in dwell_times if dt > 60)
        
        # Calculate class distribution
        class_distribution = {}
        for event in events:
            class_name = event.class_
            class_distribution[class_name] = class_distribution.get(class_name, 0) + 1
        
        logger.info(f"Calculated metrics: {total_events} events, {vehicles_per_min:.2f} veh/min")
        
        return MetricsResponse(
            camera_id=camera_id,
            from_time=from_time,
            to_time=to_time,
            total_events=total_events,
            vehicles_per_min=round(vehicles_per_min, 2),
            avg_dwell_time=round(avg_dwell_time, 2),
            queue_length=queue_length,
            class_distribution=class_distribution
        )
    
    @staticmethod
    def get_time_series(
        db: Session,
        camera_id: Optional[str] = None,
        from_time: datetime = None,
        to_time: datetime = None,
        interval: int = 1,
        metric_name: str = "vehicles_per_min"
    ) -> MetricsTimeSeriesResponse:
        """
        Get time series data for a specific metric.
        
        Args:
            db: Database session
            camera_id: Optional camera filter
            from_time: Start time
            to_time: End time
            interval: Time bucket interval in minutes
            metric_name: Name of metric to calculate
            
        Returns:
            MetricsTimeSeriesResponse with time series data
        """
        # Default time range: last hour
        if to_time is None:
            to_time = datetime.now(timezone.utc)
        if from_time is None:
            from_time = to_time - timedelta(hours=1)
        
        # Build query
        query = db.query(VehicleEvent).filter(
            and_(
                VehicleEvent.timestamp >= from_time,
                VehicleEvent.timestamp <= to_time
            )
        )
        
        if camera_id:
            query = query.filter(VehicleEvent.camera_id == camera_id)
        
        events = query.order_by(VehicleEvent.timestamp).all()
        
        # Create time buckets
        data_points: List[TimeSeriesPoint] = []
        current_time = from_time
        interval_delta = timedelta(minutes=interval)
        
        while current_time < to_time:
            bucket_end = current_time + interval_delta
            
            # Get events in this bucket
            bucket_events = [
                e for e in events
                if current_time <= e.timestamp < bucket_end
            ]
            
            # Calculate metric for bucket
            if metric_name == "vehicles_per_min":
                value = len(bucket_events) / interval
            elif metric_name == "avg_dwell_time":
                dwell_times = [e.dwell_seconds for e in bucket_events if e.dwell_seconds]
                value = sum(dwell_times) / len(dwell_times) if dwell_times else 0.0
            else:
                value = len(bucket_events)
            
            data_points.append(TimeSeriesPoint(
                timestamp=current_time,
                value=round(value, 2)
            ))
            
            current_time = bucket_end
        
        logger.info(f"Generated time series with {len(data_points)} data points")
        
        return MetricsTimeSeriesResponse(
            camera_id=camera_id,
            metric_name=metric_name,
            data_points=data_points
        )


# Global metrics service instance
metrics_service = MetricsService()
