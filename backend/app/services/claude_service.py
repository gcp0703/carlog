import httpx
import logging
from typing import List, Tuple

from app.core.config import settings
from app.models.vehicle import Vehicle
from app.models.maintenance import Maintenance


class ClaudeService:
    def __init__(self):
        self.api_key = settings.CLAUDE_API_KEY
        self.api_url = "https://api.anthropic.com/v1/messages"
        self.logger = logging.getLogger(__name__)

    async def get_maintenance_recommendations(
        self, vehicle: Vehicle, maintenance_records: List[Maintenance]
    ) -> Tuple[str, str, str]:
        """Get maintenance recommendations from Claude API for a specific vehicle"""

        if not self.api_key:
            raise ValueError("Claude API key not configured")

        # Format maintenance records for the prompt
        maintenance_table = self._format_maintenance_table(maintenance_records)

        # Build comprehensive vehicle information
        vehicle_desc = f"{vehicle.year} {vehicle.brand} {vehicle.model}"
        if vehicle.trim:
            vehicle_desc += f" {vehicle.trim}"

        # Build detailed vehicle info section
        vehicle_info = f"Vehicle: {vehicle_desc}\n"

        if vehicle.current_mileage:
            vehicle_info += f"Current Mileage: {vehicle.current_mileage:,} miles\n"

        if vehicle.usage_pattern:
            usage_type = vehicle.usage_pattern.replace("_", " ").title()
            vehicle_info += f"Usage Type: {usage_type}\n"

        if vehicle.vin:
            vehicle_info += f"VIN: {vehicle.vin}\n"

        if vehicle.license_plate:
            license_info = vehicle.license_plate
            if vehicle.license_state:
                license_info = f"{vehicle.license_state} {license_info}"
            vehicle_info += f"License: {license_info}\n"

        if vehicle.zip_code:
            vehicle_info += f"Location (ZIP): {vehicle.zip_code}\n"

        if vehicle.usage_notes:
            vehicle_info += f"Owner Notes: {vehicle.usage_notes}\n"

        prompt = f"""Please provide detailed maintenance recommendations for this vehicle:

{vehicle_info}
Maintenance History:
{maintenance_table}

Please organize your recommendations in the following format:
1. Immediate/Soon (0-5,000 miles): List urgent items that need attention
2. Next Service (5,000-15,000 miles): List upcoming maintenance items
3. Future Services (15,000+ miles): List long-term maintenance planning
4. Regular Maintenance Schedule: List routine maintenance intervals
5. Model-Specific Recommendations: Include any known issues for this {vehicle.year} {vehicle.brand} {vehicle.model}.

Please be specific about mileage intervals and include estimated costs where appropriate."""

        # Make API request
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.api_url,
                    headers={
                        "x-api-key": self.api_key,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-3-5-sonnet-20241022",
                        "max_tokens": 1024,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                    timeout=30.0,
                )

                response.raise_for_status()

                result = response.json()
                if "content" in result and len(result["content"]) > 0:
                    response_text = result["content"][0]["text"]
                    # Return response text, prompt, and full response for logging
                    return response_text, prompt, response.text
                else:
                    raise ValueError("Unexpected response format from Claude API")

            except httpx.HTTPStatusError as e:
                self.logger.error(f"Claude API HTTP error: {e}")
                raise Exception(f"Failed to get recommendations: {str(e)}")
            except Exception as e:
                self.logger.error(f"Claude API error: {e}")
                raise Exception(f"Failed to get recommendations: {str(e)}")

    def _format_maintenance_table(self, records: List[Maintenance]) -> str:
        """Format maintenance records as a table for the prompt"""

        if not records:
            return "No maintenance records available"

        # Build table header
        table = "Date | Mileage | Service Type | Description/Notes | Cost | Provider\n"
        table += "-" * 90 + "\n"

        # Add records
        for record in sorted(records, key=lambda r: r.service_date, reverse=True):
            date_str = record.service_date.strftime("%Y-%m-%d")
            mileage_str = f"{record.mileage:,}" if record.mileage else "N/A"
            # Include full description/notes without truncation for AI context
            desc_str = record.description or "N/A"
            cost_str = f"${record.cost:.2f}" if record.cost else "N/A"
            provider_str = record.service_provider or "N/A"

            table += f"{date_str} | {mileage_str} | {record.service_type} | {desc_str} | {cost_str} | {provider_str}\n"

        return table


claude_service = ClaudeService()
