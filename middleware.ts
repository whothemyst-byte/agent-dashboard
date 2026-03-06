import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Do not hard-fail the whole site if auth env vars are missing or middleware
  // cannot initialize in production. The protected pages can still render.
  if (!supabaseUrl || !supabaseAnonKey) {
    return res;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      !user &&
      (req.nextUrl.pathname.startsWith('/dashboard') ||
        req.nextUrl.pathname.startsWith('/agents'))
    ) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }
  } catch {
    return res;
  }

  return res;
}
export const config = { matcher: ['/dashboard/:path*', '/agents/:path*'] };
