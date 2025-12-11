from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import logging

from app.database import get_db
from app.models.operator_action import OperatorAction
from app.schemas.action import OperatorActionCreate, OperatorActionResponse
from app.services.websocket_manager import ws_manager
from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/actions", tags=["actions"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=OperatorActionResponse)
async def create_action(
    action: OperatorActionCreate,
    db: Session = Depends(get_db)
):
    """
    Record an operator action.
    
    - **operator_id**: Identifier of the operator
    - **action_type**: Type of action (e.g., extend_green_light, trigger_alert)
    - **params**: Additional action parameters
    - **camera_id**: Optional camera ID associated with action
    
    Returns the created action with ID and timestamp.
    """
    try:
        # Create database record
        db_action = OperatorAction(
            operator_id=action.operator_id,
            action_type=action.action_type,
            params=action.params,
            camera_id=action.camera_id
        )
        
        db.add(db_action)
        db.commit()
        db.refresh(db_action)
        
        logger.info(f"Created action: {action.action_type} by operator {action.operator_id}")
        
        # Publish to Redis
        try:
            redis_client.publish("action_requested", {
                "action_id": db_action.id,
                "operator_id": db_action.operator_id,
                "action_type": db_action.action_type,
                "params": db_action.params,
                "camera_id": db_action.camera_id,
                "timestamp": db_action.created_at.isoformat()
            })
        except Exception as e:
            logger.error(f"Failed to publish to Redis: {e}")
        
        # Broadcast via WebSocket
        try:
            await ws_manager.broadcast({
                "type": "action_requested",
                "data": {
                    "action_id": db_action.id,
                    "operator_id": db_action.operator_id,
                    "action_type": db_action.action_type,
                    "params": db_action.params,
                    "camera_id": db_action.camera_id,
                    "timestamp": db_action.created_at.isoformat()
                }
            })
        except Exception as e:
            logger.error(f"Failed to broadcast via WebSocket: {e}")
        
        return db_action
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating action: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create action: {str(e)}"
        )


@router.get("/", response_model=List[OperatorActionResponse])
async def get_actions(
    camera_id: str = None,
    operator_id: str = None,
    limit: int = 100,
    skip: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get operator actions with optional filtering.
    
    - **camera_id**: Optional camera filter
    - **operator_id**: Optional operator filter
    - **limit**: Maximum number of actions to return
    - **skip**: Number of actions to skip (pagination)
    """
    try:
        query = db.query(OperatorAction)
        
        if camera_id:
            query = query.filter(OperatorAction.camera_id == camera_id)
        
        if operator_id:
            query = query.filter(OperatorAction.operator_id == operator_id)
        
        actions = query.order_by(OperatorAction.created_at.desc()).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(actions)} actions")
        return actions
        
    except Exception as e:
        logger.error(f"Error retrieving actions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve actions: {str(e)}"
        )


@router.get("/stats", response_model=dict)
async def get_action_stats(
    camera_id: str = None,
    db: Session = Depends(get_db)
):
    """
    Get statistics about operator actions.
    
    - **camera_id**: Optional camera filter
    """
    try:
        from sqlalchemy import func
        
        query = db.query(
            OperatorAction.action_type,
            func.count(OperatorAction.id).label("count")
        )
        
        if camera_id:
            query = query.filter(OperatorAction.camera_id == camera_id)
        
        stats = query.group_by(OperatorAction.action_type).all()
        
        result = {
            "total_actions": sum(s.count for s in stats),
            "action_breakdown": {s.action_type: s.count for s in stats}
        }
        
        logger.info(f"Retrieved action stats: {result['total_actions']} total actions")
        return result
        
    except Exception as e:
        logger.error(f"Error getting action stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get action stats: {str(e)}"
        )
