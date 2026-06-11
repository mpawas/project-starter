export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export const ACCESS_TOKEN_MAX_AGE = 60 * 15;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  exp?: number;
  iat?: number;
}

export interface SessionUser {
  isAuthenticated: boolean;
  id: string;
  email: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as JwtPayload;

    if (
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string' ||
      !Array.isArray(decoded.roles)
    ) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT payload', error);
    return null;
  }
}

export function isTokenExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  const expiresAt = payload.exp * 1000;
  return Date.now() >= expiresAt - skewSeconds * 1000;
}

export function hasAdminRole(roles: string[]): boolean {
  return roles.includes('admin');
}

export function buildSessionFromAccessToken(token: string): SessionUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload || isTokenExpired(token)) {
    return null;
  }

  return {
    isAuthenticated: true,
    id: payload.sub,
    email: payload.email,
    roles: payload.roles,
  };
}

type CookieWriter = {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly?: boolean;
      sameSite?: 'lax' | 'strict' | 'none';
      secure?: boolean;
      path?: string;
      maxAge?: number;
    },
  ) => void;
};

export function setAuthCookies(
  writer: CookieWriter,
  tokens: Pick<AuthTokens, 'accessToken' | 'refreshToken'>,
): void {
  writer.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  writer.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(writer: { delete: (name: string) => void }): void {
  writer.delete(ACCESS_TOKEN_COOKIE);
  writer.delete(REFRESH_TOKEN_COOKIE);
}
