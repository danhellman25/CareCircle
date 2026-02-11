'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  AlertCircle, 
  CheckCircle, 
  History,
  Users,
  Calendar,
  Play,
  Square,
  Edit3,
  Trash2,
  Plus,
  Loader2,
  X,
  MapPinned
} from 'lucide-react';
import { 
  formatDate, 
  formatTime, 
  formatDateTime,
  classNames 
} from '@/lib/utils';
import { 
  getWorkLocations,
  getActiveTimeEntry,
  getTimeEntries,
  getAllTimeEntries,
  clockIn,
  clockOut,
  createOverrideEntry,
  updateTimeEntry,
  deleteTimeEntry,
  saveWorkLocation,
  deleteWorkLocation,
  getCurrentPosition,
  isWithinGeofence,
  formatDuration,
  formatDecimalHours,
  getElapsedMinutes,
  getPayPeriodRange,
  calculatePayPeriodSummary,
  calculateDistance,
} from '@/lib/time-tracking';
import { createClient } from '@/lib/supabase';
import type { 
  TimeEntry, 
  WorkLocation, 
  PayPeriodSummary, 
  GPSStatus,
  Profile 
} from '@/types';

// ============================================
// TYPES
// ============================================

interface TimeTrackingPageProps {
  userId: string;
  circleId: string;
  isAdmin: boolean;
  userProfile: Profile;
  teamMembers: Profile[];
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TimeTrackingPage() {
  // State
  const [userId, setUserId] = useState<string>('');
  const [circleId, setCircleId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createClient();
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user');
          return;
        }
        setUserId(user.id);

        // Get user's profile and circle membership
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }

        // Get user's circle membership (assuming single circle for now)
        const { data: membership } = await supabase
          .from('circle_members')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (membership) {
          setCircleId(membership.circle_id);
          setIsAdmin(membership.role === 'admin');

          // Get team members
          const { data: members } = await supabase
            .from('circle_members')
            .select('user_id, profile:profiles(*)')
            .eq('circle_id', membership.circle_id);

          if (members) {
            const profiles = members
              .map(m => m.profile as unknown as Profile)
              .filter((p): p is Profile => p !== null && p !== undefined);
            setTeamMembers(profiles);
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId || !circleId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-text-light">Unable to load time tracking. Please try again.</p>
      </div>
    );
  }

  return (
    <TimeTrackingContent
      userId={userId}
      circleId={circleId}
      isAdmin={isAdmin}
      userProfile={userProfile!}
      teamMembers={teamMembers}
    />
  );
}

// ============================================
// TIME TRACKING CONTENT
// ============================================

