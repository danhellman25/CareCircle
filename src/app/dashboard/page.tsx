'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  currentUser,
  careCircle,
  careRecipient,
  getCurrentShift,
  getTodaysMedications,
  getRecentCareLogs,
  getUpcomingAppointments,
  shifts,
  medicationLogs,
  appointments,
} from '@/lib/demo-data';
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
} from 'lucide-react';
import type { CareLogCategory } from '@/types';

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
  const currentShift = getCurrentShift();
  const todaysMeds = getTodaysMedications();
  const recentLogs = getRecentCareLogs(5);
  const upcomingAppointments = getUpcomingAppointments();
  const nextAppointment = upcomingAppointments[0];

  const givenCount = todaysMeds.filter((m) => m.status === 'given').length;
  const totalCount = todaysMeds.length;
  const progressPercentage = totalCount > 0 ? (givenCount / totalCount) * 100 : 0;

  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [isAddApptModalOpen, setIsAddApptModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-text-light">Overview of {careRecipient.full_name}&apos;s care today</p>
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
                <p className="font-medium text-text">{nextAppointment.doctor?.name}</p>
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
              <Avatar src={careRecipient.photo_url} name={careRecipient.full_name} size="md" />
              <div>
                <p className="font-medium text-text">{careRecipient.full_name}</p>
                <p className="text-xs text-text-light">
                  {careRecipient.medical_conditions.length} conditions
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
              {recentLogs.map((log) => (
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
            </div>
          </CardContent>
        </Card>

        {/* Today's Shifts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <CardDescription>Who&apos;s caring for {careRecipient.full_name} today</CardDescription>
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
              {shifts
                .filter((s) => s.date === new Date().toISOString().split('T')[0])
                .map((shift) => {
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
              {shifts.filter((s) => s.date === new Date().toISOString().split('T')[0]).length ===
                0 && (
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
        <form className="space-y-4">
          <Select
            label="Category"
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
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="What happened? How did they seem?"
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
        <form className="space-y-4">
          <Select
            label="Medication"
            options={[
              { value: 'med-1', label: 'Metformin 500mg' },
              { value: 'med-2', label: 'Lisinopril 10mg' },
              { value: 'med-3', label: 'Atorvastatin 20mg' },
              { value: 'med-4', label: 'Ibuprofen 400mg' },
            ]}
          />
          <Select
            label="Status"
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
        <form className="space-y-4">
          <Input label="Doctor Name" placeholder="Dr. Smith" />
          <Select
            label="Specialty"
            options={[
              { value: 'primary', label: 'Primary Care' },
              { value: 'cardiology', label: 'Cardiology' },
              { value: 'endocrinology', label: 'Endocrinology' },
              { value: 'neurology', label: 'Neurology' },
              { value: 'orthopedics', label: 'Orthopedics' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input label="Date & Time" type="datetime-local" />
          <Input label="Location" placeholder="123 Medical Center Dr" />
          <Input label="Purpose" placeholder="Annual checkup" />
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
