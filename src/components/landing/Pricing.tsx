import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import Link from 'next/link';

const features = [
  'Unlimited family members',
  'Unlimited caregivers',
  'Medication tracking',
  'Caregiver scheduling',
  'Care log & notes',
  'Appointment reminders',
  'Mobile & web access',
  'Email notifications',
  '24/7 support',
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
            Simple, affordable pricing
          </h2>
          <p className="text-lg text-text-light">
            One flat price for your entire family. No hidden fees, no surprises.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-soft border-2 border-primary overflow-hidden">
            {/* Header */}
            <div className="bg-primary p-8 text-center">
              <h3 className="text-white font-semibold text-lg mb-2">CareCircle Family</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-white">$50</span>
                <span className="text-white/80">/month</span>
              </div>
              <p className="text-white/80 mt-2 text-sm">For your entire care circle</p>
            </div>

            {/* Features */}
            <div className="p-8">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-light text-secondary-dark text-sm font-medium">
                  <Check className="w-4 h-4" />
                  14-day free trial
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary-light flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-secondary-dark" />
                    </div>
                    <span className="text-text">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button size="lg" className="w-full">
                  Start Free Trial
                </Button>
              </Link>

              <p className="text-center text-sm text-text-light mt-4">
                No credit card required to start
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
