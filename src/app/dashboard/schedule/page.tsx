'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { shifts as demoShifts, circleMembers, careCircle, getCurrentShift } from '@/lib/demo-data';
import { createClient, isSupabaseConfigured } from '@/lib/supabase';
import { classNames } from '@/lib/utils';
import { Calendar, Plus, Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';
import type { Shift } from '@/types';

// Get caregiver color based on name
const getCaregiverColor = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-teal-100 text-teal-700 border-teal-200',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getCaregiverSolidColor = (name: string) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function SchedulePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>(demoShifts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useSupabase, setUseSupabase] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    caregiver_id: '',
    date: '',
    start_time: '',
    end_time: '',
    is_recurring: 'no',
    notes: '',
  });

  const currentShift = getCurrentShift();

  // Fetch shifts from Supabase on mount
  useEffect(() => {
    if (isSupabaseConfigured()) {
      setUseSupabase(true);
      fetchShifts();
    }
  }, []);

  const fetchShifts = async () => {
    if (!isSupabaseConfigured()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          caregiver:profiles(*)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching shifts:', error);
        setError('Failed to load shifts from database. Using demo data.');
        setShifts(demoShifts);
      } else if (data && data.length > 0) {
        // Transform data to match Shift type
        const transformedShifts: Shift[] = data.map((shift: any) => ({
          ...shift,
          caregiver: shift.caregiver || undefined,
        }));
        setShifts(transformedShifts);
      } else {
        // No data in database yet, use demo data
        setShifts(demoShifts);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Connection error. Using demo data.');
      setShifts(demoShifts);
    } finally {
      setIsLoading(false);
    }
  };

  // Get week dates
  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentDate);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getShiftsForDate = (date: Date): Shift[] => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter((s) => s.date === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const caregiverOptions = circleMembers
    .filter((m) => m.role === 'caregiver' || m.role === 'family' || m.role === 'admin')
    .map((m) => ({
      value: m.user_id,
      label: m.profile?.full_name || 'Unknown',
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.caregiver_id || !formData.date || !formData.start_time || !formData.end_time) {
      return;
    }

    const caregiver = circleMembers.find(m => m.user_id === formData.caregiver_id)?.profile;
    
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      circle_id: careCircle.id,
      caregiver_id: formData.caregiver_id,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      is_recurring: formData.is_recurring !== 'no',
      recurrence_pattern: formData.is_recurring !== 'no' ? { daysOfWeek: [] } : undefined,
      notes: formData.notes,
      created_by: circleMembers[0].user_id,
      created_at: new Date().toISOString(),
      caregiver: caregiver,
    };

    // Save to Supabase if configured
    if (useSupabase && isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('shifts').insert({
          circle_id: newShift.circle_id,
          caregiver_id: newShift.caregiver_id,
          date: newShift.date,
          start_time: newShift.start_time,
          end_time: newShift.end_time,
          is_recurring: newShift.is_recurring,
          recurrence_pattern: newShift.recurrence_pattern,
          notes: newShift.notes,
          created_by: newShift.created_by,
        });

        if (error) {
          console.error('Error saving shift:', error);
          setError('Failed to save shift to database.');
        } else {
          // Refresh shifts after successful save
          fetchShifts();
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Connection error. Shift saved locally only.');
      }
    }

    // Update local state
    setShifts(prev => [...prev, newShift]);
    
    // Reset form and close modal
    setFormData({
      caregiver_id: '',
      date: '',
      start_time: '',
      end_time: '',
      is_recurring: 'no',
      notes: '',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Schedule</h1>
          <p className="text-text-light">Coordinate caregiver shifts for {careCircle.name}</p>
          {useSupabase && (
            <Badge variant="primary" size="sm" className="mt-1">
              {isLoading ? 'Syncing...' : 'Live'}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-text min-w-[140px] text-center">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
            {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button className="ml-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Shift
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          {error}
        </div>
      )}

      {/* Who's on duty now */}
      {currentShift && (
        <Card className="bg-secondary-light border-secondary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-secondary-dark font-medium">Currently on duty</p>
                <p className="text-lg font-semibold text-text">
                  {currentShift.caregiver?.full_name}
                </p>
                <p className="text-sm text-text-light">
                  {currentShift.start_time} - {currentShift.end_time}
                </p>
              </div>
              <Badge variant="success" size="md">
                On Duty Now
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>View and manage caregiver shifts</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile: Horizontal scroll calendar */}
          <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-max">
              {weekDates.map((date, index) => {
                const dayShifts = getShiftsForDate(date);
                const today = isToday(date);

                return (
                  <div
                    key={index}
                    className={classNames(
                      'w-[140px] min-h-[280px] rounded-xl border p-3 flex-shrink-0',
                      today ? 'bg-primary-light/30 border-primary' : 'bg-background border-border'
                    )}
                  >
                    {/* Day header */}
                    <div className="text-center mb-3">
                      <p className={classNames('text-sm font-medium', today ? 'text-primary' : 'text-text-light')}>
                        {dayNames[index]}
                      </p>
                      <p
                        className={classNames(
                          'text-xl font-bold',
                          today ? 'text-primary' : 'text-text'
                        )}
                      >
                        {date.getDate()}
                      </p>
                    </div>

                    {/* Shifts */}
                    <div className="space-y-2">
                      {dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className={classNames(
                            'p-2.5 rounded-lg text-xs border cursor-pointer hover:shadow-md transition-all',
                            getCaregiverColor(shift.caregiver?.full_name || '')
                          )}
                        >
                          <div className="font-medium">
                            {shift.start_time} - {shift.end_time}
                          </div>
                          <div className="truncate">{shift.caregiver?.full_name?.split(' ')[0]}</div>
                        </div>
                      ))}
                      {dayShifts.length === 0 && (
                        <div className="text-center py-8 text-text-muted text-xs">No shifts</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop: Grid calendar */}
          <div className="hidden lg:grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const dayShifts = getShiftsForDate(date);
              const today = isToday(date);

              return (
                <div
                  key={index}
                  className={classNames(
                    'min-h-[200px] rounded-xl border p-2',
                    today ? 'bg-primary-light/30 border-primary' : 'bg-background border-border'
                  )}
                >
                  {/* Day header */}
                  <div className="text-center mb-2">
                    <p className={classNames('text-xs font-medium', today ? 'text-primary' : 'text-text-light')}>
                      {dayNames[index]}
                    </p>
                    <p
                      className={classNames(
                        'text-lg font-bold',
                        today ? 'text-primary' : 'text-text'
                      )}
                    >
                      {date.getDate()}
                    </p>
                  </div>

                  {/* Shifts */}
                  <div className="space-y-2">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className={classNames(
                          'p-2 rounded-lg text-xs border cursor-pointer hover:shadow-md transition-all',
                          getCaregiverColor(shift.caregiver?.full_name || '')
                        )}
                      >
                        <div className="font-medium">
                          {shift.start_time} - {shift.end_time}
                        </div>
                        <div className="truncate">{shift.caregiver?.full_name?.split(' ')[0]}</div>
                      </div>
                    ))}
                    {dayShifts.length === 0 && (
                      <div className="text-center py-4 text-text-muted text-xs">No shifts</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Shifts List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Shifts</CardTitle>
          <CardDescription>Next 7 days of scheduled care</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weekDates.flatMap((date) => {
              const dayShifts = getShiftsForDate(date);
              return dayShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border"
                >
                  <div
                    className={classNames(
                      'w-1 h-12 rounded-full',
                      getCaregiverSolidColor(shift.caregiver?.full_name || '')
                    )}
                  />
                  <Avatar
                    src={shift.caregiver?.avatar_url}
                    name={shift.caregiver?.full_name}
                    size="md"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-text">{shift.caregiver?.full_name}</p>
                    <p className="text-sm text-text-light">
                      {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-text">
                      {shift.start_time} - {shift.end_time}
                    </p>
                    {isToday(date) && currentShift?.id === shift.id && (
                      <Badge variant="success" size="sm">
                        On Duty
                      </Badge>
                    )}
                  </div>
                </div>
              ));
            })}
            {weekDates.every((date) => getShiftsForDate(date).length === 0) && (
              <div className="text-center py-12 text-text-light">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No shifts scheduled this week</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                  Add Shift
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Shift Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Shift"
        description="Schedule a caregiver shift"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Caregiver"
            options={caregiverOptions}
            value={formData.caregiver_id}
            onChange={(e) => setFormData({ ...formData, caregiver_id: e.target.value })}
            required
          />
          <Input 
            label="Date" 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Start Time" 
              type="time" 
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required 
            />
            <Input 
              label="End Time" 
              type="time" 
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required 
            />
          </div>
          <Select
            label="Recurring"
            value={formData.is_recurring}
            onChange={(e) => setFormData({ ...formData, is_recurring: e.target.value })}
            options={[
              { value: 'no', label: 'No, just this once' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
              { value: 'weekly', label: 'Weekly on same day' },
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Notes (optional)</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Any special instructions for this shift"
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
              Add Shift
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
