'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { careLogs as demoCareLogs, careRecipient, circleMembers } from '@/lib/demo-data';
import { getCareLogs, addCareLog, DEMO_IDS } from '@/lib/data';
import { formatRelativeTime, formatDateTime } from '@/lib/utils';
import { ClipboardList, Plus, Filter, Utensils, Smile, Activity, AlertCircle, Heart, FileText } from 'lucide-react';
import type { CareLog, CareLogCategory } from '@/types';

const categoryConfig: Record<
  CareLogCategory,
  { label: string; icon: typeof Utensils; color: string; bg: string }
> = {
  meal: {
    label: 'Meal',
    icon: Utensils,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  mood: {
    label: 'Mood',
    icon: Smile,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  activity: {
    label: 'Activity',
    icon: Activity,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  incident: {
    label: 'Incident',
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-100',
  },
  vitals: {
    label: 'Vitals',
    icon: Heart,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  note: {
    label: 'Note',
    icon: FileText,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
};

const filterOptions = [
  { value: 'all', label: 'All Entries' },
  { value: 'meal', label: 'Meals' },
  { value: 'mood', label: 'Mood' },
  { value: 'activity', label: 'Activities' },
  { value: 'incident', label: 'Incidents' },
  { value: 'vitals', label: 'Vitals' },
  { value: 'note', label: 'Notes' },
];

export default function CareLogPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: 'note' as CareLogCategory,
    content: '',
  });

  // Load care logs on mount
  useEffect(() => {
    loadCareLogs();
  }, []);

  async function loadCareLogs() {
    setIsLoading(true);
    try {
      const logs = await getCareLogs();
      setCareLogs(logs);
    } catch (err) {
      console.error('Error loading care logs:', err);
      setCareLogs(demoCareLogs);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredLogs =
    selectedFilter === 'all'
      ? careLogs
      : careLogs.filter((log) => log.category === selectedFilter);

  // Sort by date (newest first)
  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addCareLog({
        circle_id: DEMO_IDS.circle,
        recipient_id: DEMO_IDS.recipient,
        author_id: DEMO_IDS.user,
        category: formData.category,
        content: formData.content,
        logged_at: new Date().toISOString(),
      });

      if (result) {
        setIsAddModalOpen(false);
        setFormData({ category: 'note', content: '' });
        await loadCareLogs(); // Refresh the list
      }
    } catch (err) {
      console.error('Error saving care log:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text">Care Log</h1>
          <p className="text-sm sm:text-base text-text-light">Daily updates and observations for {careRecipient.full_name}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="sm:text-base sm:px-4 sm:py-2.5" isLoading={isLoading}>
          <Plus className="w-4 h-4 mr-1.5 sm:mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="-mx-4 px-4 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-[36px] ${
                selectedFilter === option.value
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white text-text-light hover:bg-gray-50 border border-border'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Care Log Feed */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {!isLoading && sortedLogs.map((log) => {
          const config = categoryConfig[log.category];
          const Icon = config.icon;

          return (
            <Card key={log.id} className="hover:shadow-soft transition-shadow">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Author Avatar */}
                  <Avatar
                    src={log.author?.avatar_url}
                    name={log.author?.full_name}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-text">{log.author?.full_name}</span>
                      <span className="text-text-muted">•</span>
                      <span className="text-sm text-text-light">
                        {formatRelativeTime(log.logged_at)}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-text leading-relaxed">{log.content}</p>

                    {/* Timestamp */}
                    <p className="text-xs text-text-muted mt-3">
                      {formatDateTime(log.logged_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!isLoading && sortedLogs.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-30" />
            <p className="text-text-light">No entries found</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
              Add your first entry
            </Button>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Care Log Entry"
        description="Record observations, activities, or updates"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as CareLogCategory })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="What would you like to record?"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
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
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
