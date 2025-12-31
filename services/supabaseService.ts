import { supabase } from '../lib/supabaseClient';
import { VisitorLog, UserProfile, DashboardStats, AccessStatus, UserType } from '../types';

// --- Types for DB Response ---
// These match the exact column names in your SQL
interface DBUser {
  user_id: number;
  user_name: string;
  user_type: string;
  user_company: string;
  user_avatar: string;
  user_status: string;
  blacklist_reason: string;
  user_phone: string;
  user_email: string;
}

interface DBLocation {
  location_id: number;
  location_name: string;
  location_zone_code: string;
}

interface DBAccessLog {
  id_logs: number;
  user_id: number;
  location_id: number;
  access_status: string;
  entry_timestamp: string;
  exit_timestamp: string;
  purpose: string;
  vehicle_plate: string;
  users?: DBUser;      // Joined
  locations?: DBLocation; // Joined
}

/**
 * Fetch overview statistics for the dashboard
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Total Entries Today
    const { count: totalEntries, error: countError } = await supabase
      .from('access_logs')
      .select('*', { count: 'exact', head: true })
      .gte('entry_timestamp', `${today}T00:00:00`);

    if (countError) console.error('Error fetching total entries:', countError.message);

    // 2. Active Staff On-site
    // Using a safer query approach than !inner if relationships are fragile
    const { data: activeLogs, error: activeError } = await supabase
      .from('access_logs')
      .select('entry_timestamp, exit_timestamp, users!inner(user_type)')
      .is('exit_timestamp', null)
      .eq('users.user_type', 'Staff');
    
    if (activeError) console.error('Error fetching active staff:', activeError.message);

    // 3. Alerts (Denied Access Today)
    const { count: alerts, error: alertsError } = await supabase
      .from('access_logs')
      .select('*', { count: 'exact', head: true })
      .eq('access_status', 'Denied')
      .gte('entry_timestamp', `${today}T00:00:00`);

    if (alertsError) console.error('Error fetching alerts:', alertsError.message);

    return {
      totalVisitors: totalEntries || 0,
      activeStaff: activeLogs?.length || 0,
      alerts: alerts || 0,
      avgDuration: '45m' // Placeholder calculation
    };
  } catch (error) {
    console.error('Unexpected error fetching stats:', error);
    return { totalVisitors: 0, activeStaff: 0, alerts: 0, avgDuration: '-' };
  }
};

/**
 * Fetch recent access logs with joined User and Location data
 */
export const fetchAccessLogs = async (limit = 50): Promise<VisitorLog[]> => {
  try {
    // Explicitly select columns to avoid ambiguity
    const { data, error } = await supabase
      .from('access_logs')
      .select(`
        id_logs,
        user_id,
        location_id,
        access_status,
        entry_timestamp,
        exit_timestamp,
        purpose,
        vehicle_plate,
        users (
          user_id, user_name, user_type, user_company, user_avatar, user_status
        ),
        locations (
          location_id, location_name
        )
      `)
      .order('entry_timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching logs:', JSON.stringify(error, null, 2));
      return [];
    }

    if (!data) return [];

    return (data as any[]).map((log: DBAccessLog) => ({
      id: log.id_logs?.toString() || '0',
      profile_id: log.user_id?.toString() || '0',
      name: log.users?.user_name || 'Unknown User',
      type: (log.users?.user_type as UserType) || UserType.VISITOR,
      company: log.users?.user_company || '',
      avatarUrl: log.users?.user_avatar || 'https://via.placeholder.com/100',
      location: log.locations?.location_name || 'Unknown Location',
      location_id: log.location_id?.toString() || '0',
      timestamp: log.entry_timestamp,
      exit_timestamp: log.exit_timestamp,
      status: mapStatus(log.access_status),
      purpose: log.purpose,
      vehiclePlate: log.vehicle_plate,
      isSuspicious: log.access_status === 'Denied' || log.users?.user_status === 'Blacklisted'
    }));
  } catch (err) {
    console.error('Unexpected error in fetchAccessLogs:', err);
    return [];
  }
};

/**
 * Fetch all users (profiles)
 */
export const fetchUsers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('user_name');

  if (error) {
    console.error('Error fetching users:', JSON.stringify(error, null, 2));
    return [];
  }

  return (data as DBUser[]).map(user => ({
    id: user.user_id.toString(),
    full_name: user.user_name,
    user_type: user.user_type as UserType,
    company: user.user_company,
    phone: user.user_phone,
    email: user.user_email,
    avatar_url: user.user_avatar,
    status: user.user_status as 'Active' | 'Blacklisted',
    blacklist_reason: user.blacklist_reason
  }));
};

/**
 * Insert a new access log
 */
export const createAccessLog = async (
  userId: number, 
  locationId: number, 
  purpose: string, 
  plate: string,
  status: string = 'Granted'
) => {
  const { data, error } = await supabase
    .from('access_logs')
    .insert([
      { 
        user_id: userId, 
        location_id: locationId, 
        purpose: purpose, 
        vehicle_plate: plate,
        access_status: status,
        entry_timestamp: new Date().toISOString()
      }
    ])
    .select();
  
  if (error) console.error('Error creating log:', JSON.stringify(error, null, 2));
  return { data, error };
};

/**
 * Create a new user
 */
export const createUser = async (userData: Partial<UserProfile>) => {
    const { data, error } = await supabase
        .from('users')
        .insert([{
            user_name: userData.full_name,
            user_type: userData.user_type,
            user_company: userData.company,
            user_phone: userData.phone,
            user_email: userData.email,
            user_avatar: userData.avatar_url || `https://ui-avatars.com/api/?name=${userData.full_name}`,
            user_status: 'Active'
        }])
        .select();
    
    if (error) console.error('Error creating user:', JSON.stringify(error, null, 2));
    return { data, error };
};

/**
 * Update user blacklist status
 */
export const updateUserStatus = async (userId: number, status: 'Active' | 'Blacklisted', reason?: string) => {
    const { data, error } = await supabase
        .from('users')
        .update({ user_status: status, blacklist_reason: reason })
        .eq('user_id', userId);
        
    if (error) console.error('Error updating user:', JSON.stringify(error, null, 2));
    return { data, error };
};

// Helper to map DB string status to Enum
const mapStatus = (status: string): AccessStatus => {
    switch(status) {
        case 'Granted': return AccessStatus.CHECKED_IN;
        case 'Denied': return AccessStatus.DENIED;
        case 'Checked Out': return AccessStatus.CHECKED_OUT;
        default: return AccessStatus.CHECKED_IN;
    }
}

/**
 * Fetch all sessions
 */
export const fetchSessions = async (): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', JSON.stringify(error, null, 2));
    return [];
  }

  return (data as any[]).map(session => ({
    session_id: session.session_id.toString(),
    host_id: session.host_id.toString(),
    event_name: session.event_name,
    venue: session.venue,
    participants: session.participants,
    qr_code: session.qr_code,
    created_at: session.created_at,
    session_date: session.session_date
  }));
};

/**
 * Create a new session
 */
export const createSession = async (sessionData: {
  host_id: number;
  event_name: string;
  venue: string;
  participants: string;
  qr_code: string;
  session_date: string;
}) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([sessionData])
    .select();
  
  if (error) console.error('Error creating session:', JSON.stringify(error, null, 2));
  return { data, error };
};