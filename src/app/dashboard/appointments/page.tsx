'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { appointments, doctors, careRecipient } from '@/lib/demo-data';
import { formatDate, formatTime, formatDateTime, classNames } from '@/lib/utils';
import { Calendar, Plus, MapPin, Clock, FileText, ChevronRight, Check } from 'lucide-react';
import type { Appointment } from '@/types';

export default function AppointmentsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    dateTime: '',
    location: '',
    purpose: '',
  });

  // Sort appointments by date
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
  );

  const now = new Date();
  const upcomingAppointments = sortedAppointments.filter((a) => new Date(a.date_time) > now);
  const pastAppointments = sortedAppointments.filter((a) => new Date(a.date_time) <= now);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to backend
    setIsAddModalOpen(false);
    setFormData({
      doctorName: '',
      specialty: '',
      dateTime: '',
      location: '',
      purpose: '',
    });
  };

  const getAppointmentStatus = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date_time);
    const isPast = appointmentDate < now;
    const isToday =
      appointmentDate.toDateString() === now.toDateString();

    if (isPast) return { label: 'Completed', variant: 'default' as const };
    if (isToday) return { label: 'Today', variant: 'success' as const };
    return { label: 'Upcoming', variant: 'primary' as const };
  };

  const isUpcomingSoon = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text">Appointments</h1>
          <p className="text-sm sm:text-base text-text-light">Manage {careRecipient.full_name}&apos;s medical appointments</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="sm:text-base sm:px-4 sm:py-2.5">
          <Plus className="w-4 h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Add Appointment</span>
          <span className="sm:hidden">Add Appt</span>
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Scheduled visits and check-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => {
              const status = getAppointmentStatus(appointment);
              const isSoon = isUpcomingSoon(appointment.date_time);

              return (
                <div
                  key={appointment.id}
                  className={classNames(
                    'p-3 sm:p-4 rounded-xl border transition-all hover:shadow-soft',
                    isSoon ? 'bg-primary-light/30 border-primary' : 'bg-background border-border'
                  )}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Date box */}
                    <div
                      className={classNames(
                        'flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center',
                        isSoon ? 'bg-primary text-white' : 'bg-gray-100'
                      )}
                    >
                      <span
                        className={classNames(
                          'text-[10px] sm:text-xs font-medium uppercase',
                          isSoon ? 'text-white/80' : 'text-text-light'
                        )}
                      >
                        {new Date(appointment.date_time).toLocaleDateString('en-US', {
                          month: 'short',
                        })}
                      </span>
                      <span
                        className={classNames(
                          'text-xl sm:text-2xl font-bold',
                          isSoon ? 'text-white' : 'text-text'
                        )}
                      >
                        {new Date(appointment.date_time).getDate()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <h3 className="font-semibold text-text text-sm sm:text-base truncate">
                          {appointment.doctor?.name || 'Unknown Doctor'}
                        </h3>
                        <Badge variant={status.variant} size="sm">{status.label}</Badge>
                        {isSoon && (
                          <Badge variant="warning" size="sm">
                            24h
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-text-light mb-1.5 sm:mb-2 truncate">{appointment.purpose}</p>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {formatTime(appointment.date_time)}
                        </div>
                        {appointment.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="truncate max-w-[120px] sm:max-w-[200px]">{appointment.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                        <span className="hidden sm:inline">Details</span>
                        <ChevronRight className="w-4 h-4 sm:ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {upcomingAppointments.length === 0 && (
              <div className="text-center py-12 text-text-light">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No upcoming appointments</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                  Schedule one now
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
            <CardDescription>Completed visits and check-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-border opacity-75"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-200 flex flex-col items-center justify-center">
                    <span className="text-xs text-text-light">
                      {new Date(appointment.date_time).toLocaleDateString('en-US', {
                        month: 'short',
                      })}
                    </span>
                    <span className="text-lg font-bold text-text">
                      {new Date(appointment.date_time).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text">{appointment.doctor?.name}</h3>
                    <p className="text-sm text-text-light truncate">{appointment.purpose}</p>
                  </div>

                  <Badge variant="default">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctors List */}
      <Card>
        <CardHeader>
          <CardTitle>Care Team Doctors</CardTitle>
          <CardDescription>Regular physicians and specialists</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="p-3 sm:p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary-dark text-sm sm:text-base">
                      {doctor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text text-sm sm:text-base truncate">{doctor.name}</h4>
                    <p className="text-xs sm:text-sm text-text-light">{doctor.specialty}</p>
                    {doctor.phone && (
                      <p className="text-[10px] sm:text-xs text-text-muted mt-1">{doctor.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Appointment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Appointment"
        description="Add a new appointment to the calendar"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Doctor Name"
            placeholder="e.g., Dr. Smith"
            value={formData.doctorName}
            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            required
          />
          <Select
            label="Specialty"
            options={[
              { value: 'primary', label: 'Primary Care' },
              { value: 'cardiology', label: 'Cardiology' },
              { value: 'endocrinology', label: 'Endocrinology' },
              { value: 'neurology', label: 'Neurology' },
              { value: 'orthopedics', label: 'Orthopedics' },
              { value: 'dermatology', label: 'Dermatology' },
              { value: 'other', label: 'Other' },
            ]}
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            value={formData.dateTime}
            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
            required
          />
          <Input
            label="Location"
            placeholder="e.g., 123 Medical Center Dr"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Input
            label="Purpose"
            placeholder="e.g., Annual checkup"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsAddModalOpen(false)}
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
