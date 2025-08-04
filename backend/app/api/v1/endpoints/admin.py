from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.user import User
from app.models.recommendation import ClaudeAPILog
from app.services.neo4j_service import neo4j_service
from app.utils.deps import get_current_user

router = APIRouter()


@router.get("/claude-logs", response_model=List[ClaudeAPILog])
async def get_claude_api_logs(
    limit: int = 100,
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get Claude API logs (admin only)"""
    # For now, we'll allow any authenticated user to view logs
    # In production, you'd want to check for admin privileges
    try:
        logs = await neo4j_service.get_claude_api_logs(limit=limit)
        return logs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve logs: {str(e)}"
        )