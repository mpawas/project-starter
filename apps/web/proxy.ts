import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  buildSessionFromAccessToken,
  hasAdminRole,
  isTokenExpired,
} from '@/lib/auth';
import { attachRefreshedTokens, refreshTokensForProxy } from '@/lib/auth-session';

function redirectToLogin(request: NextRequest) {
  const url = new URL('/login', request.url);
  url.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  let response: NextResponse | null = null;

  if (!accessToken || isTokenExpired(accessToken)) {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) {
      return redirectToLogin(request);
    }

    const refreshedTokens = await refreshTokensForProxy(refreshToken);
    if (!refreshedTokens) {
      return redirectToLogin(request);
    }

    accessToken = refreshedTokens.accessToken;
    response = NextResponse.next();
    attachRefreshedTokens(response, refreshedTokens);
  }

  const session = buildSessionFromAccessToken(accessToken);
  if (!session || !hasAdminRole(session.roles)) {
    return redirectToLogin(request);
  }

  return response ?? NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
