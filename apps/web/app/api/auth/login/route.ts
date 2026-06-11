import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth';
import { loginWithBackend } from '@/lib/backend-client';

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email and password are required.' },
        { status: 400 },
      );
    }

    const tokens = await loginWithBackend(email, password);
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, tokens);

    return NextResponse.json({
      ok: true,
      user: tokens.user,
    });
  } catch (error) {
    console.error('Login API error', error);
    const message = error instanceof Error ? error.message : 'Unable to sign in.';
    return NextResponse.json({ ok: false, error: message }, { status: 401 });
  }
}
