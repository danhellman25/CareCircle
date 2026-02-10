import { createClient, createServerClient, isSupabaseConfigured, DEMO_IDS } from './supabase';

export { DEMO_IDS };

import * as demoData from './demo-data';
import type {
  Profile,
  CareCircle,
  CircleMember,
  CareRecipient,
  Doctor,
  Medication,
  MedicationLog,
  Shift,
  CareLog,
  Appointment,
} from '@/types';

// Helper to safely parse JSON
function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

// ==================== PROFILE ====================
export async function getCurrentUser(): Promise<Profile> {
  if (!isSupabaseConfigured()) return demoData.currentUser;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', DEMO_IDS.user)
      .maybeSingle();

    if (error || !data) return demoData.currentUser;
    return data as Profile;
  } catch {
    return demoData.currentUser;
  }
}

// ==================== CARE CIRCLE ====================
export async function getCareCircle(): Promise<CareCircle> {
  if (!isSupabaseConfigured()) return demoData.careCircle;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('care_circles')
      .select('*')
      .eq('id', DEMO_IDS.circle)
      .maybeSingle();

    if (error || !data) return demoData.careCircle;
    return data as CareCircle;
  } catch {
    return demoData.careCircle;
  }
}

// ==================== CIRCLE MEMBERS ====================
export async function getCircleMembers(): Promise<CircleMember[]> {
  if (!isSupabaseConfigured()) return demoData.circleMembers;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('circle_members')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('circle_id', DEMO_IDS.circle);

    if (error || !data || data.length === 0) return demoData.circleMembers;

    return data.map((m: any) => ({
      ...m,
      profile: m.profile || undefined,
    })) as CircleMember[];
  } catch {
    return demoData.circleMembers;
  }
}

// ==================== CARE RECIPIENT ====================
export async function getCareRecipient(): Promise<CareRecipient> {
  if (!isSupabaseConfigured()) return demoData.careRecipient;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('care_recipients')
      .select('*')
      .eq('id', DEMO_IDS.recipient)
      .maybeSingle();

    if (error || !data) return demoData.careRecipient;
    return data as CareRecipient;
  } catch {
    return demoData.careRecipient;
  }
}

// ==================== DOCTORS ====================
export async function getDoctors(): Promise<Doctor[]> {
  if (!isSupabaseConfigured()) return demoData.doctors;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('recipient_id', DEMO_IDS.recipient);

    if (error || !data || data.length === 0) return demoData.doctors;
    return data as Doctor[];
  } catch {
    return demoData.doctors;
  }
}

// ==================== MEDICATIONS ====================
export async function getMedications(): Promise<Medication[]> {
  if (!isSupabaseConfigured()) return demoData.medications;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('recipient_id', DEMO_IDS.recipient)
      .eq('is_active', true);

    if (error || !data || data.length === 0) return demoData.medications;
    return data as Medication[];
  } catch {
    return demoData.medications;
  }
}

export async function addMedication(medication: Omit<Medication, 'id' | 'created_at'>): Promise<Medication | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('medications')
      .insert(medication)
      .select()
      .single();

    if (error) throw error;
    return data as Medication;
  } catch (error) {
    console.error('Error adding medication:', error);
    return null;
  }
}

// ==================== MEDICATION LOGS ====================
export async function getMedicationLogs(date?: string): Promise<MedicationLog[]> {
  if (!isSupabaseConfigured()) return demoData.medicationLogs;

  try {
    const supabase = createServerClient();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('medication_logs')
      .select(`
        *,
        medication:medications(*),
        given_by_profile:profiles!medication_logs_given_by_fkey(*)
      `)
      .gte('scheduled_time', `${targetDate}T00:00:00Z`)
      .lte('scheduled_time', `${targetDate}T23:59:59Z`);

    if (error || !data) return demoData.medicationLogs;

    return data.map((log: any) => ({
      ...log,
      medication: log.medication || undefined,
      given_by_profile: log.given_by_profile || undefined,
    })) as MedicationLog[];
  } catch {
    return demoData.medicationLogs;
  }
}

