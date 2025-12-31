-- Database schema for Virtual Integrated Management System (VIMS)
-- Tables: users, locations, access_logs

-- Create users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  user_avatar TEXT,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL,
  user_company TEXT,
  user_phone TEXT,
  user_email TEXT UNIQUE,
  user_status TEXT NOT NULL,
  blacklist_reason TEXT
);

-- Create locations table
CREATE TABLE locations (
  location_id SERIAL PRIMARY KEY,
  location_name TEXT NOT NULL,
  location_zone_code TEXT NOT NULL
);

-- Create access_logs table
CREATE TABLE access_logs (
  id_logs SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  location_id INTEGER REFERENCES locations(location_id),
  access_status TEXT NOT NULL,
  entry_timestamp TIMESTAMP WITH TIME ZONE,
  exit_timestamp TIMESTAMP WITH TIME ZONE,
  purpose TEXT,
  vehicle_plate TEXT
);

-- Create sessions table for event management
CREATE TABLE sessions (
  session_id SERIAL PRIMARY KEY,
  host_id INTEGER REFERENCES users(user_id),
  event_name TEXT NOT NULL,
  venue TEXT NOT NULL,
  participants TEXT, -- JSON array of participant details or emails
  qr_code TEXT, -- Store QR code data or URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_date TIMESTAMP WITH TIME ZONE
);

-- Create pre_registrations table for QR-based registration
CREATE TABLE pre_registrations (
  reg_id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(session_id),
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_phone TEXT,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Create indexes for better performance
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_location_id ON access_logs(location_id);
CREATE INDEX idx_access_logs_entry_timestamp ON access_logs(entry_timestamp);
CREATE INDEX idx_users_email ON users(user_email);
CREATE INDEX idx_sessions_host_id ON sessions(host_id);
CREATE INDEX idx_pre_registrations_session_id ON pre_registrations(session_id);

-- Seed data for sessions table
INSERT INTO sessions (host_id, event_name, venue, participants, qr_code, session_date) VALUES
(1, 'Corporate Meeting Q1', 'Convention Centre', 'john.doe@tnb.com,jane.smith@abc.com', 'QR-CORP-MEETING-001', '2025-01-15 10:00:00+08'),
(1, 'Sports Event - Basketball', 'Field', 'ahmad@xyz.com,lee.wei@def.com', 'QR-SPORTS-001', '2025-01-20 14:00:00+08'),
(1, 'Deployment Session', 'Tower 1', 'maria.garcia@tnb.com', 'QR-DEPLOY-001', '2025-01-25 09:00:00+08');

-- Seed data for pre_registrations table
INSERT INTO pre_registrations (session_id, user_name, user_email, user_phone) VALUES
(1, 'John Doe', 'john.doe@tnb.com', '+60123456789'),
(1, 'Jane Smith', 'jane.smith@abc.com', '+60123456790'),
(2, 'Ahmad Abdullah', 'ahmad@xyz.com', '+60123456791'),
(2, 'Lee Wei', 'lee.wei@def.com', '+60123456793'),
(3, 'Maria Garcia', 'maria.garcia@tnb.com', '+60123456792');

-- Seed data for users table
INSERT INTO users (user_name, user_type, user_company, user_phone, user_email, user_status, blacklist_reason, user_avatar) VALUES
('John Doe', 'Staff', 'TNB', '+60123456789', 'john.doe@tnb.com', 'Active', NULL, 'https://via.placeholder.com/150'),
('Jane Smith', 'Visitor', 'ABC Corp', '+60123456790', 'jane.smith@abc.com', 'Active', NULL, 'https://via.placeholder.com/150'),
('Ahmad bin Abdullah', 'Contractor', 'XYZ Ltd', '+60123456791', 'ahmad@xyz.com', 'Active', NULL, 'https://via.placeholder.com/150'),
('Maria Garcia', 'Staff', 'TNB', '+60123456792', 'maria.garcia@tnb.com', 'Blacklisted', 'Violation of safety protocols', 'https://via.placeholder.com/150'),
('Lee Wei', 'Visitor', 'DEF Inc', '+60123456793', 'lee.wei@def.com', 'Active', NULL, 'https://via.placeholder.com/150');

-- Seed data for locations table
INSERT INTO locations (location_name, location_zone_code) VALUES
('Convention Centre', 'ZONE-A'),
('Mosque', 'ZONE-B'),
('Field', 'ZONE-C'),
('Tower 1', 'ZONE-D'),
('Tower 2', 'ZONE-E'),
('Tower 3', 'ZONE-F');

-- Seed data for access_logs table
INSERT INTO access_logs (user_id, location_id, access_status, entry_timestamp, exit_timestamp, purpose, vehicle_plate) VALUES
(1, 1, 'Granted', '2025-12-31 08:00:00+08', '2025-12-31 17:00:00+08', 'Daily work', NULL),
(2, 1, 'Granted', '2025-12-31 09:00:00+08', NULL, 'Meeting', 'ABC123'),
(3, 2, 'Granted', '2025-12-31 10:00:00+08', '2025-12-31 15:00:00+08', 'Maintenance', 'XYZ456'),
(4, 1, 'Denied', '2025-12-31 11:00:00+08', NULL, 'Access attempt', NULL),
(5, 3, 'Granted', '2025-12-31 12:00:00+08', NULL, 'Inspection', NULL),
(1, 4, 'Granted', '2025-12-31 13:00:00+08', '2025-12-31 16:00:00+08', 'Parking', 'TNB789'),
(2, 5, 'Granted', '2025-12-31 14:00:00+08', NULL, 'Office visit', NULL);