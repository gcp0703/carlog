import logging
import uuid
from typing import Optional, Dict, Any, List
from neo4j import GraphDatabase
from neo4j.exceptions import Neo4jError, ConstraintError

from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models.user import UserCreate, User, UserInDB
from app.models.vehicle import VehicleCreate, Vehicle, VehicleUpdate


class Neo4jService:
    def __init__(self):
        self.driver = None
        self.logger = logging.getLogger(__name__)

    def connect(self):
        # Support both authenticated and non-authenticated Neo4j
        if settings.NEO4J_PASSWORD:
            auth = (settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        else:
            auth = None  # No authentication

        self.driver = GraphDatabase.driver(settings.NEO4J_URI, auth=auth)

    def close(self):
        if self.driver:
            self.driver.close()

    def get_session(self):
        if not self.driver:
            self.connect()
        return self.driver.session()

    # User management methods
    async def create_user(self, user_data: UserCreate) -> UserInDB:
        """Create a new user in Neo4j"""
        user_id = str(uuid.uuid4())
        self.logger.info(f"Creating user with ID {user_id} for email {user_data.email}")
        
        try:
            hashed_password = get_password_hash(user_data.password)
            self.logger.debug(f"Password hashed successfully for user {user_data.email}")
        except Exception as e:
            self.logger.error(f"Failed to hash password for {user_data.email}: {e}")
            raise Exception(f"Password hashing failed: {str(e)}")
        
        try:
            with self.get_session() as session:
                # First check if email already exists (in case of race condition)
                check_result = session.run(
                    "MATCH (u:User {email: $email}) RETURN u",
                    email=user_data.email
                )
                if check_result.single():
                    self.logger.warning(f"Attempted to create duplicate user with email {user_data.email}")
                    raise Exception("Email already exists")
                
                # Create the user
                result = session.run(
                    """
                    CREATE (u:User {
                        id: $id,
                        email: $email,
                        hashed_password: $hashed_password,
                        phone_number: $phone_number,
                        zip_code: $zip_code,
                        email_notifications_enabled: $email_notifications_enabled,
                        sms_notifications_enabled: $sms_notifications_enabled,
                        account_active: $account_active
                    })
                    RETURN u
                    """,
                    id=user_id,
                    email=user_data.email,
                    hashed_password=hashed_password,
                    phone_number=user_data.phone_number,
                    zip_code=user_data.zip_code,
                    email_notifications_enabled=user_data.email_notifications_enabled,
                    sms_notifications_enabled=user_data.sms_notifications_enabled,
                    account_active=user_data.account_active
                )
                
                record = result.single()
                if record:
                    node = record["u"]
                    self.logger.info(f"User created successfully in database with ID {user_id}")
                    return UserInDB(
                        id=node["id"],
                        email=node["email"],
                        hashed_password=node["hashed_password"],
                        phone_number=node.get("phone_number"),
                        zip_code=node.get("zip_code"),
                        email_notifications_enabled=node.get("email_notifications_enabled", True),
                        sms_notifications_enabled=node.get("sms_notifications_enabled", True),
                        account_active=node.get("account_active", True)
                    )
                else:
                    self.logger.error(f"No record returned after creating user {user_data.email}")
                    raise Exception("Failed to create user - no record returned")
                    
        except ConstraintError as e:
            self.logger.error(f"Constraint violation creating user {user_data.email}: {e}")
            raise Exception(f"Email already exists: {str(e)}")
        except Neo4jError as e:
            self.logger.error(f"Neo4j error creating user {user_data.email}: {e}")
            raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error creating user {user_data.email}: {e}")
            raise Exception(f"Failed to create user: {str(e)}")

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email"""
        self.logger.debug(f"Looking up user by email: {email}")
        
        try:
            with self.get_session() as session:
                result = session.run(
                    "MATCH (u:User {email: $email}) RETURN u",
                    email=email
                )
                
                record = result.single()
                if record:
                    node = record["u"]
                    self.logger.debug(f"User found for email: {email}")
                    return UserInDB(
                        id=node["id"],
                        email=node["email"],
                        hashed_password=node["hashed_password"],
                        phone_number=node.get("phone_number"),
                        zip_code=node.get("zip_code"),
                        email_notifications_enabled=node.get("email_notifications_enabled", True),
                        sms_notifications_enabled=node.get("sms_notifications_enabled", True),
                        account_active=node.get("account_active", True)
                    )
                else:
                    self.logger.debug(f"No user found for email: {email}")
                    return None
                    
        except Neo4jError as e:
            self.logger.error(f"Neo4j error retrieving user by email {email}: {e}")
            raise Exception(f"Database error while retrieving user: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error retrieving user by email {email}: {e}")
            raise Exception(f"Failed to retrieve user: {str(e)}")

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        with self.get_session() as session:
            result = session.run(
                "MATCH (u:User {id: $id}) RETURN u",
                id=user_id
            )
            
            record = result.single()
            if record:
                node = record["u"]
                return User(
                    id=node["id"],
                    email=node["email"],
                    phone_number=node.get("phone_number"),
                    zip_code=node.get("zip_code"),
                    email_notifications_enabled=node.get("email_notifications_enabled", True),
                    sms_notifications_enabled=node.get("sms_notifications_enabled", True),
                    account_active=node.get("account_active", True)
                )
            return None

    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Optional[User]:
        """Update user information"""
        # Build the SET clause dynamically based on provided fields
        set_clauses = []
        params = {"id": user_id}
        
        for field, value in update_data.items():
            if field == "password":
                # Hash password if provided
                set_clauses.append("u.hashed_password = $hashed_password")
                params["hashed_password"] = get_password_hash(value)
            else:
                set_clauses.append(f"u.{field} = ${field}")
                params[field] = value
        
        if not set_clauses:
            # Nothing to update
            return await self.get_user_by_id(user_id)
        
        set_clause = ", ".join(set_clauses)
        
        with self.get_session() as session:
            result = session.run(
                f"MATCH (u:User {{id: $id}}) SET {set_clause} RETURN u",
                **params
            )
            
            record = result.single()
            if record:
                node = record["u"]
                return User(
                    id=node["id"],
                    email=node["email"],
                    phone_number=node.get("phone_number"),
                    zip_code=node.get("zip_code"),
                    email_notifications_enabled=node.get("email_notifications_enabled", True),
                    sms_notifications_enabled=node.get("sms_notifications_enabled", True),
                    account_active=node.get("account_active", True)
                )
            return None

    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """Authenticate user with email and password"""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    # Vehicle management methods
    async def create_vehicle(self, owner_id: str, vehicle_data: VehicleCreate) -> Vehicle:
        """Create a new vehicle and link it to the owner"""
        vehicle_id = str(uuid.uuid4())
        
        try:
            with self.get_session() as session:
                result = session.run(
                    """
                    MATCH (u:User {id: $owner_id})
                    CREATE (v:Vehicle {
                        id: $id,
                        brand: $brand,
                        brand_id: $brand_id,
                        model: $model,
                        model_id: $model_id,
                        year: $year,
                        trim: $trim,
                        trim_id: $trim_id,
                        zip_code: $zip_code,
                        usage_pattern: $usage_pattern,
                        usage_notes: $usage_notes,
                        vin: $vin,
                        license_plate: $license_plate,
                        license_country: $license_country,
                        license_state: $license_state,
                        current_mileage: $current_mileage
                    })
                    CREATE (u)-[:OWNS]->(v)
                    RETURN v
                    """,
                    owner_id=owner_id,
                    id=vehicle_id,
                    brand=vehicle_data.brand,
                    brand_id=vehicle_data.brand_id,
                    model=vehicle_data.model,
                    model_id=vehicle_data.model_id,
                    year=vehicle_data.year,
                    trim=vehicle_data.trim,
                    trim_id=vehicle_data.trim_id,
                    zip_code=vehicle_data.zip_code,
                    usage_pattern=vehicle_data.usage_pattern,
                    usage_notes=vehicle_data.usage_notes,
                    vin=vehicle_data.vin,
                    license_plate=vehicle_data.license_plate,
                    license_country=vehicle_data.license_country,
                    license_state=vehicle_data.license_state,
                    current_mileage=vehicle_data.current_mileage
                )
                
                record = result.single()
                if record:
                    node = record["v"]
                    return Vehicle(
                        id=node["id"],
                        owner_id=owner_id,
                        brand=node["brand"],
                        brand_id=node.get("brand_id"),
                        model=node["model"],
                        model_id=node.get("model_id"),
                        year=node["year"],
                        trim=node.get("trim"),
                        trim_id=node.get("trim_id"),
                        zip_code=node.get("zip_code"),
                        usage_pattern=node.get("usage_pattern"),
                        usage_notes=node.get("usage_notes"),
                        vin=node.get("vin"),
                        license_plate=node.get("license_plate"),
                        license_country=node.get("license_country"),
                        license_state=node.get("license_state"),
                        current_mileage=node.get("current_mileage")
                    )
                else:
                    raise Exception("Failed to create vehicle - no record returned")
                    
        except Neo4jError as e:
            self.logger.error(f"Neo4j error creating vehicle: {e}")
            raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error creating vehicle: {e}")
            raise Exception(f"Failed to create vehicle: {str(e)}")

    async def get_user_vehicles(self, owner_id: str) -> List[Vehicle]:
        """Get all vehicles owned by a user"""
        try:
            with self.get_session() as session:
                result = session.run(
                    """
                    MATCH (u:User {id: $owner_id})-[:OWNS]->(v:Vehicle)
                    RETURN v
                    ORDER BY v.year DESC, v.brand, v.model
                    """,
                    owner_id=owner_id
                )
                
                vehicles = []
                for record in result:
                    node = record["v"]
                    vehicles.append(Vehicle(
                        id=node["id"],
                        owner_id=owner_id,
                        brand=node["brand"],
                        brand_id=node.get("brand_id"),
                        model=node["model"],
                        model_id=node.get("model_id"),
                        year=node["year"],
                        trim=node.get("trim"),
                        trim_id=node.get("trim_id"),
                        zip_code=node.get("zip_code"),
                        usage_pattern=node.get("usage_pattern"),
                        usage_notes=node.get("usage_notes"),
                        vin=node.get("vin"),
                        license_plate=node.get("license_plate"),
                        license_country=node.get("license_country"),
                        license_state=node.get("license_state"),
                        current_mileage=node.get("current_mileage")
                    ))
                
                return vehicles
                
        except Neo4jError as e:
            self.logger.error(f"Neo4j error retrieving vehicles for user {owner_id}: {e}")
            raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error retrieving vehicles for user {owner_id}: {e}")
            raise Exception(f"Failed to retrieve vehicles: {str(e)}")

    async def get_vehicle_by_id(self, vehicle_id: str, owner_id: str) -> Optional[Vehicle]:
        """Get a specific vehicle by ID, ensuring it belongs to the owner"""
        try:
            with self.get_session() as session:
                result = session.run(
                    """
                    MATCH (u:User {id: $owner_id})-[:OWNS]->(v:Vehicle {id: $vehicle_id})
                    RETURN v
                    """,
                    owner_id=owner_id,
                    vehicle_id=vehicle_id
                )
                
                record = result.single()
                if record:
                    node = record["v"]
                    return Vehicle(
                        id=node["id"],
                        owner_id=owner_id,
                        brand=node["brand"],
                        brand_id=node.get("brand_id"),
                        model=node["model"],
                        model_id=node.get("model_id"),
                        year=node["year"],
                        trim=node.get("trim"),
                        trim_id=node.get("trim_id"),
                        zip_code=node.get("zip_code"),
                        usage_pattern=node.get("usage_pattern"),
                        usage_notes=node.get("usage_notes"),
                        vin=node.get("vin"),
                        license_plate=node.get("license_plate"),
                        license_country=node.get("license_country"),
                        license_state=node.get("license_state"),
                        current_mileage=node.get("current_mileage")
                    )
                return None
                
        except Neo4jError as e:
            self.logger.error(f"Neo4j error retrieving vehicle {vehicle_id}: {e}")
            raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error retrieving vehicle {vehicle_id}: {e}")
            raise Exception(f"Failed to retrieve vehicle: {str(e)}")

    async def update_vehicle(self, vehicle_id: str, owner_id: str, update_data: Dict[str, Any]) -> Optional[Vehicle]:
        """Update vehicle information"""
        # Build the SET clause dynamically based on provided fields
        set_clauses = []
        params = {"vehicle_id": vehicle_id, "owner_id": owner_id}
        
        for field, value in update_data.items():
            set_clauses.append(f"v.{field} = ${field}")
            params[field] = value
        
        if not set_clauses:
            # Nothing to update
            return await self.get_vehicle_by_id(vehicle_id, owner_id)
        
        set_clause = ", ".join(set_clauses)
        
        try:
            with self.get_session() as session:
                result = session.run(
                    f"""
                    MATCH (u:User {{id: $owner_id}})-[:OWNS]->(v:Vehicle {{id: $vehicle_id}})
                    SET {set_clause}
                    RETURN v
                    """,
                    **params
                )
                
                record = result.single()
                if record:
                    node = record["v"]
                    return Vehicle(
                        id=node["id"],
                        owner_id=owner_id,
                        brand=node["brand"],
                        brand_id=node.get("brand_id"),
                        model=node["model"],
                        model_id=node.get("model_id"),
                        year=node["year"],
                        trim=node.get("trim"),
                        trim_id=node.get("trim_id"),
                        zip_code=node.get("zip_code"),
                        usage_pattern=node.get("usage_pattern"),
                        usage_notes=node.get("usage_notes"),
                        vin=node.get("vin"),
                        license_plate=node.get("license_plate"),
                        license_country=node.get("license_country"),
                        license_state=node.get("license_state"),
                        current_mileage=node.get("current_mileage")
                    )
                return None
                
        except Neo4jError as e:
            self.logger.error(f"Neo4j error updating vehicle {vehicle_id}: {e}")
            raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error updating vehicle {vehicle_id}: {e}")
            raise Exception(f"Failed to update vehicle: {str(e)}")

    async def delete_vehicle(self, vehicle_id: str, owner_id: str) -> bool:
        """Delete a vehicle, ensuring it belongs to the owner"""
        try:
            with self.get_session() as session:
                result = session.run(
                    """
                    MATCH (u:User {id: $owner_id})-[r:OWNS]->(v:Vehicle {id: $vehicle_id})
                    DELETE r, v
                    RETURN count(v) as deleted_count
                    """,
                    owner_id=owner_id,
                    vehicle_id=vehicle_id
                )
                
                record = result.single()
                return record["deleted_count"] > 0 if record else False
                
        except Neo4jError as e:
            self.logger.error(f"Neo4j error deleting vehicle {vehicle_id}: {e}")
            raise Exception(f"Database error: {str(e)}")
        except Exception as e:
            self.logger.error(f"Unexpected error deleting vehicle {vehicle_id}: {e}")
            raise Exception(f"Failed to delete vehicle: {str(e)}")


neo4j_service = Neo4jService()
