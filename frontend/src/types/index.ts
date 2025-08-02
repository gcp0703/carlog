export interface User {
  id: string;
  email: string;
  zip_code?: string;
  has_garage?: boolean;
  usage_pattern?: string;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
  current_mileage?: number;
}

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  mileage: number;
  service_date: string;
  description?: string;
  cost?: number;
  service_provider?: string;
  created_at: string;
}

export interface MaintenanceSchedule {
  vehicle_id: string;
  service_type: string;
  interval_miles?: number;
  interval_months?: number;
  last_service_mileage?: number;
  last_service_date?: string;
  next_service_mileage?: number;
  next_service_date?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}