'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  getCareRecipient,
  getCareCircle,
  getCurrentShift,
  getShifts,
  getMedications,
  getMedicationLogs,
  getRecentCareLogs,
  getUpcomingAppointments,
  addCareLog,
  logMedication,
  addAppointment,
  seedDemoData,
  checkDemoDataExists,
  DEMO_IDS,
} from '@/lib/data';
import { formatDate, formatTime, formatRelativeTime, formatDateTime } from '@/lib/utils';
import {
  Clock,
  Pill,
  ClipboardList,
  Calendar,
  Plus,
  ChevronRight,
  Heart,
  Activity,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { CareLogCategory, Shift, CareLog, Medication, MedicationLog, Appointment } from '@/types';

const careLogCategoryColors: Record<CareLogCategory, string> = {
  meal: 'bg-orange-100 text-orange-700',
  mood: 'bg-purple-100 text-purple-700',
  activity: 'bg-green-100 text-green-700',
  incident: 'bg-red-100 text-red-700',
  vitals: 'bg-blue-100 text-blue-700',
  note: 'bg-gray-100 text-gray-700',
};

const careLogCategoryLabels: Record<CareLogCategory, string> = {
  meal: 'Meal',
  mood: 'Mood',
  activity: 'Activity',
  incident: 'Incident',
  vitals: 'Vitals',
  note: 'Note',
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSeed, setNeedsSeed] = useState(false);
  
  // Data states
  const [careRecipient, setCareRecipient] = useState<any>(null);
  const [careCircle, setCareCircle] = useState<any>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);

  // Modal states
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [isAddApptModalOpen, setIsAddApptModalOpen] = useState(false);
  
  // Form states
  const [careLogForm, setCareLogForm] = useState({ category: 'note' as CareLogCategory, content: '' });
  const [medLogForm, setMedLogForm] = useState({ medication_id: '', status: 'given' as const, notes: '' });
  const [apptForm, setApptForm] = useState({ doctorName: '', specialty: '', dateTime: '', location: '', purpose: '' });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if demo data exists
      const exists = await checkDemoDataExists();
      if (!exists) {
        setNeedsSeed(true);
      }

      // Load all data in parallel
      const [
        recipient,
        circle,
        shiftsData,
        meds,
        medLogs,
        logs,
        appts,
      ] = await Promise.all([
        getCareRecipient(),
        getCareCircle(),
        getShifts(),
        getMedications(),
        getMedicationLogs(),
        getRecentCareLogs(5),
        getUpcomingAppointments(),
      ]);

      setCareRecipient(recipient);
      setCareCircle(circle);
      setShifts(shiftsData);
      setCurrentShift(getCurrentShift(shiftsData));
      setMedications(meds);
      setMedicationLogs(medLogs);
      setCareLogs(logs);
      setAppointments(appts);
      setNextAppointment(appts[0] || null);
    } catch (err: any) {
      setError('Failed to load dashboard data. Using demo data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSeedData() {
    setIsLoading(true);
    const result = await seedDemoData();
    if (result.success) {
      setNeedsSeed(false);
      await loadData();
    } else {
      setError(result.error || 'Failed to seed demo data');
    }
    setIsLoading(false);
  }

  async function handleAddCareLog(e: React.FormEvent) {
    e.preventDefault();
    if (!careLogForm.content) return;

    const result = await addCareLog({
      circle_id: DEMO_IDS.circle,
      recipient_id: DEMO_IDS.recipient,
      author_id: DEMO_IDS.user,
      category: careLogForm.category,
      content: careLogForm.content,
      logged_at: new Date().toISOString(),
    });

    if (result) {
      setIsAddEntryModalOpen(false);
      setCareLogForm({ category: 'note', content: '' });
      await loadData();
    }
  }

  async function handleLogMedication(e: React.FormEvent) {
    e.preventDefault();
    if (!medLogForm.medication_id) return;

    const success = await logMedication(
      medLogForm.medication_id,
      medLogForm.status,
      medLogForm.notes,
      DEMO_IDS.user
    );

    if (success) {
      setIsAddMedModalOpen(false);
      setMedLogForm({ medication_id: '', status: 'given', notes: '' });
      await loadData();
    }
  }

  async function handleAddAppointment(e: React.FormEvent) {
    e.preventDefault();
    if (!apptForm.doctorName || !apptForm.dateTime || !apptForm.purpose) return;

    // First create the doctor
    const doctorId = `doctor-${Date.now()}`;
    
    // Then create the appointment
    const result = await addAppointment({
      recipient_id: DEMO_IDS.recipient,
      doctor_id: doctorId,
      date_time: new Date(apptForm.dateTime).toISOString(),
      location: apptForm.location,
      purpose: apptForm.purpose,
      reminder_sent: false,
      created_by: DEMO_IDS.user,
    });

    if (result) {
      setIsAddApptModalOpen(false);
      setApptForm({ doctorName: '', specialty: '', dateTime: '', location: '', purpose: '' });
      await loadData();
    }
  }

  const givenCount = medicationLogs.filter((m) => m.status === 'given').length;
  const totalCount = medicationLogs.length;
  const progressPercentage = totalCount > 0 ? (givenCount / totalCount) * 100 : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysShifts = shifts.filter(s => s.date === todayStr);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error / Seed Banner */}
      {(error || needsSeed) && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${needsSeed ? 'bg-blue-50 border border-blue-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <AlertCircle className={`w-5 h-5 ${needsSeed ? 'text-blue-600' : 'text-yellow-600'}`} />
          <div className="flex-1">
            <p className={`text-sm ${needsSeed ? 'text-blue-800' : 'text-yellow-800'}`}>
              {needsSeed ? 'No demo data found in Supabase. Seed the database to get started.' : error}
            </p>
          </div>
          {needsSeed && (
            <Button onClick={handleSeedData} size="sm" variant="primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Seed Demo Data
            </Button>
          )}
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-text-light">Overview of {careRecipient?.full_name || 'care recipient'}&apos;s care today</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Who's on duty */}
        <Card className="bg-secondary-light/50 border-secondary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-secondary-dark" />
              <span className="font-medium text-text">Who&apos;s on duty</span>
            </div>
            {currentShift ? (
              <div className="flex items-center gap-3">
                <Avatar
                  src={currentShift.caregiver?.avatar_url}
                  name={currentShift.caregiver?.full_name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-text">{currentShift.caregiver?.full_name}</p>
                  <p className="text-sm text-text-light">
                    Until {formatTime(`2000-01-01T${currentShift.end_time}`)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-text">No one on duty</p>
                  <p className="text-sm text-text-light">Check the schedule</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medication Progress */}
        <Card className="bg-primary-light/50 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-primary" />
              <span className="font-medium text-text">Today&apos;s Medications</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-text">
                  {givenCount}/{totalCount}
                </span>
                <span className="text-sm text-text-light">given</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Appointment */}
        <Card className="bg-accent-light/50 border-accent/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-accent" />
              <span className="font-medium text-text">Next Appointment</span>
            </div>
            {nextAppointment ? (
              <div>
                <p className="font-medium text-text">{nextAppointment.doctor?.name || 'Doctor'}</p>
                <p className="text-sm text-text-light">
                  {formatDateTime(nextAppointment.date_time)}
                </p>
                <p className="text-xs text-text-muted mt-1">{nextAppointment.purpose}</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-text">No upcoming appointments</p>
                <p className="text-sm text-text-light">Schedule one now</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Care Recipient Info */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-text">Care Recipient</span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar src={careRecipient?.photo_url} name={careRecipient?.full_name} size="md" />
              <div>
                <p className="font-medium text-text">{careRecipient?.full_name}</p>
                <p className="text-xs text-text-light">
                  {careRecipient?.medical_conditions?.length || 0} conditions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button onClick={() => setIsAddMedModalOpen(true)} size="sm" className="sm:text-base sm:px-4 sm:py-2.5">
          <Plus className="w-4 h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Log Medication</span>
          <span className="sm:hidden">Log Med</span>
        </Button>
        <Button variant="secondary" onClick={() => setIsAddEntryModalOpen(true)} size="sm" className="sm:text-base sm:px-4 sm:py-2.5">
          <ClipboardList className="w-4 h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Add Care Log</span>
          <span className="sm:hidden">Add Log</span>
        </Button>
        <Button variant="outline" onClick={() => setIsAddApptModalOpen(true)} size="sm" className="sm:text-base sm:px-4 sm:py-2.5">
          <Calendar className="w-4 h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Schedule Appt</span>
          <span className="sm:hidden">Appt</span>
        </Button>
        <Link href="/dashboard/team">
          <Button variant="ghost" size="sm" className="sm:text-base sm:px-4 sm:py-2.5">
            <Users className="w-4 h-4 mr-1.5 sm:mr-2" />
            Team
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Care Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Care Logs</CardTitle>
              <CardDescription>Latest updates from the care team</CardDescription>
            </div>
            <Link href="/dashboard/care-log">
              <Button variant="ghost" size="sm">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {careLogs.map((log) => (
                <div key={log.id} className="flex gap-3 p-3 rounded-xl bg-background">
                  <Avatar
                    src={log.author?.avatar_url}
                    name={log.author?.full_name}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text text-sm">{log.author?.full_name}</span>
                      <Badge
                        variant="default"
                        className={careLogCategoryColors[log.category]}
                      >
                        {careLogCategoryLabels[log.category]}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        {formatRelativeTime(log.logged_at)}
                      </span>
                    </div>
                    <p className="text-sm text-text-light mt-1 line-clamp-2">{log.content}</p>
                  </div>
                </div>
              ))}
              {careLogs.length === 0 && (
                <div className="text-center py-6 text-text-light">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No care logs yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Shifts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <CardDescription>Who&apos;s caring for {careRecipient?.full_name || 'care recipient'} today</CardDescription>
            </div>
            <Link href="/dashboard/schedule">
              <Button variant="ghost" size="sm">
                View full
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysShifts.map((shift) => {
                const isCurrent = currentShift?.id === shift.id;
                return (
                  <div
                    key={shift.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isCurrent ? 'bg-secondary-light border border-secondary/30' : 'bg-background'
                    }`}
                  >
                    <div
                      className={`w-1 h-10 rounded-full ${
                        isCurrent ? 'bg-secondary' : 'bg-gray-300'
                      }`}
                    />
                    <Avatar
                      src={shift.caregiver?.avatar_url}
                      name={shift.caregiver?.full_name}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-text">{shift.caregiver?.full_name}</p>
                      <p className="text-sm text-text-light">
                        {shift.start_time} - {shift.end_time}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge variant="success" size="sm">
                        On Duty
                      </Badge>
                    )}
                  </div>
                );
              })}
              {todaysShifts.length === 0 && (
                <div className="text-center py-6 text-text-light">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No shifts scheduled for today</p>
                  <Link href="/dashboard/schedule">
                    <Button variant="outline" size="sm" className="mt-3">
                      Add Shift
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Modal */}
      <Modal
        isOpen={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        title="Add Care Log Entry"
        description="Record a note about care activities, mood, or observations"
      >
        <form onSubmit={handleAddCareLog} className="space-y-4">
          <Select
            label="Category"
            value={careLogForm.category}
            onChange={(e) => setCareLogForm({ ...careLogForm, category: e.target.value as CareLogCategory })}
            options={[
              { value: 'meal', label: 'Meal' },
              { value: 'mood', label: 'Mood' },
              { value: 'activity', label: 'Activity' },
              { value: 'incident', label: 'Incident' },
              { value: 'vitals', label: 'Vitals' },
              { value: 'note', label: 'Note' },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Notes</label>
            <textarea
              rows={4}
              value={careLogForm.content}
              onChange={(e) => setCareLogForm({ ...careLogForm, content: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="What happened? How did they seem?"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsAddEntryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddMedModalOpen}
        onClose={() => setIsAddMedModalOpen(false)}
        title="Log Medication"
        description="Record medication administration"
      >
        <form onSubmit={handleLogMedication} className="space-y-4">
          <Select
            label="Medication"
            value={medLogForm.medication_id}
            onChange={(e) => setMedLogForm({ ...medLogForm, medication_id: e.target.value })}
            options={medications.map(m => ({ value: m.id, label: `${m.name} ${m.dosage}` }))}
            required
          />
          <Select
            label="Status"
            value={medLogForm.status}
            onChange={(e) => setMedLogForm({ ...medLogForm, status: e.target.value as any })}
            options={[
              { value: 'given', label: 'Given' },
              { value: 'missed', label: 'Missed' },
              { value: 'skipped', label: 'Skipped' },
              { value: 'refused', label: 'Refused' },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Notes (optional)</label>
            <textarea
              rows={2}
              value={medLogForm.notes}
              onChange={(e) => setMedLogForm({ ...medLogForm, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Any observations?"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsAddMedModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Appointment Modal */}
      <Modal
        isOpen={isAddApptModalOpen}
        onClose={() => setIsAddApptModalOpen(false)}
        title="Schedule Appointment"
        description="Add a new appointment to the calendar"
      >
        <form onSubmit={handleAddAppointment} className="space-y-4">
          <Input 
            label="Doctor Name" 
            placeholder="Dr. Smith" 
            value={apptForm.doctorName}
            onChange={(e) => setApptForm({ ...apptForm, doctorName: e.target.value })}
            required 
          />
          <Select
            label="Specialty"
            value={apptForm.specialty}
            onChange={(e) => setApptForm({ ...apptForm, specialty: e.target.value })}
            options={[
              { value: '', label: 'Select specialty...' },
              { value: 'primary', label: 'Primary Care' },
              { value: 'cardiology', label: 'Cardiology' },
              { value: 'endocrinology', label: 'Endocrinology' },
              { value: 'neurology', label: 'Neurology' },
              { value: 'orthopedics', label: 'Orthopedics' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input 
            label="Date & Time" 
            type="datetime-local" 
            value={apptForm.dateTime}
            onChange={(e) => setApptForm({ ...apptForm, dateTime: e.target.value })}
            required 
          />
          <Input 
            label="Location" 
            placeholder="123 Medical Center Dr" 
            value={apptForm.location}
            onChange={(e) => setApptForm({ ...apptForm, location: e.target.value })}
          />
          <Input 
            label="Purpose" 
            placeholder="Annual checkup" 
            value={apptForm.purpose}
            onChange={(e) => setApptForm({ ...apptForm, purpose: e.target.value })}
            required 
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsAddApptModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
