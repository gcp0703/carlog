from typing import Any, List
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.maintenance import (
    Maintenance,
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceSchedule,
)
from app.models.user import User
from app.services.neo4j_service import neo4j_service
from app.utils.deps import get_current_user

router = APIRouter()


@router.get("/records/{vehicle_id}", response_model=List[Maintenance])
async def read_maintenance_records(
    vehicle_id: str, current_user: User = Depends(get_current_user)
) -> Any:
    """Get all maintenance records for a vehicle"""
    try:
        # Verify user owns the vehicle
        vehicles = await neo4j_service.get_user_vehicles(current_user.id)
        if not any(v.id == vehicle_id for v in vehicles):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
            )

        records = await neo4j_service.get_maintenance_records(vehicle_id)
        return records
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve maintenance records: {str(e)}",
        )


@router.post("/records", response_model=Maintenance)
async def create_maintenance_record(
    record: MaintenanceCreate, current_user: User = Depends(get_current_user)
) -> Any:
    """Create a new maintenance record"""
    try:
        # Verify user owns the vehicle
        vehicles = await neo4j_service.get_user_vehicles(current_user.id)
        if not any(v.id == record.vehicle_id for v in vehicles):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
            )

        # Create the maintenance record
        maintenance_id = str(uuid.uuid4())
        created_at = datetime.utcnow()

        maintenance_record = Maintenance(
            id=maintenance_id,
            vehicle_id=record.vehicle_id,
            service_type=record.service_type,
            mileage=record.mileage,
            service_date=record.service_date,
            description=record.description,
            cost=record.cost,
            service_provider=record.service_provider,
            created_at=created_at,
        )

        # Save to Neo4j
        await neo4j_service.create_maintenance_record(maintenance_record)

        # Update vehicle mileage if this is the latest service
        await neo4j_service.update_vehicle_mileage_if_higher(
            record.vehicle_id, record.mileage
        )

        return maintenance_record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create maintenance record: {str(e)}",
        )


@router.put("/records/{record_id}", response_model=Maintenance)
async def update_maintenance_record(record_id: str, record: MaintenanceUpdate) -> Any:
    # TODO: Implement maintenance record update
    return {
        "message": f"Update maintenance record {record_id} endpoint - to be implemented"
    }


@router.delete("/records/{record_id}")
async def delete_maintenance_record(record_id: str) -> Any:
    # TODO: Implement maintenance record deletion
    return {
        "message": f"Delete maintenance record {record_id} endpoint - to be implemented"
    }


@router.get("/schedule/{vehicle_id}", response_model=List[MaintenanceSchedule])
async def get_maintenance_schedule(vehicle_id: str) -> Any:
    # TODO: Implement maintenance schedule retrieval
    return []


@router.post("/schedule/{vehicle_id}")
async def update_maintenance_schedule(
    vehicle_id: str, schedule: List[MaintenanceSchedule]
) -> Any:
    # TODO: Implement maintenance schedule update
    return {
        "message": f"Update maintenance schedule for vehicle {vehicle_id} - to be implemented"
    }
