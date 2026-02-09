'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { circleMembers, careCircle, careRecipient, emergencyContacts } from '@/lib/demo-data';
import { Users, Mail, Phone, Shield, User, Heart, AlertCircle } from 'lucide-react';

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

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    // TODO: Send invite
    setTimeout(() => {
      setIsInviting(false);
      setInviteEmail('');
    }, 1000);
  };

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
            <Avatar src={careRecipient.photo_url} name={careRecipient.full_name} size="lg" className="sm:w-14 sm:h-14" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-text">{careRecipient.full_name}</h2>
                <Badge variant="primary" size="sm">Care Recipient</Badge>
              </div>
              <p className="text-xs sm:text-sm text-text-light mb-2">
                Born: {new Date(careRecipient.date_of_birth || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {careRecipient.medical_conditions.map((condition) => (
                  <Badge key={condition} variant="outline" size="sm" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {careRecipient.notes && (
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
          <CardDescription>People caring for {careRecipient.full_name}</CardDescription>
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
            They&apos;ll receive an email invitation to join {careCircle.name}.
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
