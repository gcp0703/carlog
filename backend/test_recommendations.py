#!/usr/bin/env python3
"""Test the Claude recommendations API integration"""

import asyncio
import sys
from datetime import date, datetime

# Add the app directory to Python path
sys.path.append('.')

from app.services.claude_service import claude_service
from app.models.vehicle import Vehicle
from app.models.maintenance import Maintenance


async def test_recommendations():
    # Create a test vehicle
    test_vehicle = Vehicle(
        id="test-123",
        owner_id="user-123",
        brand="Toyota",
        model="Camry",
        year=2018,
        trim="LE",
        current_mileage=45000,
        usage_pattern="daily_commute"
    )
    
    # Create some test maintenance records
    test_records = [
        Maintenance(
            id="m1",
            vehicle_id="test-123",
            service_type="Oil Change",
            mileage=15000,
            service_date=date(2019, 6, 15),
            description="Regular oil change",
            cost=35.00,
            service_provider="Quick Lube",
            created_at=datetime.now()
        ),
        Maintenance(
            id="m2",
            vehicle_id="test-123",
            service_type="Tire Rotation",
            mileage=20000,
            service_date=date(2020, 1, 10),
            description="Rotated all 4 tires",
            cost=25.00,
            service_provider="Tire Shop",
            created_at=datetime.now()
        ),
        Maintenance(
            id="m3",
            vehicle_id="test-123",
            service_type="Oil Change",
            mileage=30000,
            service_date=date(2021, 3, 20),
            description="Synthetic oil change",
            cost=55.00,
            service_provider="Dealership",
            created_at=datetime.now()
        ),
        Maintenance(
            id="m4",
            vehicle_id="test-123",
            service_type="Brake Inspection",
            mileage=35000,
            service_date=date(2022, 1, 5),
            description="Checked brake pads and rotors",
            cost=0.00,
            service_provider="Dealership",
            created_at=datetime.now()
        ),
        Maintenance(
            id="m5",
            vehicle_id="test-123",
            service_type="Oil Change",
            mileage=40000,
            service_date=date(2023, 2, 15),
            description="Regular oil change",
            cost=40.00,
            service_provider="Quick Lube",
            created_at=datetime.now()
        )
    ]
    
    try:
        print("Testing Claude API integration...")
        print(f"\nVehicle: {test_vehicle.year} {test_vehicle.brand} {test_vehicle.model} {test_vehicle.trim}")
        print(f"Current Mileage: {test_vehicle.current_mileage:,} miles")
        print(f"Usage Pattern: {test_vehicle.usage_pattern.replace('_', ' ').title()}")
        print(f"\nMaintenance History ({len(test_records)} records):")
        
        # Display maintenance table
        print(claude_service._format_maintenance_table(test_records))
        
        print("\nFetching recommendations from Claude API...")
        recommendations, prompt, raw_response = await claude_service.get_maintenance_recommendations(test_vehicle, test_records)
        
        print("\n" + "="*80)
        print("RECOMMENDATIONS:")
        print("="*80)
        print(recommendations)
        print("="*80)
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_recommendations())