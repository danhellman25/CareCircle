'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Heart, Mail, Lock, Chrome } from 'lucide-react';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://chhwfraakmconptlvrym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaHdmcmFha21jb25wdGx2cnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2Mjk2MjMsImV4cCI6MjA4NjIwNTYyM30.toM-ngllAvi788N-mQVGVVAidC89KRzb09bZM3jzqRk';

let _supabase: ReturnType<typeof createSupabaseClient> | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _supabase;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = getSupabase();
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
          <h1 className="text-2xl font-bold text-text">Welcome back</h1>
          <p className="text-text-light mt-1">Sign in to continue coordinating care</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your care circle</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              
              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Link 
                  href="#" 
                  className="text-sm text-primary hover:text-primary-dark mt-1 inline-block"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In
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
              onClick={handleGoogleLogin}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center mt-6 text-text-light">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:text-primary-dark font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
