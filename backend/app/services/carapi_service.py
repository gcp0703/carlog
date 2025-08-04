import httpx
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class CarAPIService:
    def __init__(self):
        self.base_url = settings.CARAPI_BASE_URL
        self.token = settings.CARAPI_TOKEN
        self.secret = settings.CARAPI_SECRET
        self._jwt_token: Optional[str] = None
        self._jwt_expires: Optional[datetime] = None
        self._client = httpx.AsyncClient(timeout=30.0)

    async def _authenticate(self) -> str:
        """Authenticate with CarAPI and get JWT token"""
        try:
            auth_data = {"api_token": self.token, "api_secret": self.secret}

            response = await self._client.post(
                f"{self.base_url}/auth/login",
                json=auth_data,
                headers={"Content-Type": "application/json"},
            )

            if response.status_code != 200:
                logger.error(
                    f"CarAPI authentication failed: {response.status_code} - {response.text}"
                )
                raise Exception(f"CarAPI authentication failed: {response.status_code}")

            # CarAPI returns JWT token as plain text, not JSON
            jwt_token = response.text.strip()

            if not jwt_token:
                raise Exception("No JWT token received from CarAPI")

            # Cache the token for 6 days (CarAPI tokens last 7 days)
            self._jwt_token = jwt_token
            self._jwt_expires = datetime.now() + timedelta(days=6)

            logger.info("CarAPI authentication successful")
            return jwt_token

        except Exception as e:
            logger.error(f"CarAPI authentication error: {str(e)}")
            raise

    async def _get_jwt_token(self) -> str:
        """Get valid JWT token, refreshing if necessary"""
        if (
            self._jwt_token is None
            or self._jwt_expires is None
            or datetime.now() >= self._jwt_expires
        ):
            await self._authenticate()

        if self._jwt_token is None:
            raise Exception("Failed to obtain JWT token")

        return self._jwt_token

    async def _make_request(
        self, endpoint: str, params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make authenticated request to CarAPI"""
        try:
            jwt_token = await self._get_jwt_token()
            headers = {
                "Authorization": f"Bearer {jwt_token}",
                "Content-Type": "application/json",
            }

            response = await self._client.get(
                f"{self.base_url}/{endpoint}", params=params, headers=headers
            )

            if response.status_code == 401:
                # Token might be expired, retry with fresh token
                logger.info("CarAPI token expired, refreshing...")
                self._jwt_token = None
                jwt_token = await self._get_jwt_token()
                headers["Authorization"] = f"Bearer {jwt_token}"

                response = await self._client.get(
                    f"{self.base_url}/{endpoint}", params=params, headers=headers
                )

            if response.status_code != 200:
                logger.error(
                    f"CarAPI request failed: {response.status_code} - {response.text}"
                )
                raise Exception(f"CarAPI request failed: {response.status_code}")

            return response.json()

        except Exception as e:
            logger.error(f"CarAPI request error: {str(e)}")
            raise

    async def get_years(self) -> List[Dict[str, Any]]:
        """Get available years from CarAPI"""
        try:
            data = await self._make_request("years")

            # CarAPI returns years as a simple list of integers
            if isinstance(data, list):
                years = data
            else:
                years = data.get("data", [])

            # Convert to objects and sort in descending order (newest first)
            years_objects = [{"year": year} for year in years]
            years_sorted = sorted(years_objects, key=lambda x: x["year"], reverse=True)

            return years_sorted

        except Exception as e:
            logger.error(f"Error fetching years: {str(e)}")
            raise

    async def get_makes(self, year: int) -> List[Dict[str, Any]]:
        """Get available makes for a specific year"""
        try:
            params = {"year": year}
            data = await self._make_request("makes", params)

            # CarAPI returns makes in a data field as objects with id and name
            if isinstance(data, dict) and "data" in data:
                makes_data = data["data"]
            else:
                makes_data = data

            # Convert to our expected format and sort alphabetically
            makes_objects = [
                {"make": make["name"], "make_id": make["id"]}
                for make in makes_data
                if "name" in make and "id" in make
            ]
            makes_sorted = sorted(makes_objects, key=lambda x: x["make"])

            return makes_sorted

        except Exception as e:
            logger.error(f"Error fetching makes for year {year}: {str(e)}")
            raise

    async def get_models(self, year: int, make: str) -> List[Dict[str, Any]]:
        """Get available models for a specific year and make"""
        try:
            params = {"year": year, "make": make}
            data = await self._make_request("models/v2", params)

            # CarAPI v2 returns models in a data field as objects with id and name
            if isinstance(data, dict) and "data" in data:
                models_data = data["data"]
            else:
                models_data = data

            # Convert to our expected format and sort alphabetically
            models_objects = [
                {"model": model["name"], "model_id": model["id"]}
                for model in models_data
                if "name" in model and "id" in model
            ]
            models_sorted = sorted(models_objects, key=lambda x: x["model"])

            return models_sorted

        except Exception as e:
            logger.error(f"Error fetching models for {year} {make}: {str(e)}")
            raise

    async def get_trims(self, year: int, make: str, model: str) -> List[Dict[str, Any]]:
        """Get available trims for a specific year, make, and model"""
        try:
            params = {"year": year, "make": make, "model": model}
            data = await self._make_request("trims/v2", params)

            # CarAPI v2 returns trims in a data field as objects with id and name
            if isinstance(data, dict) and "data" in data:
                trims_data = data["data"]
            else:
                trims_data = data

            # Convert to our expected format and sort alphabetically
            # CarAPI v2 trims have both "name" and "trim" fields, prefer "trim"
            trims_objects = [
                {"trim": trim.get("trim", trim.get("name", "")), "trim_id": trim["id"]}
                for trim in trims_data
                if (trim.get("trim") or trim.get("name")) and "id" in trim
            ]
            trims_sorted = sorted(trims_objects, key=lambda x: x["trim"])

            return trims_sorted

        except Exception as e:
            logger.error(f"Error fetching trims for {year} {make} {model}: {str(e)}")
            raise

    async def close(self):
        """Close the HTTP client"""
        await self._client.aclose()


# Global instance
carapi_service = CarAPIService()
