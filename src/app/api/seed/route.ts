import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, DEMO_IDS } from '@/lib/supabase';

// This route seeds demo data to Supabase for testing purposes
// In production, this should be protected or removed

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const results: Record<string, any> = {};

    // 1. Create or update demo profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: DEMO_IDS.user,
        full_name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '(555) 123-4567',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileError) throw profileError;
    results.profile = profile;

    // 2. Create or update demo care circle
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    const { data: circle, error: circleError } = await supabase
      .from('care_circles')
      .upsert({
        id: DEMO_IDS.circle,
        name: "Mom's Care Team",
        created_by: DEMO_IDS.user,
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (circleError) throw circleError;
    results.circle = circle;

    // 3. Create or update circle membership
    const { data: member, error: memberError } = await supabase
      .from('circle_members')
      .upsert({
        circle_id: DEMO_IDS.circle,
        user_id: DEMO_IDS.user,
        role: 'admin',
        joined_at: new Date().toISOString(),
      }, { onConflict: 'circle_id,user_id' })
      .select()
      .single();

    if (memberError) throw memberError;
    results.member = member;

    // 4. Create or update care recipient
    const { data: recipient, error: recipientError } = await supabase
      .from('care_recipients')
      .upsert({
        id: DEMO_IDS.recipient,
        circle_id: DEMO_IDS.circle,
        full_name: 'Eleanor Johnson',
        date_of_birth: '1945-03-12',
        photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eleanor&gender=female',
        medical_conditions: ['Hypertension', 'Type 2 Diabetes', 'Arthritis'],
        allergies: ['Penicillin', 'Shellfish'],
        insurance_provider: 'Blue Cross Blue Shield',
        insurance_policy_number: 'BC123456789',
        notes: 'Loves gardening and classical music. Prefers morning appointments.',
      }, { onConflict: 'id' })
      .select()
      .single();

    if (recipientError) throw recipientError;
    results.recipient = recipient;

    // 5. Create additional profiles for caregivers
    const caregiverProfiles = [
      {
        id: 'demo-user-2',
        full_name: 'Michael Johnson',
        email: 'michael@example.com',
        phone: '(555) 234-5678',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      },
      {
        id: 'demo-user-3',
        full_name: 'Maria Garcia',
        email: 'maria@example.com',
        phone: '(555) 345-6789',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      },
      {
        id: 'demo-user-4',
        full_name: 'James Wilson',
        email: 'james@example.com',
        phone: '(555) 456-7890',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      },
    ];

    for (const cp of caregiverProfiles) {
      await supabase.from('profiles').upsert(cp, { onConflict: 'id' });
      await supabase.from('circle_members').upsert({
        circle_id: DEMO_IDS.circle,
        user_id: cp.id,
        role: cp.id === 'demo-user-2' ? 'family' : 'caregiver',
        joined_at: new Date().toISOString(),
      }, { onConflict: 'circle_id,user_id' });
    }
    results.caregivers = caregiverProfiles;

    // 6. Create doctors
    const doctors = [
      {
        id: 'demo-doctor-1',
        recipient_id: DEMO_IDS.recipient,
        name: 'Dr. Robert Chen',
        specialty: 'Internal Medicine',
        phone: '(555) 987-6543',
        address: '123 Medical Center Dr, Suite 200',
        notes: 'Annual checkup scheduled for March',
      },
      {
        id: 'demo-doctor-2',
        recipient_id: DEMO_IDS.recipient,
        name: 'Dr. Lisa Patel',
        specialty: 'Endocrinology',
        phone: '(555) 876-5432',
        address: '456 Diabetes Care Center',
        notes: 'Diabetes management specialist',
      },
      {
        id: 'demo-doctor-3',
        recipient_id: DEMO_IDS.recipient,
        name: 'Dr. James Morrison',
        specialty: 'Rheumatology',
        phone: '(555) 765-4321',
        address: '789 Orthopedic Plaza, Suite 150',
        notes: 'Arthritis treatment and pain management',
      },
    ];

    for (const doctor of doctors) {
      await supabase.from('doctors').upsert(doctor, { onConflict: 'id' });
    }
    results.doctors = doctors;

    // 7. Create medications
    const medications = [
      {
        id: 'demo-med-1',
        recipient_id: DEMO_IDS.recipient,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice_daily',
        times_of_day: ['08:00', '20:00'],
        instructions: 'Take with food to reduce stomach upset',
        prescribing_doctor: 'demo-doctor-2',
        is_active: true,
      },
      {
        id: 'demo-med-2',
        recipient_id: DEMO_IDS.recipient,
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'daily',
        times_of_day: ['08:00'],
        instructions: 'Take in the morning with water',
        prescribing_doctor: 'demo-doctor-1',
        is_active: true,
      },
      {
        id: 'demo-med-3',
        recipient_id: DEMO_IDS.recipient,
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'daily',
        times_of_day: ['20:00'],
        instructions: 'Take at bedtime',
        prescribing_doctor: 'demo-doctor-1',
        is_active: true,
      },
      {
        id: 'demo-med-4',
        recipient_id: DEMO_IDS.recipient,
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'as_needed',
        times_of_day: [],
        instructions: 'Take as needed for arthritis pain, max 3 per day',
        prescribing_doctor: 'demo-doctor-3',
        is_active: true,
      },
    ];

    for (const med of medications) {
      await supabase.from('medications').upsert(med, { onConflict: 'id' });
    }
    results.medications = medications;

    // 8. Create emergency contacts
    const emergencyContacts = [
      {
        id: 'demo-emergency-1',
        recipient_id: DEMO_IDS.recipient,
        name: 'Dr. Robert Chen',
        relationship: 'Primary Care Physician',
        phone: '(555) 987-6543',
        email: 'dr.chen@medicare.com',
        is_primary: true,
      },
      {
        id: 'demo-emergency-2',
        recipient_id: DEMO_IDS.recipient,
        name: 'Sarah Johnson',
        relationship: 'Daughter',
        phone: '(555) 123-4567',
        email: 'sarah@example.com',
        is_primary: false,
      },
    ];

    for (const contact of emergencyContacts) {
      await supabase.from('emergency_contacts').upsert(contact, { onConflict: 'id' });
    }
    results.emergencyContacts = emergencyContacts;

    // 9. Create shifts for the current week
    const today = new Date();
    const shifts = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Morning shift
      shifts.push({
        circle_id: DEMO_IDS.circle,
        caregiver_id: 'demo-user-3', // Maria
        date: dateStr,
        start_time: '08:00',
        end_time: '16:00',
        is_recurring: i < 5, // Recurring on weekdays
        notes: 'Morning shift - medication administration',
        created_by: DEMO_IDS.user,
      });
      
      // Evening shift
      shifts.push({
        circle_id: DEMO_IDS.circle,
        caregiver_id: 'demo-user-4', // James
        date: dateStr,
        start_time: '16:00',
        end_time: '22:00',
        is_recurring: i < 5,
        notes: 'Evening shift',
        created_by: DEMO_IDS.user,
      });
    }

    // Delete existing shifts for this circle to avoid duplicates
    await supabase.from('shifts').delete().eq('circle_id', DEMO_IDS.circle);
    
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .insert(shifts)
      .select();

    if (shiftsError) throw shiftsError;
    results.shifts = shiftsData;

    // 10. Create care logs
    const careLogs = [
      {
        circle_id: DEMO_IDS.circle,
        recipient_id: DEMO_IDS.recipient,
        author_id: 'demo-user-3',
        category: 'meal',
        content: 'Had a good breakfast - oatmeal with berries and tea. Ate about 80% of her meal.',
        logged_at: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        circle_id: DEMO_IDS.circle,
        recipient_id: DEMO_IDS.recipient,
        author_id: 'demo-user-3',
        category: 'mood',
        content: 'Seems cheerful today. Mentioned she slept well last night.',
        logged_at: new Date(today.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        circle_id: DEMO_IDS.circle,
        recipient_id: DEMO_IDS.recipient,
        author_id: 'demo-user-3',
        category: 'activity',
        content: 'Went for a 15-minute walk in the garden. Enjoyed looking at the new blooms.',
        logged_at: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        circle_id: DEMO_IDS.circle,
        recipient_id: DEMO_IDS.recipient,
        author_id: DEMO_IDS.user,
        category: 'note',
        content: 'Called to check in. Mom sounded good and is looking forward to her visit tomorrow.',
        logged_at: new Date(today.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        circle_id: DEMO_IDS.circle,
        recipient_id: DEMO_IDS.recipient,
        author_id: 'demo-user-4',
        category: 'vitals',
        content: 'BP: 128/82, Pulse: 72, Temp: 98.4°F. All vitals stable.',
        logged_at: new Date(today.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Delete existing care logs for this circle
    await supabase.from('care_logs').delete().eq('circle_id', DEMO_IDS.circle);
    
    const { data: careLogsData, error: careLogsError } = await supabase
      .from('care_logs')
      .insert(careLogs)
      .select();

    if (careLogsError) throw careLogsError;
    results.careLogs = careLogsData;

    // 11. Create appointments
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const appointments = [
      {
        recipient_id: DEMO_IDS.recipient,
        doctor_id: 'demo-doctor-1',
        date_time: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        location: '123 Medical Center Dr, Suite 200',
        purpose: 'Annual physical exam',
        reminder_sent: true,
        created_by: DEMO_IDS.user,
      },
      {
        recipient_id: DEMO_IDS.recipient,
        doctor_id: 'demo-doctor-2',
        date_time: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000).toISOString(),
        location: '456 Diabetes Care Center',
        purpose: 'Diabetes check-up and A1C review',
        reminder_sent: false,
        created_by: DEMO_IDS.user,
      },
      {
        recipient_id: DEMO_IDS.recipient,
        doctor_id: 'demo-doctor-3',
        date_time: new Date(nextWeek.getTime() + 11 * 60 * 60 * 1000).toISOString(),
        location: '789 Orthopedic Plaza, Suite 150',
        purpose: 'Arthritis follow-up and pain management',
        reminder_sent: false,
        created_by: DEMO_IDS.user,
      },
    ];

    // Delete existing appointments for this recipient
    await supabase.from('appointments').delete().eq('recipient_id', DEMO_IDS.recipient);
    
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (appointmentsError) throw appointmentsError;
    results.appointments = appointmentsData;

    // 12. Create medication logs for today
    const todayStr = today.toISOString().split('T')[0];
    const medicationLogs = [
      {
        medication_id: 'demo-med-1',
        scheduled_time: `${todayStr}T08:00:00Z`,
        given_at: `${todayStr}T08:15:00Z`,
        given_by: 'demo-user-3',
        status: 'given',
        notes: 'Taken with breakfast',
      },
      {
        medication_id: 'demo-med-2',
        scheduled_time: `${todayStr}T08:00:00Z`,
        given_at: `${todayStr}T08:15:00Z`,
        given_by: 'demo-user-3',
        status: 'given',
        notes: '',
      },
      {
        medication_id: 'demo-med-1',
        scheduled_time: `${todayStr}T20:00:00Z`,
        status: 'missed',
        notes: 'Caregiver was delayed',
      },
      {
        medication_id: 'demo-med-3',
        scheduled_time: `${todayStr}T20:00:00Z`,
        status: 'missed',
        notes: '',
      },
    ];

    // Delete existing medication logs for today's medications
    for (const med of medications) {
      await supabase.from('medication_logs').delete().eq('medication_id', med.id);
    }
    
    const { data: medLogsData, error: medLogsError } = await supabase
      .from('medication_logs')
      .insert(medicationLogs)
      .select();

    if (medLogsError) throw medLogsError;
    results.medicationLogs = medLogsData;

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      data: results,
    });

  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed demo data',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if data exists
export async function GET() {
  try {
    const supabase = createServiceClient();
    
    const { data: circle, error } = await supabase
      .from('care_circles')
      .select('id, name')
      .eq('id', DEMO_IDS.circle)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      exists: !!circle,
      circle: circle || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        exists: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
