"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // RNF-04: 15 minutos continuos de inactividad

export default function AdminInactivityMonitor({ lang, logoutAction }) {
  const router = useRouter();
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);

  useEffect(() => {
    let lastActivity = Date.now();

    const resetTimer = () => {
      lastActivity = Date.now();
      setRemainingSeconds(15 * 60);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));

    const interval = setInterval(async () => {
      const elapsed = Date.now() - lastActivity;
      const left = Math.max(0, Math.ceil((INACTIVITY_LIMIT_MS - elapsed) / 1000));
      setRemainingSeconds(left);

      if (elapsed >= INACTIVITY_LIMIT_MS) {
        clearInterval(interval);
        const fd = new FormData();
        fd.set('lang', lang);
        fd.set('reason', 'inactivity');
        try {
          await logoutAction(fd);
        } catch {
          router.replace(`/${lang}/admin?error=inactivity`);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [lang, logoutAction, router]);

  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const secs = String(remainingSeconds % 60).padStart(2, '0');

  return (
    <span
      className="admin-session-badge"
      title={lang === 'es' ? 'Cierre de sesión automático tras 15 minutos continuos de inactividad (RNF-04)' : 'Automatic logout after 15 minutes of continuous inactivity (RNF-04)'}
    >
      <span className="admin-session-badge__dot" aria-hidden="true" />
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span>{lang === 'es' ? `Sesión activa: ${mins}:${secs}` : `Active session: ${mins}:${secs}`}</span>
    </span>
  );
}
