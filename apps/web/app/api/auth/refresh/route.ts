import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { REFRESH_TOKEN_COOKIE, setAuthCookies } from '@/lib/auth';
import { refreshWithBackend } from '@/lib/backend-client';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { ok: false, error: 'Refresh token is missing.' },
        { status: 401 },
      );
    }

    const tokens = await refreshWithBackend(refreshToken);
    setAuthCookies(cookieStore, tokens);

    return NextResponse.json({
      ok: true,
      user: tokens.user,
    });
  } catch (error) {
    console.error('Refresh API error', error);
    const message = error instanceof Error ? error.message : 'Unable to refresh session.';
    return NextResponse.json({ ok: false, error: message }, { status: 401 });
  }
}
