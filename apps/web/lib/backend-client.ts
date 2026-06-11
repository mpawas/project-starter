import type { AuthTokens } from '@/lib/auth';

interface BackendEnvelope<T> {
  data: T;
}

interface BackendErrorBody {
  message?: string | string[];
  statusCode?: number;
}

export function getBackendApiUrl(): string {
  return process.env.BACKEND_API_URL ?? 'http://localhost:3000';
}

async function parseBackendError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as BackendErrorBody;
    if (typeof body.message === 'string') {
      return body.message;
    }
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
  } catch (error) {
    console.error('Failed to parse backend error response', error);
  }

  return `Backend request failed with status ${response.status}`;
}

async function parseAuthResponse(response: Response): Promise<AuthTokens> {
  if (!response.ok) {
    throw new Error(await parseBackendError(response));
  }

  const body = (await response.json()) as BackendEnvelope<AuthTokens>;
  if (!body.data?.accessToken || !body.data?.refreshToken || !body.data?.user) {
    throw new Error('Backend returned an invalid auth response.');
  }

  return body.data;
}

export async function loginWithBackend(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const response = await fetch(`${getBackendApiUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  return parseAuthResponse(response);
}

export async function refreshWithBackend(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${getBackendApiUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  return parseAuthResponse(response);
}

export async function proxyBackendRequest(
  pathSegments: string[],
  request: Request,
  accessToken: string,
): Promise<Response> {
  const targetUrl = new URL(pathSegments.join('/'), `${getBackendApiUrl()}/`);
  const requestUrl = new URL(request.url);
  requestUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }
  headers.set('authorization', `Bearer ${accessToken}`);

  const method = request.method.toUpperCase();
  const hasBody = !['GET', 'HEAD'].includes(method);
  const body = hasBody ? await request.text() : undefined;

  const backendResponse = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: 'no-store',
  });

  const responseBody = await backendResponse.text();
  return new Response(responseBody, {
    status: backendResponse.status,
    headers: {
      'content-type': backendResponse.headers.get('content-type') ?? 'application/json',
    },
  });
}
