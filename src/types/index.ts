export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface CareCircle {
  id: string;
  name: string;
  created_by: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status: 'trialing' | 'active' | 'canceled' | 'past_due';
  trial_ends_at?: string;
  created_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: 'admin' | 'family' | 'caregiver';
  invited_by?: string;
  joined_at: string;
  profile?: Profile;
}

export interface CareRecipient {
  id: string;
  circle_id: string;
  full_name: string;
  date_of_birth?: string;
  photo_url?: string;
  medical_conditions: string[];
  allergies: string[];
  insurance_provider?: string;
  insurance_policy_number?: string;
  notes?: string;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  recipient_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
}

export interface Doctor {
  id: string;
  recipient_id: string;
  name: string;
  specialty: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  recipient_id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  times_of_day: string[];
  instructions?: string;
  prescribing_doctor?: string;
  is_active: boolean;
  created_at: string;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  scheduled_time: string;
  given_at?: string;
  given_by?: string;
  status: 'given' | 'missed' | 'skipped' | 'refused';
  notes?: string;
  medication?: Medication;
  given_by_profile?: Profile;
}

export interface Shift {
  id: string;
  circle_id: string;
  caregiver_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_pattern?: {
    daysOfWeek: number[];
    until?: string;
  };
  notes?: string;
  created_by: string;
  created_at: string;
  caregiver?: Profile;
}

export type CareLogCategory = 'meal' | 'mood' | 'activity' | 'incident' | 'vitals' | 'note';

export interface CareLog {
  id: string;
  circle_id: string;
  recipient_id: string;
  author_id: string;
  category: CareLogCategory;
  content: string;
  photo_url?: string;
  logged_at: string;
  created_at: string;
  author?: Profile;
}

export interface Appointment {
  id: string;
  recipient_id: string;
  doctor_id?: string;
  date_time: string;
  location?: string;
  purpose: string;
  post_visit_notes?: string;
  reminder_sent: boolean;
  created_by: string;
  created_at: string;
  doctor?: Doctor;
}

// ============================================
// TIME TRACKING TYPES
// ============================================

export interface WorkLocation {
  id: string;
  circle_id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  circle_id: string;
  location_id?: string;
  clock_in: string;
  clock_out?: string;
  clock_in_lat?: number;
  clock_in_lng?: number;
  clock_in_distance_meters?: number;
  clock_out_lat?: number;
  clock_out_lng?: number;
  clock_out_distance_meters?: number;
  is_override: boolean;
  override_by?: string;
  override_reason?: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: Profile;
  location?: WorkLocation;
  override_by_profile?: Profile;
}

export interface PayPeriodSummary {
  total_hours: number;
  days_worked: number;
  entries_count: number;
  period_start: string;
  period_end: string;
}

export interface ClockInOutData {
  location_id?: string;
  latitude: number;
  longitude: number;
  distance_meters: number;
  notes?: string;
}

export type GPSStatus = 'loading' | 'success' | 'error' | 'denied' | 'unavailable';
