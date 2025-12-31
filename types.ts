export enum AccessStatus {
  CHECKED_IN = 'Granted', // Matches DB 'Granted'
  CHECKED_OUT = 'Checked Out',
  DENIED = 'Denied',
  PENDING = 'Pending',
  REVOKED = 'Revoked'
}

export enum UserType {
  STAFF = 'Staff', 
  VISITOR = 'Visitor', 
  CONTRACTOR = 'Contractor', 
  VIP = 'VIP', 
  TRANSIENT = 'Transient', 
  DELIVERY = 'Delivery', 
  HOST = 'Host' 
}

// Maps to 'users' table in Supabase
export interface UserProfile {
  id: string; // Mapped from user_id (int) to string for frontend consistency
  full_name: string; // user_name
  identity_doc?: string; // Not in provided SQL, but good to have if added later
  user_type: UserType;
  company?: string; // user_company
  phone?: string; // user_phone
  email?: string; // user_email
  avatar_url?: string; // user_avatar
  
  // Access Control
  status: 'Active' | 'Blacklisted'; // user_status
  blacklist_reason?: string;
  
  created_at?: string;
}

// Maps to 'locations' table
export interface Location {
  id: string; // location_id
  name: string; // location_name
  zone_code?: string; // location_zone_code
}

// Maps to 'access_logs' table joined with 'users' and 'locations'
export interface VisitorLog {
  id: string; // id_logs
  profile_id: string; // user_id
  
  // Joined Data (Flattens the JSON response from Supabase)
  name: string; 
  type: UserType;
  company?: string;
  avatarUrl?: string;

  // Log Data
  location: string; // location_name
  location_id?: string;
  
  timestamp: string; // entry_timestamp
  exit_timestamp?: string;
  expiryTimestamp?: string; // Calculated or stored
  status: AccessStatus; // access_status
  
  purpose?: string;
  vehiclePlate?: string; // vehicle_plate
  isSuspicious?: boolean;
  isVipPrivacy?: boolean;
  
  lastEntryPoint?: string;
}

export interface ChartData {
  name: string;
  value: number;
  secondaryValue?: number;
}

// Maps to 'sessions' table
export interface Session {
  session_id: string;
  host_id: string;
  event_name: string;
  venue: string;
  participants?: string; // JSON string
  qr_code?: string;
  created_at: string;
  session_date: string;
}

// Maps to 'pre_registrations' table
export interface PreRegistration {
  reg_id: string;
  session_id: string;
  user_name: string;
  user_email?: string;
  user_phone?: string;
  registered_at: string;
}