export interface User {
  id: string;
  email: string;
  phone_number?: string;
  zip_code?: string;
  email_notifications_enabled?: boolean;
  sms_notifications_enabled?: boolean;
  sms_notification_frequency?: 'weekly' | 'monthly' | 'quarterly';
  maintenance_notification_frequency?: 'monthly' | 'quarterly' | 'annually';
  last_login?: string;
  role?: 'admin' | 'manager' | 'user';
  account_active?: boolean;
}

export interface UserWithVehicleCount extends User {
  vehicle_count: number;
}

export interface Vehicle {
  id: string;
  owner_id: string;
  brand: string;
  brand_id?: number;
  model: string;
  model_id?: number;
  year: number;
  trim?: string;
  trim_id?: number;
  zip_code?: string;
  usage_pattern?: string;
  usage_notes?: string;
  vin?: string;
  license_plate?: string;
  license_country?: string;
  license_state?: string;
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