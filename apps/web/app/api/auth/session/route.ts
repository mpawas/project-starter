import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-session';

export async function GET() {
  try {
    const session = await getSessionUser();
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Session API error', error);
    return NextResponse.json({ session: null }, { status: 200 });
  }
}
