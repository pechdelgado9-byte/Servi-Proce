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
    <span className="text-sm text-text-muted" title="Cierre automático tras 15 minutos de inactividad">
      {lang === 'es' ? `Sesión activa (${mins}:${secs})` : `Active session (${mins}:${secs})`}
    </span>
  );
}
