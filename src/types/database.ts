export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone?: string
          avatar_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone?: string
          avatar_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          avatar_url?: string
          created_at?: string
        }
      }
      care_circles: {
        Row: {
          id: string
          name: string
          created_by?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          subscription_status: 'trialing' | 'active' | 'canceled' | 'past_due'
          trial_ends_at?: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          subscription_status?: 'trialing' | 'active' | 'canceled' | 'past_due'
          trial_ends_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          subscription_status?: 'trialing' | 'active' | 'canceled' | 'past_due'
          trial_ends_at?: string
          created_at?: string
        }
      }
      circle_members: {
        Row: {
          id: string
          circle_id: string
          user_id: string
          role: 'admin' | 'family' | 'caregiver'
          invited_by?: string
          joined_at: string
        }
        Insert: {
          id?: string
          circle_id: string
          user_id: string
          role: 'admin' | 'family' | 'caregiver'
          invited_by?: string
          joined_at?: string
        }
        Update: {
          id?: string
          circle_id?: string
          user_id?: string
          role?: 'admin' | 'family' | 'caregiver'
          invited_by?: string
          joined_at?: string
        }
      }
      care_recipients: {
        Row: {
          id: string
          circle_id: string
          full_name: string
          date_of_birth?: string
          photo_url?: string
          medical_conditions: string[]
          allergies: string[]
          insurance_provider?: string
          insurance_policy_number?: string
          notes?: string
          created_at: string
        }
        Insert: {
          id?: string
          circle_id: string
          full_name: string
          date_of_birth?: string
          photo_url?: string
          medical_conditions?: string[]
          allergies?: string[]
          insurance_provider?: string
          insurance_policy_number?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          circle_id?: string
          full_name?: string
          date_of_birth?: string
          photo_url?: string
          medical_conditions?: string[]
          allergies?: string[]
          insurance_provider?: string
          insurance_policy_number?: string
          notes?: string
          created_at?: string
        }
      }
      emergency_contacts: {
        Row: {
          id: string
          recipient_id: string
          name: string
          relationship: string
          phone: string
          email?: string
          is_primary: boolean
        }
        Insert: {
          id?: string
          recipient_id: string
          name: string
          relationship: string
          phone: string
          email?: string
          is_primary?: boolean
        }
        Update: {
          id?: string
          recipient_id?: string
          name?: string
          relationship?: string
          phone?: string
          email?: string
          is_primary?: boolean
        }
      }
      doctors: {
        Row: {
          id: string
          recipient_id: string
          name: string
          specialty: string
          phone?: string
          address?: string
          notes?: string
        }
        Insert: {
          id?: string
          recipient_id: string
          name: string
          specialty: string
          phone?: string
          address?: string
          notes?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          name?: string
          specialty?: string
          phone?: string
          address?: string
          notes?: string
        }
      }
      medications: {
        Row: {
          id: string
          recipient_id: string
          name: string
          dosage: string
          frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed'
          times_of_day: string[]
          instructions?: string
          prescribing_doctor?: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          name: string
          dosage: string
          frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed'
          times_of_day?: string[]
          instructions?: string
          prescribing_doctor?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          name?: string
          dosage?: string
          frequency?: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed'
          times_of_day?: string[]
          instructions?: string
          prescribing_doctor?: string
          is_active?: boolean
          created_at?: string
        }
      }
      medication_logs: {
        Row: {
          id: string
          medication_id: string
          scheduled_time: string
          given_at?: string
          given_by?: string
          status: 'given' | 'missed' | 'skipped' | 'refused'
          notes?: string
        }
        Insert: {
          id?: string
          medication_id: string
          scheduled_time: string
          given_at?: string
          given_by?: string
          status: 'given' | 'missed' | 'skipped' | 'refused'
          notes?: string
        }
        Update: {
          id?: string
          medication_id?: string
          scheduled_time?: string
          given_at?: string
          given_by?: string
          status?: 'given' | 'missed' | 'skipped' | 'refused'
          notes?: string
        }
      }
      shifts: {
        Row: {
          id: string
          circle_id: string
          caregiver_id: string
          date: string
          start_time: string
          end_time: string
          is_recurring: boolean
          recurrence_pattern?: Json
          notes?: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          circle_id: string
          caregiver_id: string
          date: string
          start_time: string
          end_time: string
          is_recurring?: boolean
          recurrence_pattern?: Json
          notes?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          circle_id?: string
          caregiver_id?: string
          date?: string
          start_time?: string
          end_time?: string
          is_recurring?: boolean
          recurrence_pattern?: Json
          notes?: string
          created_by?: string
          created_at?: string
        }
      }
      care_logs: {
        Row: {
          id: string
          circle_id: string
          recipient_id: string
          author_id: string
          category: 'meal' | 'mood' | 'activity' | 'incident' | 'vitals' | 'note'
          content: string
          photo_url?: string
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          circle_id: string
          recipient_id: string
          author_id: string
          category: 'meal' | 'mood' | 'activity' | 'incident' | 'vitals' | 'note'
          content: string
          photo_url?: string
          logged_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          circle_id?: string
          recipient_id?: string
          author_id?: string
          category?: 'meal' | 'mood' | 'activity' | 'incident' | 'vitals' | 'note'
          content?: string
          photo_url?: string
          logged_at?: string
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          recipient_id: string
          doctor_id?: string
          date_time: string
          location?: string
          purpose: string
          post_visit_notes?: string
          reminder_sent: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          doctor_id?: string
          date_time: string
          location?: string
          purpose: string
          post_visit_notes?: string
          reminder_sent?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          doctor_id?: string
          date_time?: string
          location?: string
          purpose?: string
          post_visit_notes?: string
          reminder_sent?: boolean
          created_by?: string
          created_at?: string
        }
      }
    }
  }
}
