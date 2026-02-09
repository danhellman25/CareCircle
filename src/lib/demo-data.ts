import {
  Profile,
  CareCircle,
  CircleMember,
  CareRecipient,
  EmergencyContact,
  Doctor,
  Medication,
  MedicationLog,
  Shift,
  CareLog,
  Appointment,
} from '@/types';

export const currentUser: Profile = {
  id: 'user-1',
  full_name: 'Sarah Johnson',
  email: 'sarah@example.com',
  phone: '(555) 123-4567',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  created_at: '2024-01-15T10:00:00Z',
};

export const careCircle: CareCircle = {
  id: 'circle-1',
  name: "Mom's Care Team",
  created_by: 'user-1',
  subscription_status: 'trialing',
  trial_ends_at: '2024-03-15T10:00:00Z',
  created_at: '2024-01-15T10:00:00Z',
};

export const circleMembers: CircleMember[] = [
  {
    id: 'member-1',
    circle_id: 'circle-1',
    user_id: 'user-1',
    role: 'admin',
    joined_at: '2024-01-15T10:00:00Z',
    profile: currentUser,
  },
  {
    id: 'member-2',
    circle_id: 'circle-1',
    user_id: 'user-2',
    role: 'family',
    invited_by: 'user-1',
    joined_at: '2024-01-16T14:30:00Z',
    profile: {
      id: 'user-2',
      full_name: 'Michael Johnson',
      email: 'michael@example.com',
      phone: '(555) 234-5678',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      created_at: '2024-01-16T14:30:00Z',
    },
  },
  {
    id: 'member-3',
    circle_id: 'circle-1',
    user_id: 'user-3',
    role: 'caregiver',
    invited_by: 'user-1',
    joined_at: '2024-01-20T09:00:00Z',
    profile: {
      id: 'user-3',
      full_name: 'Maria Garcia',
      email: 'maria@example.com',
      phone: '(555) 345-6789',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      created_at: '2024-01-20T09:00:00Z',
    },
  },
  {
    id: 'member-4',
    circle_id: 'circle-1',
    user_id: 'user-4',
    role: 'caregiver',
    invited_by: 'user-1',
    joined_at: '2024-01-22T11:00:00Z',
    profile: {
      id: 'user-4',
      full_name: 'James Wilson',
      email: 'james@example.com',
      phone: '(555) 456-7890',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      created_at: '2024-01-22T11:00:00Z',
    },
  },
];

export const careRecipient: CareRecipient = {
  id: 'recipient-1',
  circle_id: 'circle-1',
  full_name: 'Eleanor Johnson',
  date_of_birth: '1945-03-12',
  photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eleanor&gender=female',
  medical_conditions: ['Hypertension', 'Type 2 Diabetes', 'Arthritis'],
  allergies: ['Penicillin', 'Shellfish'],
  insurance_provider: 'Blue Cross Blue Shield',
  insurance_policy_number: 'BC123456789',
  notes: 'Loves gardening and classical music. Prefers morning appointments.',
  created_at: '2024-01-15T10:00:00Z',
};

export const emergencyContacts: EmergencyContact[] = [
  {
    id: 'emergency-1',
    recipient_id: 'recipient-1',
    name: 'Dr. Robert Chen',
    relationship: 'Primary Care Physician',
    phone: '(555) 987-6543',
    email: 'dr.chen@medicare.com',
    is_primary: true,
  },
  {
    id: 'emergency-2',
    recipient_id: 'recipient-1',
    name: 'Sarah Johnson',
    relationship: 'Daughter',
    phone: '(555) 123-4567',
    email: 'sarah@example.com',
    is_primary: false,
  },
];

