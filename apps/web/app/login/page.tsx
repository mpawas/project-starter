import { Suspense } from 'react';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="card">
          <p>Loading login...</p>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
