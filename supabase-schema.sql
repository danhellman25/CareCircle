-- CareCircle Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/chhwfraakmconptlvrym/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care circles table
CREATE TABLE IF NOT EXISTS care_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'canceled', 'past_due')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circle members table
CREATE TABLE IF NOT EXISTS circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'family', 'caregiver')),
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- Care recipients table
CREATE TABLE IF NOT EXISTS care_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  photo_url TEXT,
  medical_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES care_recipients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN DEFAULT false
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES care_recipients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  notes TEXT
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES care_recipients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed')),
  times_of_day TEXT[] DEFAULT '{}',
  instructions TEXT,
  prescribing_doctor TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  given_at TIMESTAMPTZ,
  given_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('given', 'missed', 'skipped', 'refused')),
  notes TEXT
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care logs table
CREATE TABLE IF NOT EXISTS care_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID REFERENCES care_circles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES care_recipients(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  category TEXT NOT NULL CHECK (category IN ('meal', 'mood', 'activity', 'incident', 'vitals', 'note')),
  content TEXT NOT NULL,
  photo_url TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES care_recipients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  date_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  purpose TEXT NOT NULL,
  post_visit_notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/write their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Care circles: Members can view their circles
CREATE POLICY "Circle members can view circles" ON care_circles FOR SELECT USING (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = id AND user_id = auth.uid())
  OR created_by = auth.uid()
);
CREATE POLICY "Admins can insert circles" ON care_circles FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Admins can update circles" ON care_circles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = id AND user_id = auth.uid() AND role = 'admin')
);

-- Circle members: Members can view other members in their circles
CREATE POLICY "Members can view circle members" ON circle_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid())
  OR user_id = auth.uid()
);
CREATE POLICY "Admins can insert members" ON circle_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = circle_id AND user_id = auth.uid() AND role = 'admin')
  OR invited_by = auth.uid()
);

-- Care recipients: Circle members can view recipients in their circles
CREATE POLICY "Members can view care recipients" ON care_recipients FOR SELECT USING (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = care_recipients.circle_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can insert recipients" ON care_recipients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = care_recipients.circle_id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update recipients" ON care_recipients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = care_recipients.circle_id AND user_id = auth.uid() AND role = 'admin')
);

-- Emergency contacts: Circle members can view
CREATE POLICY "Members can view emergency contacts" ON emergency_contacts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM care_recipients cr 
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE cr.id = emergency_contacts.recipient_id AND cm.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage emergency contacts" ON emergency_contacts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM care_recipients cr 
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE cr.id = emergency_contacts.recipient_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
  )
);

-- Doctors: Circle members can view
CREATE POLICY "Members can view doctors" ON doctors FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM care_recipients cr 
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE cr.id = doctors.recipient_id AND cm.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage doctors" ON doctors FOR ALL USING (
  EXISTS (
    SELECT 1 FROM care_recipients cr 
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE cr.id = doctors.recipient_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
  )
);

-- Medications: Circle members can view
CREATE POLICY "Members can view medications" ON medications FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM care_recipients cr 
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE cr.id = medications.recipient_id AND cm.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage medications" ON medications FOR ALL USING (
  EXISTS (
    SELECT 1 FROM care_recipients cr 
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE cr.id = medications.recipient_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
  )
);

-- Medication logs: Circle members can view and create
CREATE POLICY "Members can view medication logs" ON medication_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM medications m
    JOIN care_recipients cr ON m.recipient_id = cr.id
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE m.id = medication_logs.medication_id AND cm.user_id = auth.uid()
  )
);
CREATE POLICY "Members can create medication logs" ON medication_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM medications m
    JOIN care_recipients cr ON m.recipient_id = cr.id
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE m.id = medication_logs.medication_id AND cm.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can update medication logs" ON medication_logs FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM medications m
    JOIN care_recipients cr ON m.recipient_id = cr.id
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE m.id = medication_logs.medication_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
  )
);

-- Shifts: Circle members can view, admins can manage
CREATE POLICY "Members can view shifts" ON shifts FOR SELECT USING (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = shifts.circle_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage shifts" ON shifts FOR ALL USING (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = shifts.circle_id AND user_id = auth.uid() AND role = 'admin')
);

-- Care logs: Circle members can view and create
CREATE POLICY "Members can view care logs" ON care_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = care_logs.circle_id AND user_id = auth.uid())
);
CREATE POLICY "Members can create care logs" ON care_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = care_logs.circle_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can delete care logs" ON care_logs FOR DELETE USING (
  EXISTS (SELECT 1 FROM circle_members WHERE circle_id = care_logs.circle_id AND user_id = auth.uid() AND role = 'admin')
);

-- Appointments: Circle members can view, admins can manage
CREATE POLICY "Members can view appointments" ON appointments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM care_recipients cr 
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE cr.id = appointments.recipient_id AND cm.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage appointments" ON appointments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM care_recipients cr 
    JOIN circle_members cm ON cr.circle_id = cm.circle_id 
    WHERE cr.id = appointments.recipient_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
  )
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_care_recipients_circle_id ON care_recipients(circle_id);
CREATE INDEX IF NOT EXISTS idx_shifts_circle_id ON shifts(circle_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(date);
CREATE INDEX IF NOT EXISTS idx_shifts_caregiver_id ON shifts(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_appointments_recipient_id ON appointments(recipient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(date_time);
CREATE INDEX IF NOT EXISTS idx_care_logs_circle_id ON care_logs(circle_id);
CREATE INDEX IF NOT EXISTS idx_medications_recipient_id ON medications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_medication_id ON medication_logs(medication_id);
