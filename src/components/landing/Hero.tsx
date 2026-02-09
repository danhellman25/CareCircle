import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Heart, Shield, Clock, Users, ArrowRight, Star } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-24 pb-12 sm:pt-20 sm:pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-3/4 h-1/2 bg-primary-light/50 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-3/4 h-1/2 bg-secondary-light/50 rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary-light text-primary-dark text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-primary" />
            Trusted by 10,000+ families
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-text leading-tight mb-4 sm:mb-6">
            Your family&apos;s care,{' '}
            <span className="text-primary">organized.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl text-text-light mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            The simple, affordable way for families to coordinate care for aging parents. 
            Medication tracking, schedules, and care logs—all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group min-h-[48px]">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[48px]">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-text-muted">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>

        {/* Hero image / mockup */}
        <div className="mt-10 sm:mt-16 lg:mt-20 px-2 sm:px-0">
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-card rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-border">
              <div className="bg-primary px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
                <div className="ml-3 sm:ml-4 text-white/80 text-xs sm:text-sm truncate">Mom&apos;s Care Team - Dashboard</div>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Mock dashboard cards */}
                <div className="bg-secondary-light rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-dark" />
                    <span className="font-medium text-text text-sm sm:text-base">Who&apos;s on duty</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary" />
                    <div>
                      <p className="font-medium text-text text-sm sm:text-base">Maria G.</p>
                      <p className="text-xs sm:text-sm text-text-light">Until 4:00 PM</p>
                    </div>
                  </div>
                </div>
                <div className="bg-primary-light rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <span className="font-medium text-text text-sm sm:text-base">Today&apos;s Medications</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded bg-green-400" />
                      <span className="text-xs sm:text-sm text-text">2 of 4 given</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="bg-accent-light rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    <span className="font-medium text-text text-sm sm:text-base">Next Appointment</span>
                  </div>
                  <p className="font-medium text-text text-sm sm:text-base">Dr. Chen</p>
                  <p className="text-xs sm:text-sm text-text-light">Tomorrow at 9:00 AM</p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-soft p-3 hidden lg:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-text">Medication given</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
