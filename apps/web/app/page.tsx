'use client';

import { useEffect, useState } from 'react';
import type { SessionUser } from '@/lib/auth';

interface SessionResponse {
  session: SessionUser | null;
}

export default function HomePage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as SessionResponse;
        setSession(data.session);
      } catch (fetchError) {
        console.error('Failed to fetch session', fetchError);
        setError('Unable to load session information.');
      }
    };

    void fetchSession();
  }, []);

  return (
    <section className="card">
      <h1>Main Website</h1>
      <p>This is the public website area in the same Next.js app.</p>
      {error ? <p className="text-danger">{error}</p> : null}
      {session?.isAuthenticated ? (
        <p>
          Authenticated as <strong>{session.email}</strong> with roles{' '}
          <strong>{session.roles.join(', ')}</strong>.
        </p>
      ) : (
        <p>You are browsing as a guest.</p>
      )}
    </section>
  );
}
