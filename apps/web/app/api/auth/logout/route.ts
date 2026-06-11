import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    clearAuthCookies(cookieStore);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Logout API error', error);
    return NextResponse.json({ ok: false, error: 'Unable to log out.' }, { status: 500 });
  }
}
