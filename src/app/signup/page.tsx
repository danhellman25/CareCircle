'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Chrome, Heart, UserPlus } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const roleOptions = [
  { value: 'admin', label: 'Family Admin - I manage the care circle' },
  { value: 'family', label: 'Family Member - I help coordinate care' },
  { value: 'caregiver', label: 'Caregiver - I provide direct care' },
];

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'family',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: formData.fullName,
            email: formData.email,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Check if email confirmation is required
        if (data.session) {
          // Auto-confirmed, redirect to dashboard
          router.push('/dashboard');
        } else {
          // Email confirmation required
          setSuccess(true);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-xl">CC</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-text">Create your account</h1>
          <p className="text-text-light mt-1">Start coordinating care for your loved ones</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Join CareCircle and bring your family together</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Account created! Check your email to confirm, then sign in.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Create a password (min 8 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={8}
                required
              />

              <Select
                label="Your Role"
                options={roleOptions}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />

              <div className="text-sm text-text-light">
                By signing up, you agree to our{' '}
                <Link href="#" className="text-primary hover:text-primary-dark">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-primary hover:text-primary-dark">Privacy Policy</Link>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-text-light">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-text-light">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
