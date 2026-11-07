import { cookies } from 'next/headers';
import { API_BASE_URL } from './api';

// Gestión de sesión del administrador en el Frontend conectada por JWT al Backend Headless
export const ADMIN_COOKIE = 'sp_admin_jwt';
export const SESSION_MAX_AGE_S = 15 * 60; // Cierre automático de sesión tras 15 minutos de inactividad

export function adminEnabled() {
  return true;
}

export async function getAdminToken() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value || '';
}

export async function isAdmin() {
  const token = await getAdminToken();
  if (!token) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.valid);
  } catch {
    return false;
  }
}

export async function fetchAdminDashboardData() {
  const token = await getAdminToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    return null;
  }

  return null;
}