export const doctors: Doctor[] = [
  {
    id: 'doctor-1',
    recipient_id: 'recipient-1',
    name: 'Dr. Robert Chen',
    specialty: 'Internal Medicine',
    phone: '(555) 987-6543',
    address: '123 Medical Center Dr, Suite 200',
    notes: 'Annual checkup scheduled for March',
  },
  {
    id: 'doctor-2',
    recipient_id: 'recipient-1',
    name: 'Dr. Lisa Patel',
    specialty: 'Endocrinology',
    phone: '(555) 876-5432',
    address: '456 Diabetes Care Center',
    notes: 'Diabetes management specialist',
  },
  {
    id: 'doctor-3',
    recipient_id: 'recipient-1',
    name: 'Dr. James Morrison',
    specialty: 'Rheumatology',
    phone: '(555) 765-4321',
    address: '789 Orthopedic Plaza, Suite 150',
    notes: 'Arthritis treatment and pain management',
  },
];

export const medications: Medication[] = [
  {
    id: 'med-1',
    recipient_id: 'recipient-1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'twice_daily',
    times_of_day: ['08:00', '20:00'],
    instructions: 'Take with food to reduce stomach upset',
    prescribing_doctor: 'doctor-2',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'med-2',
    recipient_id: 'recipient-1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'daily',
    times_of_day: ['08:00'],
    instructions: 'Take in the morning with water',
    prescribing_doctor: 'doctor-1',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'med-3',
    recipient_id: 'recipient-1',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'daily',
    times_of_day: ['20:00'],
    instructions: 'Take at bedtime',
    prescribing_doctor: 'doctor-1',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'med-4',
    recipient_id: 'recipient-1',
    name: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'as_needed',
    times_of_day: [],
    instructions: 'Take as needed for arthritis pain, max 3 per day',
    prescribing_doctor: 'doctor-3',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
  },
];

const today = new Date().toISOString().split('T')[0];

export const medicationLogs: MedicationLog[] = [
  {
    id: 'log-1',
    medication_id: 'med-1',
    scheduled_time: `${today}T08:00:00Z`,
    given_at: `${today}T08:15:00Z`,
    given_by: 'user-3',
    status: 'given',
    medication: medications[0],
    given_by_profile: circleMembers[2].profile,
  },
  {
    id: 'log-2',
    medication_id: 'med-2',
    scheduled_time: `${today}T08:00:00Z`,
    given_at: `${today}T08:15:00Z`,
    given_by: 'user-3',
    status: 'given',
    medication: medications[1],
    given_by_profile: circleMembers[2].profile,
  },
  {
    id: 'log-3',
    medication_id: 'med-1',
    scheduled_time: `${today}T20:00:00Z`,
    status: 'missed',
    medication: medications[0],
  },
  {
    id: 'log-4',
    medication_id: 'med-3',
    scheduled_time: `${today}T20:00:00Z`,
    status: 'missed',
    medication: medications[2],
  },
];

const todayDate = new Date().toISOString().split('T')[0];
const tomorrowDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const nextWeekDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

export const shifts: Shift[] = [
  {
    id: 'shift-1',
    circle_id: 'circle-1',
    caregiver_id: 'user-3',
    date: todayDate,
    start_time: '08:00',
    end_time: '16:00',
    is_recurring: false,
    notes: 'Morning shift - medication administration',
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    caregiver: circleMembers[2].profile,
  },
  {
    id: 'shift-2',
    circle_id: 'circle-1',
    caregiver_id: 'user-4',
    date: todayDate,
    start_time: '16:00',
    end_time: '22:00',
    is_recurring: false,
    notes: 'Evening shift',
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    caregiver: circleMembers[3].profile,
  },
  {
    id: 'shift-3',
    circle_id: 'circle-1',
    caregiver_id: 'user-3',
    date: tomorrowDate,
    start_time: '08:00',
    end_time: '16:00',
    is_recurring: true,
    recurrence_pattern: { daysOfWeek: [1, 2, 3, 4, 5] },
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    caregiver: circleMembers[2].profile,
  },
  {
    id: 'shift-4',
    circle_id: 'circle-1',
    caregiver_id: 'user-4',
    date: tomorrowDate,
    start_time: '16:00',
    end_time: '22:00',
    is_recurring: true,
    recurrence_pattern: { daysOfWeek: [1, 2, 3, 4, 5] },
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    caregiver: circleMembers[3].profile,
  },
];

