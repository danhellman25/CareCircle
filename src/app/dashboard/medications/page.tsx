'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { medications, getTodaysMedications, careRecipient } from '@/lib/demo-data';
import { Pill, Plus, Clock, Check, X, AlertCircle } from 'lucide-react';
import type { Medication } from '@/types';

type MedStatus = 'given' | 'missed' | 'skipped' | 'pending';

interface MedicationDose {
  id: string;
  medication: Medication;
  time: string;
  status: MedStatus;
}

export default function MedicationsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [doses, setDoses] = useState<MedicationDose[]>(() => {
    // Generate today's doses from medications
    const allDoses: MedicationDose[] = [];
    medications.forEach((med) => {
      if (med.frequency === 'as_needed') return;
      med.times_of_day.forEach((time, index) => {
        allDoses.push({
          id: `${med.id}-${time}`,
          medication: med,
          time,
          status: Math.random() > 0.5 ? 'given' : 'pending',
        });
      });
    });
    return allDoses.sort((a, b) => a.time.localeCompare(b.time));
  });

  const updateDoseStatus = (doseId: string, status: MedStatus) => {
    setDoses((prev) =>
      prev.map((dose) => (dose.id === doseId ? { ...dose, status } : dose))
    );
  };

  const givenCount = doses.filter((d) => d.status === 'given').length;
  const totalCount = doses.length;
  const progressPercentage = totalCount > 0 ? (givenCount / totalCount) * 100 : 0;

  const getStatusIcon = (status: MedStatus) => {
    switch (status) {
      case 'given':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'missed':
        return <X className="w-4 h-4 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: MedStatus) => {
    switch (status) {
      case 'given':
        return <Badge variant="success">Given</Badge>;
      case 'missed':
        return <Badge variant="danger">Missed</Badge>;
      case 'skipped':
        return <Badge variant="warning">Skipped</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const frequencyLabels: Record<string, string> = {
    daily: 'Once daily',
    twice_daily: 'Twice daily',
    three_times_daily: 'Three times daily',
    weekly: 'Weekly',
    as_needed: 'As needed',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Medications</h1>
          <p className="text-text-light">Track {careRecipient.full_name}&apos;s medications</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Today's Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Tracker</CardTitle>
          <CardDescription>
            {givenCount} of {totalCount} doses completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Doses list */}
          <div className="space-y-3">
            {doses.map((dose) => {
              const [hours, minutes] = dose.time.split(':');
              const timeLabel = new Date(
                2000,
                0,
                1,
                parseInt(hours),
                parseInt(minutes)
              ).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <div
                  key={dose.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all ${
                    dose.status === 'given'
                      ? 'bg-green-50 border-green-200'
                      : dose.status === 'missed'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-background border-border'
                  }`}
                >
                  {/* Top row: Checkbox, Time, Medication info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={() =>
                        updateDoseStatus(
                          dose.id,
                          dose.status === 'given' ? 'pending' : 'given'
                        )
                      }
                      className={`w-8 h-8 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        dose.status === 'given'
                          ? 'bg-green-500 border-green-500'
                          : dose.status === 'missed'
                          ? 'bg-red-500 border-red-500'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {dose.status === 'given' && <Check className="w-5 h-5 sm:w-4 sm:h-4 text-white" />}
                      {dose.status === 'missed' && <X className="w-5 h-5 sm:w-4 sm:h-4 text-white" />}
                    </button>

                    {/* Time */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <Clock className="w-4 h-4 text-text-light" />
                      <span className="font-medium text-text">{timeLabel}</span>
                    </div>

                    {/* Medication info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text truncate">{dose.medication.name}</p>
                      <p className="text-sm text-text-light hidden sm:block">
                        {dose.medication.dosage} • {dose.medication.instructions}
                      </p>
                    </div>

                    {/* Status badge - desktop only */}
                    <div className="hidden sm:block">{getStatusBadge(dose.status)}</div>
                  </div>

                  {/* Mobile: dosage info */}
                  <p className="text-sm text-text-light sm:hidden pl-11">
                    {dose.medication.dosage} • {dose.medication.instructions}
                  </p>

                  {/* Quick actions */}
                  <div className="flex gap-1 pl-11 sm:pl-0">
                    <button
                      onClick={() => updateDoseStatus(dose.id, 'given')}
                      className={`p-3 sm:p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                        dose.status === 'given'
                          ? 'bg-green-100 text-green-700'
                          : 'hover:bg-gray-100 text-text-light'
                      }`}
                      title="Mark as given"
                    >
                      <Check className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => updateDoseStatus(dose.id, 'missed')}
                      className={`p-3 sm:p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                        dose.status === 'missed'
                          ? 'bg-red-100 text-red-700'
                          : 'hover:bg-gray-100 text-text-light'
                      }`}
                      title="Mark as missed"
                    >
                      <X className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => updateDoseStatus(dose.id, 'skipped')}
                      className={`p-3 sm:p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                        dose.status === 'skipped'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'hover:bg-gray-100 text-text-light'
                      }`}
                      title="Mark as skipped"
                    >
                      <AlertCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {doses.length === 0 && (
            <div className="text-center py-12 text-text-light">
              <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No medications scheduled for today</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                Add Medication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Medications */}
      <Card>
        <CardHeader>
          <CardTitle>All Medications</CardTitle>
          <CardDescription>Complete list of prescribed medications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className="p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-text">{med.name}</h3>
                        <Badge variant="primary">{med.dosage}</Badge>
                        {med.is_active ? (
                          <Badge variant="success" size="sm">Active</Badge>
                        ) : (
                          <Badge variant="outline" size="sm">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-light mt-1">
                        {frequencyLabels[med.frequency]}
                        {med.times_of_day.length > 0 && (
                          <span> at {med.times_of_day.join(', ')}</span>
                        )}
                      </p>
                      {med.instructions && (
                        <p className="text-sm text-text-muted mt-2">{med.instructions}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Medication"
        description="Add a new medication to the care plan"
      >
        <form className="space-y-4">
          <Input label="Medication Name" placeholder="e.g., Metformin" required />
          <Input label="Dosage" placeholder="e.g., 500mg" required />
          <Select
            label="Frequency"
            options={[
              { value: 'daily', label: 'Once daily' },
              { value: 'twice_daily', label: 'Twice daily' },
              { value: 'three_times_daily', label: 'Three times daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'as_needed', label: 'As needed' },
            ]}
            required
          />
          <Input label="Times of Day" placeholder="e.g., 08:00, 20:00" helperText="Separate times with commas" />
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Instructions</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Take with food, etc."
            />
          </div>
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
              Add Medication
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
