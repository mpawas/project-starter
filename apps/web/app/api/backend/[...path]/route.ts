import { NextResponse } from 'next/server';
import { resolveAuthTokens } from '@/lib/auth-session';
import { proxyBackendRequest } from '@/lib/backend-client';

interface RouteContext {
  params: Promise<{
    path: string[];
  }>;
}

async function handleProxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const tokens = await resolveAuthTokens();

  if (!tokens) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return proxyBackendRequest(path, request, tokens.accessToken);
}

export async function GET(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleProxy(request, context);
}
