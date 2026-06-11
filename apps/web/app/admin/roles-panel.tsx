'use client';

import { useEffect, useState } from 'react';

interface Role {
  id: string;
  name: string;
}

interface BackendEnvelope<T> {
  data: T;
}

export function AdminRolesPanel() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await fetch('/api/backend/roles', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const body = (await response.json()) as BackendEnvelope<Role[]>;
        setRoles(body.data ?? []);
      } catch (loadError) {
        console.error('Failed to load roles from backend proxy', loadError);
        setError('Unable to load roles from backend API.');
      }
    };

    void loadRoles();
  }, []);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div>
      <h2>Roles from backend</h2>
      <ul>
        {roles.map((role) => (
          <li key={role.id}>{role.name}</li>
        ))}
      </ul>
    </div>
  );
}
