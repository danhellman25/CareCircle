'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { currentUser, careRecipient, careCircle } from '@/lib/demo-data';
import { Settings, User, CreditCard, Bell, Heart, Save } from 'lucide-react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: currentUser.full_name,
    email: currentUser.email,
    phone: currentUser.phone || '',
  });

  const [notifications, setNotifications] = useState({
    medicationReminders: true,
    appointmentReminders: true,
    shiftChanges: true,
    careLogUpdates: false,
    weeklySummary: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // TODO: Save profile
    setTimeout(() => setIsSaving(false), 900);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-text-light">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Care Recipient Summary */}
      <Card className="bg-secondary-light/30 border-secondary/20">
        <CardHeader>
          <CardTitle>Care Recipient</CardTitle>
          <CardDescription>Summary of the person being cared for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-muted">Name</p>
              <p className="font-semibold text-text">{careRecipient.full_name}</p>
            </div>
            {careRecipient.date_of_birth && (
              <div>
                <p className="text-sm text-text-muted">Date of Birth</p>
                <p className="font-medium text-text">
                  {new Date(careRecipient.date_of_birth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-text-muted mb-2">Medical Conditions</p>
              <div className="flex flex-wrap gap-2">
                {careRecipient.medical_conditions.map((condition) => (
                  <Badge key={condition} variant="secondary">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {careRecipient.allergies.map((allergy) => (
                  <Badge key={allergy} variant="warning">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
            {careRecipient.insurance_provider && (
              <div className="pt-2 border-t border-secondary/20">
                <p className="text-sm text-text-muted">Insurance</p>
                <p className="font-medium text-text">
                  {careRecipient.insurance_provider}{' '}
                  {careRecipient.insurance_policy_number && (
                    <span className="text-text-light">• {careRecipient.insurance_policy_number}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Manage your subscription and payment settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-medium text-text">Subscription Status</p>
              <p className="text-sm text-text-light">
                Current plan: CareCircle Family
              </p>
              <div className="mt-2">
                <Badge variant={careCircle.subscription_status === 'trialing' ? 'warning' : 'success'}>
                  {careCircle.subscription_status}
                </Badge>
                {careCircle.trial_ends_at && careCircle.subscription_status === 'trialing' && (
                  <span className="text-xs text-text-muted ml-2">
                    Trial ends {new Date(careCircle.trial_ends_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                key: 'medicationReminders' as const,
                title: 'Medication reminders',
                description: 'Get notified when a dose is due or missed',
              },
              {
                key: 'appointmentReminders' as const,
                title: 'Appointment reminders',
                description: 'Reminders 24 hours before appointments',
              },
              {
                key: 'shiftChanges' as const,
                title: 'Schedule updates',
                description: 'Alerts when shifts are added or changed',
              },
              {
                key: 'careLogUpdates' as const,
                title: 'Care log entries',
                description: 'Be notified when someone adds a care log update',
              },
              {
                key: 'weeklySummary' as const,
                title: 'Weekly summary',
                description: 'Weekly email with highlights and upcoming items',
              },
            ].map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-background border border-border">
                <div>
                  <p className="font-medium text-text">{item.title}</p>
                  <p className="text-sm text-text-light">{item.description}</p>
                </div>
                <Toggle
                  enabled={notifications[item.key]}
                  onChange={(enabled) =>
                    setNotifications((prev) => ({ ...prev, [item.key]: enabled }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
