import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  buildSessionFromAccessToken,
  isTokenExpired,
  setAuthCookies,
  type AuthTokens,
  type SessionUser,
} from '@/lib/auth';
import { refreshWithBackend } from '@/lib/backend-client';

export async function resolveAuthTokens(): Promise<AuthTokens | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken && !isTokenExpired(accessToken) && refreshToken) {
    const session = buildSessionFromAccessToken(accessToken);
    if (!session) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: session.id,
        email: session.email,
        roles: session.roles,
      },
    };
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await refreshWithBackend(refreshToken);
    setAuthCookies(cookieStore, tokens);
    return tokens;
  } catch (error) {
    console.error('Failed to refresh auth tokens', error);
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const tokens = await resolveAuthTokens();
  if (!tokens) {
    return null;
  }

  return buildSessionFromAccessToken(tokens.accessToken);
}

export async function refreshTokensForProxy(
  refreshToken: string,
): Promise<AuthTokens | null> {
  try {
    return await refreshWithBackend(refreshToken);
  } catch (error) {
    console.error('Failed to refresh tokens in proxy', error);
    return null;
  }
}

export function attachRefreshedTokens(
  response: NextResponse,
  tokens: Pick<AuthTokens, 'accessToken' | 'refreshToken'>,
): NextResponse {
  setAuthCookies(response.cookies, tokens);
  return response;
}
