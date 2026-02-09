import { Pill, Calendar, ClipboardList, Users, Bell, Shield } from 'lucide-react';

const features = [
  {
    name: 'Medication Tracking',
    description: 'Never miss a dose. Track daily medications with simple checklists and get reminders for upcoming doses.',
    icon: Pill,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Caregiver Schedule',
    description: 'Coordinate who&apos;s on duty with an easy-to-use calendar. Color-coded shifts make it clear at a glance.',
    icon: Calendar,
    color: 'bg-green-100 text-green-600',
  },
  {
    name: 'Care Log',
    description: 'Keep everyone in the loop with daily notes about meals, mood, activities, and health updates.',
    icon: ClipboardList,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Family Dashboard',
    description: 'See everything at a glance—who&apos;s on duty, medication status, recent updates, and upcoming appointments.',
    icon: Users,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    name: 'Appointment Reminders',
    description: 'Track doctor visits and get reminded 24 hours before appointments. Add post-visit notes for the family.',
    icon: Bell,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    name: 'Secure & Private',
    description: 'Bank-level encryption keeps your family&apos;s health information safe and secure. HIPAA compliant.',
    icon: Shield,
    color: 'bg-teal-100 text-teal-600',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
            Everything you need to coordinate care
          </h2>
          <p className="text-lg text-text-light">
            Simple tools that make a big difference. No complicated setup, no steep learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-soft transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">{feature.name}</h3>
              <p className="text-text-light leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
