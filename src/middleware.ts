import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TODO: Implement proper Supabase SSR auth check with @supabase/ssr middleware
  // For now, allow all access to dashboard during testing phase
  // Auth is handled client-side via Supabase JS client
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
