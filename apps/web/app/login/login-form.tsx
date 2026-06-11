'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasAdminRole } from '@/lib/auth';

interface LoginResponse {
  ok: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as LoginResponse;
      if (!response.ok || !data.ok || !data.user) {
        setError(data.error ?? 'Unable to sign in');
        return;
      }

      const redirectPath = searchParams.get('redirect');
      if (redirectPath?.startsWith('/admin') && hasAdminRole(data.user.roles)) {
        router.push(redirectPath);
      } else if (hasAdminRole(data.user.roles)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (submitError) {
      console.error('Failed to submit login', submitError);
      setError('Something went wrong during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }
      router.push('/');
      router.refresh();
    } catch (logoutError) {
      console.error('Failed to logout', logoutError);
      setError('Unable to log out.');
    }
  };

  return (
    <section className="card">
      <h1>Login</h1>
      <p>Sign in with your backend account. Tokens are stored in secure httpOnly cookies.</p>
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />

        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p>
        <button className="button secondary" type="button" onClick={handleLogout}>
          Log out
        </button>
      </p>
      {error ? <p className="text-danger">{error}</p> : null}
    </section>
  );
}
