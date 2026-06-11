import { getSessionUser } from '@/lib/auth-session';
import { AdminRolesPanel } from './roles-panel';

export default async function AdminPage() {
  const session = await getSessionUser();

  return (
    <section className="card">
      <h1>Admin Section</h1>
      <p>Only authenticated admins can access this route.</p>
      {session ? (
        <p>
          Welcome, <strong>{session.email}</strong>.
        </p>
      ) : null}
      <AdminRolesPanel />
    </section>
  );
}