export async function logMedication(
  medicationId: string,
  status: 'given' | 'missed' | 'skipped' | 'refused',
  notes?: string,
  givenBy?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('medication_logs')
      .insert({
        medication_id: medicationId,
        scheduled_time: now,
        given_at: status === 'given' ? now : null,
        given_by: givenBy || DEMO_IDS.user,
        status,
        notes,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging medication:', error);
    return false;
  }
}

// ==================== SHIFTS ====================
export async function getShifts(startDate?: string, endDate?: string): Promise<Shift[]> {
  if (!isSupabaseConfigured()) return demoData.shifts;

  try {
    const supabase = createServerClient();
    let query = supabase
      .from('shifts')
      .select(`
        *,
        caregiver:profiles!shifts_caregiver_id_fkey(*)
      `)
      .eq('circle_id', DEMO_IDS.circle);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true }).order('start_time', { ascending: true });

    if (error || !data || data.length === 0) return demoData.shifts;

    return data.map((s: any) => ({
      ...s,
      recurrence_pattern: safeJsonParse(s.recurrence_pattern, undefined),
      caregiver: s.caregiver || undefined,
    })) as Shift[];
  } catch {
    return demoData.shifts;
  }
}

export async function addShift(shift: Omit<Shift, 'id' | 'created_at'>): Promise<Shift | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        ...shift,
        recurrence_pattern: shift.recurrence_pattern ? JSON.stringify(shift.recurrence_pattern) : null,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      recurrence_pattern: safeJsonParse(data.recurrence_pattern, undefined),
    } as Shift;
  } catch (error) {
    console.error('Error adding shift:', error);
    return null;
  }
}

export function getCurrentShift(shifts: Shift[]): Shift | null {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
  const todayStr = now.toISOString().split('T')[0];

  return shifts.find((s) => {
    if (s.date !== todayStr) return false;
    return currentTime >= s.start_time && currentTime < s.end_time;
  }) || null;
}

// ==================== CARE LOGS ====================
export async function getCareLogs(limit?: number): Promise<CareLog[]> {
  if (!isSupabaseConfigured()) return demoData.careLogs;

  try {
    const supabase = createServerClient();
    let query = supabase
      .from('care_logs')
      .select(`
        *,
        author:profiles!care_logs_author_id_fkey(*)
      `)
      .eq('circle_id', DEMO_IDS.circle)
      .order('logged_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) return demoData.careLogs;

    return data.map((log: any) => ({
      ...log,
      author: log.author || undefined,
    })) as CareLog[];
  } catch {
    return demoData.careLogs;
  }
}

export async function addCareLog(log: Omit<CareLog, 'id' | 'created_at'>): Promise<CareLog | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('care_logs').insert(log).select().single();

    if (error) throw error;
    return data as CareLog;
  } catch (error) {
    console.error('Error adding care log:', error);
    return null;
  }
}

// Back-compat exports for dashboard
export async function getRecentCareLogs(limit: number = 5): Promise<CareLog[]> {
  return getCareLogs(limit);
}

// ==================== APPOINTMENTS ====================
export async function getAppointments(): Promise<Appointment[]> {
  if (!isSupabaseConfigured()) return demoData.appointments;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(*)
      `)
      .eq('recipient_id', DEMO_IDS.recipient)
      .order('date_time', { ascending: true });

    if (error || !data || data.length === 0) return demoData.appointments;

    return data.map((a: any) => ({
      ...a,
      doctor: a.doctor || undefined,
    })) as Appointment[];
  } catch {
    return demoData.appointments;
  }
}

export async function addAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('appointments').insert(appointment).select().single();

    if (error) throw error;
    return data as Appointment;
  } catch (error) {
    console.error('Error adding appointment:', error);
    return null;
  }
}

export async function getUpcomingAppointments(): Promise<Appointment[]> {
  const appts = await getAppointments();
  return appts.filter((a) => new Date(a.date_time) > new Date()).sort((a, b) =>
    new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
  );
}

// ==================== EMERGENCY CONTACTS ====================
export async function getEmergencyContacts(): Promise<typeof demoData.emergencyContacts> {
  if (!isSupabaseConfigured()) return demoData.emergencyContacts;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('recipient_id', DEMO_IDS.recipient);

    if (error || !data || data.length === 0) return demoData.emergencyContacts;
    return data;
  } catch {
    return demoData.emergencyContacts;
  }
}

// ==================== SEED DATA ====================
export async function seedDemoData(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/seed', { method: 'POST' });
    const result = await response.json();
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function checkDemoDataExists(): Promise<boolean> {
  try {
    const response = await fetch('/api/seed');
    const result = await response.json();
    return result.exists;
  } catch {
    return false;
  }
}