export const careLogs: CareLog[] = [
  {
    id: 'care-1',
    circle_id: 'circle-1',
    recipient_id: 'recipient-1',
    author_id: 'user-3',
    category: 'meal',
    content: 'Had a good breakfast - oatmeal with berries and tea. Ate about 80% of her meal.',
    logged_at: `${today}T08:30:00Z`,
    created_at: `${today}T08:30:00Z`,
    author: circleMembers[2].profile,
  },
  {
    id: 'care-2',
    circle_id: 'circle-1',
    recipient_id: 'recipient-1',
    author_id: 'user-3',
    category: 'mood',
    content: 'Seems cheerful today. Mentioned she slept well last night.',
    logged_at: `${today}T09:15:00Z`,
    created_at: `${today}T09:15:00Z`,
    author: circleMembers[2].profile,
  },
  {
    id: 'care-3',
    circle_id: 'circle-1',
    recipient_id: 'recipient-1',
    author_id: 'user-3',
    category: 'activity',
    content: 'Went for a 15-minute walk in the garden. Enjoyed looking at the new blooms.',
    logged_at: `${today}T10:45:00Z`,
    created_at: `${today}T10:45:00Z`,
    author: circleMembers[2].profile,
  },
  {
    id: 'care-4',
    circle_id: 'circle-1',
    recipient_id: 'recipient-1',
    author_id: 'user-1',
    category: 'note',
    content: 'Called to check in. Mom sounded good and is looking forward to her visit tomorrow.',
    logged_at: `${today}T14:20:00Z`,
    created_at: `${today}T14:20:00Z`,
    author: circleMembers[0].profile,
  },
  {
    id: 'care-5',
    circle_id: 'circle-1',
    recipient_id: 'recipient-1',
    author_id: 'user-4',
    category: 'vitals',
    content: 'BP: 128/82, Pulse: 72, Temp: 98.4°F. All vitals stable.',
    logged_at: `${today}T16:30:00Z`,
    created_at: `${today}T16:30:00Z`,
    author: circleMembers[3].profile,
  },
];

export const appointments: Appointment[] = [
  {
    id: 'appt-1',
    recipient_id: 'recipient-1',
    doctor_id: 'doctor-1',
    date_time: `${today}T09:00:00Z`,
    location: '123 Medical Center Dr, Suite 200',
    purpose: 'Annual physical exam',
    reminder_sent: true,
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    doctor: doctors[0],
  },
  {
    id: 'appt-2',
    recipient_id: 'recipient-1',
    doctor_id: 'doctor-2',
    date_time: `${tomorrowDate}T14:30:00Z`,
    location: '456 Diabetes Care Center',
    purpose: 'Diabetes check-up and A1C review',
    reminder_sent: false,
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    doctor: doctors[1],
  },
  {
    id: 'appt-3',
    recipient_id: 'recipient-1',
    doctor_id: 'doctor-3',
    date_time: `${nextWeekDate}T11:00:00Z`,
    location: '789 Orthopedic Plaza, Suite 150',
    purpose: 'Arthritis follow-up and pain management',
    reminder_sent: false,
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    doctor: doctors[2],
  },
];

// Helper functions for demo data
export function getCurrentShift(): Shift | null {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
  
  const todayShift = shifts.find(s => {
    if (s.date !== todayDate) return false;
    return currentTime >= s.start_time && currentTime < s.end_time;
  });
  
  return todayShift || null;
}

export function getTodaysMedications(): MedicationLog[] {
  return medicationLogs.filter(log => log.scheduled_time.startsWith(todayDate));
}

export function getTodaysShifts(): Shift[] {
  return shifts.filter(s => s.date === todayDate);
}

export function getUpcomingAppointments(): Appointment[] {
  return appointments.filter(a => new Date(a.date_time) > new Date()).sort((a, b) => 
    new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
  );
}

export function getRecentCareLogs(limit: number = 5): CareLog[] {
  return [...careLogs].sort((a, b) => 
    new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  ).slice(0, limit);
}
