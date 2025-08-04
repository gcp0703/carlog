from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.models.vehicle import Vehicle, VehicleCreate, VehicleUpdate
from app.models.user import User
from app.services.neo4j_service import neo4j_service
from app.services.carapi_service import carapi_service
from app.services.claude_service import claude_service
from app.utils.deps import get_current_user

router = APIRouter()


@router.get("/", response_model=List[Vehicle])
async def read_vehicles(current_user: User = Depends(get_current_user)) -> Any:
    """Get all vehicles for the current user"""
    try:
        vehicles = await neo4j_service.get_user_vehicles(current_user.id)
        return vehicles
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve vehicles: {str(e)}",
        )


@router.post("/", response_model=Vehicle)
async def create_vehicle(
    vehicle: VehicleCreate, current_user: User = Depends(get_current_user)
) -> Any:
    """Create a new vehicle for the current user"""
    try:
        new_vehicle = await neo4j_service.create_vehicle(current_user.id, vehicle)
        return new_vehicle
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create vehicle: {str(e)}",
        )


@router.get("/{vehicle_id}", response_model=Vehicle)
async def read_vehicle(
    vehicle_id: str, current_user: User = Depends(get_current_user)
) -> Any:
    """Get a specific vehicle by ID"""
    try:
        vehicle = await neo4j_service.get_vehicle_by_id(vehicle_id, current_user.id)
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
            )
        return vehicle
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve vehicle: {str(e)}",
        )


@router.put("/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(
    vehicle_id: str,
    vehicle: VehicleUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update a vehicle"""
    try:
        # Convert VehicleUpdate to dict, excluding None values
        update_data = vehicle.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided",
            )

        updated_vehicle = await neo4j_service.update_vehicle(
            vehicle_id, current_user.id, update_data
        )
        if not updated_vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
            )
        return updated_vehicle
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update vehicle: {str(e)}",
        )


@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: str, current_user: User = Depends(get_current_user)
) -> Any:
    """Delete a vehicle"""
    try:
        deleted = await neo4j_service.delete_vehicle(vehicle_id, current_user.id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
            )
        return {"message": "Vehicle deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete vehicle: {str(e)}",
        )


# CarAPI endpoints for vehicle data
@router.get("/carapi/years")
async def get_years(current_user: User = Depends(get_current_user)) -> Any:
    """Get available years from CarAPI"""
    try:
        years = await carapi_service.get_years()
        return {"data": years}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch years: {str(e)}",
        )


@router.get("/carapi/makes")
async def get_makes(year: int, current_user: User = Depends(get_current_user)) -> Any:
    """Get available makes for a specific year"""
    try:
        makes = await carapi_service.get_makes(year)
        return {"data": makes}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch makes for year {year}: {str(e)}",
        )


@router.get("/carapi/models")
async def get_models(
    year: int, make: str, current_user: User = Depends(get_current_user)
) -> Any:
    """Get available models for a specific year and make"""
    try:
        models = await carapi_service.get_models(year, make)
        return {"data": models}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch models for {year} {make}: {str(e)}",
        )


@router.get("/carapi/trims")
async def get_trims(
    year: int, make: str, model: str, current_user: User = Depends(get_current_user)
) -> Any:
    """Get available trims for a specific year, make, and model"""
    try:
        trims = await carapi_service.get_trims(year, make, model)
        return {"data": trims}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch trims for {year} {make} {model}: {str(e)}",
        )


@router.get("/{vehicle_id}/recommendations")
async def get_vehicle_recommendations(
    vehicle_id: str, current_user: User = Depends(get_current_user)
) -> Any:
    """Get AI-powered maintenance recommendations for a specific vehicle"""
    try:
        # Get the vehicle
        vehicle = await neo4j_service.get_vehicle_by_id(vehicle_id, current_user.id)
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found"
            )

        # Check for cached recommendation first
        cached_recommendation = await neo4j_service.get_cached_recommendation(
            vehicle_id
        )
        if cached_recommendation:
            return {
                "vehicle_id": vehicle_id,
                "recommendations": cached_recommendation.recommendations,
                "cached": True,
                "generated_at": cached_recommendation.created_at.isoformat(),
            }

        # Get maintenance records
        maintenance_records = await neo4j_service.get_maintenance_records(vehicle_id)
        maintenance_count = len(maintenance_records)

        # Get recommendations from Claude
        (
            recommendations,
            prompt,
            raw_response,
        ) = await claude_service.get_maintenance_recommendations(
            vehicle, maintenance_records
        )

        # Save the API log
        await neo4j_service.save_claude_api_log(
            vehicle_id=vehicle_id,
            request_prompt=prompt,
            response_text=raw_response,
            model_used="claude-3-5-sonnet-20241022",
        )

        # Save the recommendation to cache
        saved_recommendation = await neo4j_service.save_recommendation(
            vehicle_id=vehicle_id,
            recommendations=recommendations,
            vehicle_mileage=vehicle.current_mileage or 0,
            maintenance_count=maintenance_count,
        )

        return {
            "vehicle_id": vehicle_id,
            "recommendations": recommendations,
            "cached": False,
            "generated_at": saved_recommendation.created_at.isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}",
        )
