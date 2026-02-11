import { createClient } from '@/lib/supabase';
import type { TimeEntry, WorkLocation, PayPeriodSummary, ClockInOutData } from '@/types';

// ============================================
// GPS/GEOLOCATION UTILITIES
// ============================================

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Get current GPS position from browser
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

/**
 * Check if user is within geofence radius
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  locationLat: number,
  locationLng: number,
  radiusMeters: number
): { isWithin: boolean; distance: number } {
  const distance = calculateDistance(userLat, userLng, locationLat, locationLng);
  return {
    isWithin: distance <= radiusMeters,
    distance,
  };
}

// ============================================
// TIME ENTRY API FUNCTIONS
// ============================================

/**
 * Get all active work locations for a circle
 */
export async function getWorkLocations(circleId: string): Promise<WorkLocation[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('circle_id', circleId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching work locations:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get the currently active time entry for a user (if clocked in)
 */
export async function getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      location:location_id(*)
    `)
    .eq('user_id', userId)
    .is('clock_out', null)
    .order('clock_in', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching active time entry:', error);
    throw error;
  }

  return data;
}

/**
 * Get time entries for a user within a date range
 */
export async function getTimeEntries(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TimeEntry[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      location:location_id(*),
      override_by_profile:override_by(full_name)
    `)
    .eq('user_id', userId)
    .gte('clock_in', startDate)
    .lte('clock_in', endDate)
    .order('clock_in', { ascending: false });

  if (error) {
    console.error('Error fetching time entries:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get all time entries for a circle (admin only)
 */
export async function getAllTimeEntries(
  circleId: string,
  startDate?: string,
  endDate?: string
): Promise<TimeEntry[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      user:user_id(full_name, email, avatar_url),
      location:location_id(*),
      override_by_profile:override_by(full_name)
    `)
    .eq('circle_id', circleId);

  if (startDate) {
    query = query.gte('clock_in', startDate);
  }
  if (endDate) {
    query = query.lte('clock_in', endDate);
  }

  const { data, error } = await query.order('clock_in', { ascending: false });

  if (error) {
    console.error('Error fetching all time entries:', error);
    throw error;
  }

  return data || [];
}

/**
 * Clock in
 */
export async function clockIn(
  userId: string,
  circleId: string,
  data: ClockInOutData
): Promise<TimeEntry> {
  const supabase = createClient();
  
  const { data: entry, error } = await supabase
    .from('time_entries')
    .insert({
      user_id: userId,
      circle_id: circleId,
      location_id: data.location_id,
      clock_in: new Date().toISOString(),
      clock_in_lat: data.latitude,
      clock_in_lng: data.longitude,
      clock_in_distance_meters: data.distance_meters,
      notes: data.notes,
    })
    .select(`
      *,
      location:location_id(*)
    `)
    .single();

  if (error) {
    console.error('Error clocking in:', error);
    throw error;
  }

  return entry;
}

/**
 * Clock out
 */
export async function clockOut(
  entryId: string,
  data: Partial<ClockInOutData>
): Promise<TimeEntry> {
  const supabase = createClient();
  
  const updateData: any = {
    clock_out: new Date().toISOString(),
  };

  if (data.latitude !== undefined) {
    updateData.clock_out_lat = data.latitude;
  }
  if (data.longitude !== undefined) {
    updateData.clock_out_lng = data.longitude;
  }
  if (data.distance_meters !== undefined) {
    updateData.clock_out_distance_meters = data.distance_meters;
  }

  const { data: entry, error } = await supabase
    .from('time_entries')
    .update(updateData)
    .eq('id', entryId)
    .select(`
      *,
      location:location_id(*)
    `)
    .single();

  if (error) {
    console.error('Error clocking out:', error);
    throw error;
  }

  return entry;
}

/**
 * Create an override entry (admin only)
 */
export async function createOverrideEntry(
  userId: string,
  circleId: string,
  data: {
    clock_in: string;
    clock_out: string;
    location_id?: string;
    notes?: string;
  },
  adminId: string
): Promise<TimeEntry> {
  const supabase = createClient();
  
  const { data: entry, error } = await supabase
    .from('time_entries')
    .insert({
      user_id: userId,
      circle_id: circleId,
      location_id: data.location_id,
      clock_in: data.clock_in,
      clock_out: data.clock_out,
      is_override: true,
      override_by: adminId,
      notes: data.notes,
    })
    .select(`
      *,
      location:location_id(*),
      override_by_profile:override_by(full_name)
    `)
    .single();

  if (error) {
    console.error('Error creating override entry:', error);
    throw error;
  }

  return entry;
}

/**
 * Update an existing time entry (admin only)
 */
export async function updateTimeEntry(
  entryId: string,
  data: Partial<TimeEntry>,
  adminId: string
): Promise<TimeEntry> {
  const supabase = createClient();
  
  const updateData = {
    ...data,
    is_override: true,
    override_by: adminId,
    updated_at: new Date().toISOString(),
  };

  // Remove fields that shouldn't be updated
  delete (updateData as any).id;
  delete (updateData as any).created_at;

  const { data: entry, error } = await supabase
    .from('time_entries')
    .update(updateData)
    .eq('id', entryId)
    .select(`
      *,
      location:location_id(*),
      override_by_profile:override_by(full_name)
    `)
    .single();

  if (error) {
    console.error('Error updating time entry:', error);
    throw error;
  }

  return entry;
}

/**
 * Delete a time entry (admin only)
 */
export async function deleteTimeEntry(entryId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('Error deleting time entry:', error);
    throw error;
  }
}

/**
 * Create or update a work location
 */
export async function saveWorkLocation(
  location: Partial<WorkLocation>
): Promise<WorkLocation> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('locations')
    .upsert({
      ...location,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving work location:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a work location
 */
export async function deleteWorkLocation(locationId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', locationId);

  if (error) {
    console.error('Error deleting work location:', error);
    throw error;
  }
}

// ============================================
// TIME CALCULATION UTILITIES
// ============================================

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Format duration in decimal hours (e.g., 8.5 hours)
 */
export function formatDecimalHours(minutes: number): string {
  return (minutes / 60).toFixed(2);
}

/**
 * Calculate elapsed time since clock-in
 */
export function getElapsedMinutes(clockInTime: string): number {
  const start = new Date(clockInTime);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / 60000);
}

/**
 * Get pay period dates (biweekly, starting on Sunday)
 */
export function getPayPeriodDates(referenceDate: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const dayOfWeek = referenceDate.getDay(); // 0 = Sunday
  const daysSincePeriodStart = dayOfWeek + (Math.floor((referenceDate.getTime() - new Date('2024-01-07').getTime()) / (7 * 24 * 60 * 60 * 1000)) % 2) * 7;
  
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - daysSincePeriodStart);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 13);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Get date range for a specific pay period
 */
export function getPayPeriodRange(periodOffset: number = 0): { start: string; end: string } {
  const now = new Date();
  const { start } = getPayPeriodDates(now);
  
  // Adjust for offset (negative = past periods, positive = future)
  start.setDate(start.getDate() + periodOffset * 14);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 13);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

// ============================================
// SUMMARY/ANALYTICS
// ============================================

/**
 * Calculate pay period summary from time entries
 */
export function calculatePayPeriodSummary(
  entries: TimeEntry[],
  periodStart: string,
  periodEnd: string
): PayPeriodSummary {
  const filteredEntries = entries.filter(
    (e) => e.clock_in >= periodStart && e.clock_in <= periodEnd && e.clock_out
  );

  const totalMinutes = filteredEntries.reduce(
    (sum, e) => sum + (e.duration_minutes || 0),
    0
  );

  const uniqueDays = new Set(
    filteredEntries.map((e) => e.clock_in.split('T')[0])
  );

  return {
    total_hours: totalMinutes / 60,
    days_worked: uniqueDays.size,
    entries_count: filteredEntries.length,
    period_start: periodStart,
    period_end: periodEnd,
  };
}