function TimeTrackingContent({ userId, circleId, isAdmin, userProfile, teamMembers }: TimeTrackingPageProps) {
  // State
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [gpsStatus, setGpsStatus] = useState<GPSStatus>('loading');
  const [gpsPosition, setGpsPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceToLocation, setDistanceToLocation] = useState<number | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isClocking, setIsClocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pay period state
  const [periodOffset, setPeriodOffset] = useState(0);
  const [payPeriodSummary, setPayPeriodSummary] = useState<PayPeriodSummary | null>(null);

  // Admin state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminEntries, setAdminEntries] = useState<TimeEntry[]>([]);
  const [showLocationManager, setShowLocationManager] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [circleId, userId]);

  // GPS polling interval
  useEffect(() => {
    if (!selectedLocation) return;

    checkGPSLocation();
    const interval = setInterval(checkGPSLocation, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [selectedLocation]);

  // Elapsed time timer
  useEffect(() => {
    if (!activeEntry) {
      setElapsedMinutes(0);
      return;
    }

    const updateElapsed = () => {
      setElapsedMinutes(getElapsedMinutes(activeEntry.clock_in));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [activeEntry]);

  // Calculate pay period summary when entries change
  useEffect(() => {
    const { start, end } = getPayPeriodRange(periodOffset);
    const summary = calculatePayPeriodSummary(timeEntries, start, end);
    setPayPeriodSummary(summary);
  }, [timeEntries, periodOffset]);

  async function loadData() {
    try {
      // Load work locations
      const locs = await getWorkLocations(circleId);
      setLocations(locs);
      if (locs.length > 0 && !selectedLocation) {
        setSelectedLocation(locs[0]);
      }

      // Load active entry
      const active = await getActiveTimeEntry(userId);
      setActiveEntry(active);

      // Load recent entries
      await loadTimeEntries();

      // Load admin entries if admin
      if (isAdmin) {
        await loadAdminEntries();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load time tracking data');
    }
  }

  async function loadTimeEntries() {
    try {
      const { start, end } = getPayPeriodRange(periodOffset);
      const entries = await getTimeEntries(userId, start, end + 'T23:59:59');
      setTimeEntries(entries);
    } catch (err) {
      console.error('Error loading time entries:', err);
    }
  }

  async function loadAdminEntries() {
    try {
      const { start, end } = getPayPeriodRange(periodOffset);
      const entries = await getAllTimeEntries(circleId, start, end + 'T23:59:59');
      setAdminEntries(entries);
    } catch (err) {
      console.error('Error loading admin entries:', err);
    }
  }

  async function checkGPSLocation() {
    if (!selectedLocation) return;

    setGpsStatus('loading');
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      setGpsPosition({ lat: latitude, lng: longitude });

      const { isWithin, distance } = isWithinGeofence(
        latitude,
        longitude,
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.radius_meters
      );

      setDistanceToLocation(distance);
      setIsWithinRange(isWithin);
      setGpsStatus('success');
      setError(null);
    } catch (err: any) {
      console.error('GPS Error:', err);
      setGpsStatus(err.code === 1 ? 'denied' : 'error');
      setError(err.message || 'Unable to get location');
    }
  }

  async function handleClockIn() {
    if (!selectedLocation || !gpsPosition) return;
    if (!isWithinRange && !isAdmin) {
      setError('You must be at the work location to clock in');
      return;
    }

    setIsClocking(true);
    setError(null);

    try {
      const entry = await clockIn(userId, circleId, {
        location_id: selectedLocation.id,
        latitude: gpsPosition.lat,
        longitude: gpsPosition.lng,
        distance_meters: distanceToLocation || 0,
      });

      setActiveEntry(entry);
      setSuccessMessage('Clocked in successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadTimeEntries();
    } catch (err: any) {
      console.error('Error clocking in:', err);
      setError(err.message || 'Failed to clock in');
    } finally {
      setIsClocking(false);
    }
  }

  async function handleClockOut() {
    if (!activeEntry || !gpsPosition) return;

    setIsClocking(true);
    setError(null);

    try {
      const entry = await clockOut(activeEntry.id, {
        latitude: gpsPosition.lat,
        longitude: gpsPosition.lng,
        distance_meters: distanceToLocation || 0,
      });

      setActiveEntry(null);
      setSuccessMessage('Clocked out successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadTimeEntries();
      if (isAdmin) await loadAdminEntries();
    } catch (err: any) {
      console.error('Error clocking out:', err);
      setError(err.message || 'Failed to clock out');
    } finally {
      setIsClocking(false);
    }
  }

  // Get GPS status display
  const getGPSStatusDisplay = () => {
    switch (gpsStatus) {
      case 'loading':
        return { icon: Loader2, text: 'Getting location...', color: 'text-yellow-500', animate: true };
      case 'success':
        if (isWithinRange) {
          return { icon: CheckCircle, text: 'Location verified', color: 'text-green-500', animate: false };
        }
        return { icon: AlertCircle, text: `Outside geofence (${formatDistance(distanceToLocation || 0)})`, color: 'text-red-500', animate: false };
      case 'denied':
        return { icon: AlertCircle, text: 'Location access denied', color: 'text-red-500', animate: false };
      case 'error':
        return { icon: AlertCircle, text: 'Location error', color: 'text-red-500', animate: false };
      default:
        return { icon: MapPin, text: 'Waiting for location...', color: 'text-gray-400', animate: false };
    }
  };

  const gpsDisplay = getGPSStatusDisplay();
  const GpsIcon = gpsDisplay.icon;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Time Tracking</h1>
          <p className="text-text-light">Clock in/out and view your hours</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLocationManager(!showLocationManager)}
            >
              <MapPinned className="w-4 h-4 mr-2" />
              Locations
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdminPanel(!showAdminPanel)}
            >
              <Users className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Clock In/Out Card */}
      <Card className={classNames(
        'relative overflow-hidden',
        activeEntry ? 'border-green-300 bg-green-50/30' : ''
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Main Clock Section */}
            <div className="flex-1">
              {/* Location Selector */}
              {locations.length > 0 ? (
                <div className="mb-4">
                  <label className="text-sm font-medium text-text mb-2 block">
                    Work Location
                  </label>
                  <select
                    value={selectedLocation?.id || ''}
                    onChange={(e) => {
                      const loc = locations.find(l => l.id === e.target.value);
                      setSelectedLocation(loc || null);
                    }}
                    disabled={!!activeEntry}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-white text-text focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.radius_meters}m radius)
                      </option>
                    ))}
                  </select>
                  {selectedLocation && (
                    <p className="text-xs text-text-light mt-1">
                      {selectedLocation.address || `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    No work locations configured. Contact an admin to set up locations.
                  </p>
                </div>
              )}

              {/* GPS Status */}
              <div className="flex items-center gap-2 mb-4">
                <GpsIcon className={classNames(
                  'w-5 h-5',
                  gpsDisplay.color,
                  gpsDisplay.animate && 'animate-spin'
                )} />
                <span className={classNames('text-sm', gpsDisplay.color)}>
                  {gpsDisplay.text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkGPSLocation}
                  disabled={gpsStatus === 'loading'}
                  className="ml-2 h-8 px-2"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>

              {/* Active Shift Timer */}
              {activeEntry && (
                <div className="mb-4">
                  <p className="text-sm text-text-light mb-1">Current Shift</p>
                  <div className="text-4xl font-bold text-green-600 font-mono">
                    {formatDuration(elapsedMinutes)}
                  </div>
                  <p className="text-xs text-text-light mt-1">
                    Clocked in at {formatTime(activeEntry.clock_in)}
                  </p>
                </div>
              )}

              {/* Clock Button */}
              <div className="flex gap-3">
                {!activeEntry ? (
                  <Button
                    onClick={handleClockIn}
                    disabled={!selectedLocation || isClocking || (!isWithinRange && !isAdmin)}
                    className="flex-1 h-16 text-lg font-semibold bg-green-600 hover:bg-green-700"
                  >
                    {isClocking ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Play className="w-6 h-6 mr-2" />
                        Clock In
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleClockOut}
                    disabled={isClocking}
                    variant="danger"
                    className="flex-1 h-16 text-lg font-semibold bg-red-600 hover:bg-red-700"
                  >
                    {isClocking ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Square className="w-6 h-6 mr-2" />
                        Clock Out
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Outside geofence warning */}
              {!activeEntry && !isWithinRange && gpsStatus === 'success' && !isAdmin && (
                <p className="mt-3 text-sm text-red-600 text-center">
                  You must be at the work location to clock in
                </p>
              )}
            </div>

            {/* Pay Period Summary */}
            {payPeriodSummary && (
              <div className="lg:w-64 bg-white rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text">Pay Period</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPeriodOffset(p => p + 1)}
                      className="h-8 w-8 p-0"
                    >
                      ←
                    </Button>
                    <span className="text-xs text-text-light px-2">
                      {periodOffset === 0 ? 'Current' : `${periodOffset} ago`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPeriodOffset(p => Math.max(0, p - 1))}
                      disabled={periodOffset === 0}
                      className="h-8 w-8 p-0"
                    >
                      →
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {formatDecimalHours(payPeriodSummary.total_hours * 60)}h
                    </p>
                    <p className="text-xs text-text-light">Total Hours</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-lg font-semibold text-text">
                        {payPeriodSummary.days_worked}
                      </p>
                      <p className="text-xs text-text-light">Days Worked</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-text">
                        {payPeriodSummary.entries_count}
                      </p>
                      <p className="text-xs text-text-light">Shifts</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-light pt-2">
                    {formatDate(payPeriodSummary.period_start)} - {formatDate(payPeriodSummary.period_end)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Manager (Admin) */}
      {isAdmin && showLocationManager && (
        <LocationManager
          circleId={circleId}
          locations={locations}
          onLocationsChange={setLocations}
          onClose={() => setShowLocationManager(false)}
        />
      )}

      {/* Time Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Time Entries
          </CardTitle>
          <CardDescription>
            Your clock-in and clock-out history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <p className="text-text-light text-center py-8">No time entries yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Clock In</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Clock Out</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-text">
                        {formatDate(entry.clock_in)}
                      </td>
                      <td className="py-3 px-4 text-sm text-text">
                        {formatTime(entry.clock_in)}
                      </td>
                      <td className="py-3 px-4 text-sm text-text">
                        {entry.clock_out ? formatTime(entry.clock_out) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-text">
                        {entry.duration_minutes ? formatDuration(entry.duration_minutes) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-text">
                        {entry.location?.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {entry.is_override ? (
                          <Badge variant="warning" className="text-xs">Override</Badge>
                        ) : (
                          <Badge variant={entry.clock_out ? 'success' : 'default'} className="text-xs">
                            {entry.clock_out ? 'Complete' : 'Active'}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Panel */}
      {isAdmin && showAdminPanel && (
        <AdminPanel
          entries={adminEntries}
          teamMembers={teamMembers}
          locations={locations}
          circleId={circleId}
          userId={userId}
          onEntriesChange={setAdminEntries}
        />
      )}
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// ============================================
// LOCATION MANAGER COMPONENT
// ============================================

interface LocationManagerProps {
  circleId: string;
  locations: WorkLocation[];
  onLocationsChange: (locations: WorkLocation[]) => void;
  onClose: () => void;
}

function LocationManager({ circleId, locations, onLocationsChange, onClose }: LocationManagerProps) {
  const [isEditing, setIsEditing] = useState<WorkLocation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius_meters: '100',
  });

  const startEditing = (location: WorkLocation) => {
    setIsEditing(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius_meters: location.radius_meters.toString(),
    });
  };

  const startCreating = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      radius_meters: '100',
    });
  };

  const getCurrentLocation = async () => {
    try {
      const position = await getCurrentPosition();
      setFormData(prev => ({
        ...prev,
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString(),
      }));
    } catch (err: any) {
      setError('Unable to get current location: ' + err.message);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const locationData: Partial<WorkLocation> = {
        circle_id: circleId,
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius_meters: parseInt(formData.radius_meters),
        is_active: true,
      };

      if (isEditing) {
        locationData.id = isEditing.id;
      }

      const saved = await saveWorkLocation(locationData);

      if (isEditing) {
        onLocationsChange(locations.map(l => l.id === saved.id ? saved : l));
      } else {
        onLocationsChange([...locations, saved]);
      }

      setIsEditing(null);
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (location: WorkLocation) => {
    if (!confirm(`Delete location "${location.name}"?`)) return;

    try {
      await deleteWorkLocation(location.id);
      onLocationsChange(locations.filter(l => l.id !== location.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete location');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="w-5 h-5" />
            Work Locations
          </CardTitle>
          <CardDescription>
            Manage clock-in locations and geofences
          </CardDescription>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {(isEditing || isCreating) ? (
          <div className="space-y-4">
            <Input
              label="Location Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Main Office"
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Latitude *"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 40.7128"
                />
              </div>
              <div className="relative">
                <Input
                  label="Longitude *"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., -74.0060"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              className="w-full"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Use Current Location
            </Button>
            <Input
              label="Geofence Radius (meters) *"
              type="number"
              value={formData.radius_meters}
              onChange={(e) => setFormData({ ...formData, radius_meters: e.target.value })}
              placeholder="e.g., 100"
            />
            <div className="flex gap-3">
              <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
                Save Location
              </Button>
              <Button
                variant="outline"
                onClick={() => { setIsEditing(null); setIsCreating(false); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {locations.length === 0 ? (
                <p className="text-text-light text-center py-4">No locations configured</p>
              ) : (
                locations.map(location => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-text">{location.name}</p>
                      <p className="text-xs text-text-light">
                        {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`} • {location.radius_meters}m radius
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(location)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(location)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button onClick={startCreating} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// ADMIN PANEL COMPONENT
// ============================================

interface AdminPanelProps {
  entries: TimeEntry[];
  teamMembers: Profile[];
  locations: WorkLocation[];
  circleId: string;
  userId: string;
  onEntriesChange: (entries: TimeEntry[]) => void;
}

function AdminPanel({ entries, teamMembers, locations, circleId, userId, onEntriesChange }: AdminPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<TimeEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    user_id: '',
    location_id: '',
    clock_in_date: '',
    clock_in_time: '',
    clock_out_date: '',
    clock_out_time: '',
    notes: '',
  });

  const startCreating = () => {
    setIsCreating(true);
    setFormData({
      user_id: teamMembers[0]?.id || '',
      location_id: locations[0]?.id || '',
      clock_in_date: new Date().toISOString().split('T')[0],
      clock_in_time: '09:00',
      clock_out_date: new Date().toISOString().split('T')[0],
      clock_out_time: '17:00',
      notes: '',
    });
  };

  const startEditing = (entry: TimeEntry) => {
    setIsEditing(entry);
    const clockIn = new Date(entry.clock_in);
    const clockOut = entry.clock_out ? new Date(entry.clock_out) : null;

    setFormData({
      user_id: entry.user_id,
      location_id: entry.location_id || '',
      clock_in_date: clockIn.toISOString().split('T')[0],
      clock_in_time: clockIn.toTimeString().slice(0, 5),
      clock_out_date: clockOut ? clockOut.toISOString().split('T')[0] : '',
      clock_out_time: clockOut ? clockOut.toTimeString().slice(0, 5) : '',
      notes: entry.notes || '',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const clockIn = new Date(`${formData.clock_in_date}T${formData.clock_in_time}`);
      const clockOut = formData.clock_out_date && formData.clock_out_time
        ? new Date(`${formData.clock_out_date}T${formData.clock_out_time}`)
        : undefined;

      if (clockOut && clockOut <= clockIn) {
        throw new Error('Clock out must be after clock in');
      }

      if (isEditing) {
        const updated = await updateTimeEntry(
          isEditing.id,
          {
            clock_in: clockIn.toISOString(),
            clock_out: clockOut?.toISOString(),
            location_id: formData.location_id || undefined,
            notes: formData.notes,
          },
          userId
        );
        onEntriesChange(entries.map(e => e.id === updated.id ? updated : e));
      } else {
        const created = await createOverrideEntry(
          formData.user_id,
          circleId,
          {
            clock_in: clockIn.toISOString(),
            clock_out: clockOut!.toISOString(),
            location_id: formData.location_id || undefined,
            notes: formData.notes,
          },
          userId
        );
        onEntriesChange([created, ...entries]);
      }

      setIsCreating(false);
      setIsEditing(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (entry: TimeEntry) => {
    if (!confirm('Delete this time entry?')) return;

    try {
      await deleteTimeEntry(entry.id);
      onEntriesChange(entries.filter(e => e.id !== entry.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete entry');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Admin: All Employee Times
        </CardTitle>
        <CardDescription>
          View and manage time entries for all team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {(isCreating || isEditing) ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text mb-2 block">Employee *</label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                disabled={!!isEditing}
                className="w-full px-4 py-2 border border-border rounded-lg bg-white text-text"
              >
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-text mb-2 block">Location</label>
              <select
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-white text-text"
              >
                <option value="">No location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Clock In Date *"
                type="date"
                value={formData.clock_in_date}
                onChange={(e) => setFormData({ ...formData, clock_in_date: e.target.value })}
              />
              <Input
                label="Clock In Time *"
                type="time"
                value={formData.clock_in_time}
                onChange={(e) => setFormData({ ...formData, clock_in_time: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Clock Out Date"
                type="date"
                value={formData.clock_out_date}
                onChange={(e) => setFormData({ ...formData, clock_out_date: e.target.value })}
              />
              <Input
                label="Clock Out Time"
                type="time"
                value={formData.clock_out_time}
                onChange={(e) => setFormData({ ...formData, clock_out_time: e.target.value })}
              />
            </div>

            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Reason for override or any notes"
            />

            <div className="flex gap-3">
              <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
                {isEditing ? 'Update Entry' : 'Create Entry'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setIsCreating(false); setIsEditing(null); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={startCreating}>
                <Plus className="w-4 h-4 mr-2" />
                Add Manual Entry
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Clock In</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Clock Out</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-light">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-text-light">
                        No time entries
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-text">
                          {(entry.user as any)?.full_name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-sm text-text">
                          {formatDate(entry.clock_in)}
                        </td>
                        <td className="py-3 px-4 text-sm text-text">
                          {formatTime(entry.clock_in)}
                        </td>
                        <td className="py-3 px-4 text-sm text-text">
                          {entry.clock_out ? formatTime(entry.clock_out) : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-text">
                          {entry.duration_minutes ? formatDuration(entry.duration_minutes) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {entry.is_override ? (
                            <Badge variant="warning" className="text-xs">Override</Badge>
                          ) : (
                            <Badge variant={entry.clock_out ? 'success' : 'default'} className="text-xs">
                              {entry.clock_out ? 'Complete' : 'Active'}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(entry)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(entry)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
