import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Daughter & Care Coordinator',
    content: 'CareCircle has been a lifesaver for our family. We used to text back and forth constantly about Mom&apos;s medications. Now everything is in one place, and we all stay in sync.',
    rating: 5,
  },
  {
    name: 'Robert K.',
    role: 'Son & Primary Caregiver',
    content: 'I was juggling a full-time job and caring for my dad. The schedule feature alone is worth the price. My sister can see when I&apos;m on duty and when she needs to step in.',
    rating: 5,
  },
  {
    name: 'Maria G.',
    role: 'Professional Caregiver',
    content: 'I work with multiple families, and CareCircle makes it so easy to log daily activities and communicate with family members. The families love getting updates throughout the day.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
            Loved by families like yours
          </h2>
          <p className="text-lg text-text-light">
            Join thousands of families who have simplified their caregiving journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-background rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-text text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-primary-dark text-sm sm:text-base">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-text text-sm sm:text-base truncate">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-text-light">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
