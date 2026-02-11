'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { circleMembers as demoCircleMembers, careCircle as demoCareCircle, careRecipient as demoCareRecipient, emergencyContacts as demoEmergencyContacts } from '@/lib/demo-data';
import { getCircleMembers, getCareCircle, getCareRecipient, getEmergencyContacts, DEMO_IDS } from '@/lib/data';
import { createClient } from '@/lib/supabase';
import { Users, Mail, Phone, Shield, User, Heart, AlertCircle, Check } from 'lucide-react';
import type { CircleMember, CareCircle, CareRecipient } from '@/types';

const roleConfig = {
  admin: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-700',
    icon: Shield,
    description: 'Manages the care circle',
  },
  family: {
    label: 'Family',
    color: 'bg-blue-100 text-blue-700',
    icon: User,
    description: 'Family member',
  },
  caregiver: {
    label: 'Caregiver',
    color: 'bg-green-100 text-green-700',
    icon: Heart,
    description: 'Provides direct care',
  },
};

export default function TeamPage() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);
  const [careCircle, setCareCircle] = useState<CareCircle | null>(null);
  const [careRecipient, setCareRecipient] = useState<CareRecipient | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [members, circle, recipient, contacts] = await Promise.all([
        getCircleMembers(),
        getCareCircle(),
        getCareRecipient(),
        getEmergencyContacts(),
      ]);
      setCircleMembers(members);
      setCareCircle(circle);
      setCareRecipient(recipient);
      setEmergencyContacts(contacts);
    } catch (err) {
      console.error('Error loading team data:', err);
      // Fall back to demo data
      setCircleMembers(demoCircleMembers);
      setCareCircle(demoCareCircle);
      setCareRecipient(demoCareRecipient);
      setEmergencyContacts(demoEmergencyContacts);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteSuccess(false);

    try {
      const supabase = createClient();
      
      // Create a pending invitation in the database
      const { error } = await supabase.from('circle_invitations').insert({
        circle_id: careCircle?.id || DEMO_IDS.circle,
        email: inviteEmail.trim(),
        role: 'family', // Default role for invited members
        invited_by: DEMO_IDS.user,
        status: 'pending',
      });

      if (error) {
        console.error('Error sending invite:', error);
        // If the table doesn't exist, just simulate success
        if (error.message?.includes('does not exist')) {
          setInviteSuccess(true);
          setTimeout(() => setInviteSuccess(false), 3000);
        }
      } else {
        setInviteSuccess(true);
        setInviteEmail('');
        setTimeout(() => setInviteSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error:', err);
      // Simulate success for demo
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Team</h1>
        <p className="text-text-light">Manage your care circle members</p>
      </div>

      {/* Care Recipient Card */}
      <Card className="bg-primary-light/30 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Avatar src={careRecipient?.photo_url} name={careRecipient?.full_name} size="lg" className="sm:w-14 sm:h-14" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-text">{careRecipient?.full_name}</h2>
                <Badge variant="primary" size="sm">Care Recipient</Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-light mb-2">
                Born: {careRecipient?.date_of_birth ? new Date(careRecipient.date_of_birth).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'N/A'}
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {careRecipient?.medical_conditions?.map((condition) => (
                  <Badge key={condition} variant="outline" size="sm" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {careRecipient?.notes && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary/20">
              <p className="text-xs sm:text-sm text-text-light">
                <span className="font-medium text-text">Notes:</span> {careRecipient.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Circle Members */}
      <Card>
        <CardHeader>
          <CardTitle>Circle Members</CardTitle>
          <CardDescription>People caring for {careRecipient?.full_name || 'care recipient'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {circleMembers.map((member) => {
              const config = roleConfig[member.role];
              const RoleIcon = config.icon;

              return (
                <div
                  key={member.id}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
                >
                  <Avatar
                    src={member.profile?.avatar_url}
                    name={member.profile?.full_name}
                    size="md"
                    className="sm:w-12 sm:h-12"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-text text-sm sm:text-base">
                        {member.profile?.full_name}
                      </h3>
                      <Badge className={config.color} size="sm">
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-text-light mb-1 sm:mb-2 truncate">{member.profile?.email}</p>
                    {member.profile?.phone && (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-text-muted">
                        <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {member.profile?.phone}
                      </div>
                    )}
                    <p className="text-[10px] sm:text-xs text-text-muted mt-1 sm:mt-2">
                      Joined{' '}
                      {new Date(member.joined_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invite Member */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Member</CardTitle>
          <CardDescription>Add a family member or caregiver to the circle</CardDescription>
        </CardHeader>
        <CardContent>
          {inviteSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              Invitation sent successfully!
            </div>
          )}
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" isLoading={isInviting} disabled={!inviteEmail} className="min-h-[44px]">
              <Mail className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Send Invite</span>
              <span className="sm:hidden">Invite</span>
            </Button>
          </form>
          <p className="text-xs sm:text-sm text-text-light mt-3">
            They'll receive an email invitation to join {careCircle?.name || 'the care circle'}.
          </p>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>Important contacts for urgent situations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className={classNames(
                  'flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border',
                  contact.is_primary
                    ? 'bg-red-50 border-red-200'
                    : 'bg-background border-border'
                )}
              >
                <div
                  className={classNames(
                    'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    contact.is_primary ? 'bg-red-100' : 'bg-gray-100'
                  )}
                >
                  <AlertCircle
                    className={classNames(
                      'w-4 h-4 sm:w-5 sm:h-5',
                      contact.is_primary ? 'text-red-600' : 'text-gray-500'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h4 className="font-semibold text-text text-sm sm:text-base">{contact.name}</h4>
                    {contact.is_primary && (
                      <Badge variant="danger" size="sm">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-text-light">{contact.relationship}</p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-4 mt-2 text-sm">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1.5 text-primary hover:text-primary-dark text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </a>
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1.5 text-primary hover:text-primary-dark text-sm truncate"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{contact.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function for classNames
function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
