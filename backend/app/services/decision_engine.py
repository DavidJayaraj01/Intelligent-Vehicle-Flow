from app.schemas.action import RecommendedAction
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class DecisionEngine:
    """
    Simple rule-based decision engine for traffic management.
    Analyzes metrics and generates recommended actions.
    """
    
    # Thresholds for decision making
    HIGH_TRAFFIC_THRESHOLD = 50  # vehicles per minute
    HIGH_DWELL_TIME_THRESHOLD = 300  # seconds (5 minutes)
    QUEUE_LENGTH_THRESHOLD = 10  # vehicles
    
    @staticmethod
    def analyze_metrics(metrics: dict, camera_id: Optional[str] = None) -> Optional[RecommendedAction]:
        """
        Analyze traffic metrics and generate recommended actions.
        
        Args:
            metrics: Dictionary containing traffic metrics
            camera_id: Optional camera identifier
            
        Returns:
            RecommendedAction or None if no action needed
        """
        vehicles_per_min = metrics.get("vehicles_per_min", 0)
        avg_dwell_time = metrics.get("avg_dwell_time", 0)
        queue_length = metrics.get("queue_length", 0)
        
        # Rule 1: High traffic volume
        if vehicles_per_min > DecisionEngine.HIGH_TRAFFIC_THRESHOLD:
            logger.info(f"High traffic detected: {vehicles_per_min} vehicles/min")
            return RecommendedAction(
                type="extend_green_light",
                description=f"High traffic volume detected ({vehicles_per_min:.1f} vehicles/min). Consider extending green light duration.",
                params={
                    "duration_seconds": 30,
                    "reason": "high_traffic_volume",
                    "vehicles_per_min": vehicles_per_min
                },
                confidence=min(0.9, (vehicles_per_min / DecisionEngine.HIGH_TRAFFIC_THRESHOLD) * 0.8),
                camera_id=camera_id
            )
        
        # Rule 2: High dwell time (potential congestion)
        if avg_dwell_time > DecisionEngine.HIGH_DWELL_TIME_THRESHOLD:
            logger.info(f"High dwell time detected: {avg_dwell_time} seconds")
            return RecommendedAction(
                type="trigger_congestion_alert",
                description=f"High average dwell time ({avg_dwell_time:.1f}s). Possible congestion detected.",
                params={
                    "alert_level": "warning",
                    "avg_dwell_time": avg_dwell_time,
                    "reason": "high_dwell_time"
                },
                confidence=min(0.85, (avg_dwell_time / DecisionEngine.HIGH_DWELL_TIME_THRESHOLD) * 0.75),
                camera_id=camera_id
            )
        
        # Rule 3: Long queue
        if queue_length > DecisionEngine.QUEUE_LENGTH_THRESHOLD:
            logger.info(f"Long queue detected: {queue_length} vehicles")
            return RecommendedAction(
                type="optimize_signal_timing",
                description=f"Queue length ({queue_length} vehicles) exceeds threshold. Consider signal timing optimization.",
                params={
                    "queue_length": queue_length,
                    "suggested_adjustment": "increase_green_phase",
                    "reason": "queue_buildup"
                },
                confidence=0.8,
                camera_id=camera_id
            )
        
        # No action needed
        logger.debug("No action recommended - metrics within normal range")
        return None
    
    @staticmethod
    def evaluate_action_effectiveness(
        before_metrics: dict,
        after_metrics: dict,
        action_type: str
    ) -> dict:
        """
        Evaluate the effectiveness of an action by comparing metrics.
        
        Args:
            before_metrics: Metrics before action
            after_metrics: Metrics after action
            action_type: Type of action taken
            
        Returns:
            Dictionary with effectiveness analysis
        """
        improvement = {
            "vehicles_per_min_change": after_metrics.get("vehicles_per_min", 0) - before_metrics.get("vehicles_per_min", 0),
            "dwell_time_change": after_metrics.get("avg_dwell_time", 0) - before_metrics.get("avg_dwell_time", 0),
            "queue_length_change": after_metrics.get("queue_length", 0) - before_metrics.get("queue_length", 0)
        }
        
        # Simple effectiveness score (negative changes are good for dwell time and queue)
        effectiveness_score = 0.0
        if improvement["dwell_time_change"] < 0:
            effectiveness_score += 0.3
        if improvement["queue_length_change"] < 0:
            effectiveness_score += 0.4
        if improvement["vehicles_per_min_change"] > 0:
            effectiveness_score += 0.3
        
        return {
            "action_type": action_type,
            "effectiveness_score": effectiveness_score,
            "improvements": improvement,
            "status": "effective" if effectiveness_score > 0.5 else "ineffective"
        }


# Global decision engine instance
decision_engine = DecisionEngine()
