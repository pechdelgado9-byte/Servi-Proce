"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    let observer = null;
    let isCleanedUp = false;

    const SELECTOR =
      '.fade-in-up:not([data-visible="true"]), .zoom-in:not([data-visible="true"]), .slide-in-right:not([data-visible="true"])';

    // Función para revelar elementos visibles o cercanos al viewport sin mutar className (evita Hydration Mismatch)
    const checkElements = () => {
      if (isCleanedUp) return;
      const elements = document.querySelectorAll(SELECTOR);

      const vh = window.innerHeight || 800;
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh + 300 && rect.bottom >= -100) {
          el.setAttribute('data-visible', 'true');
        }
      });
    };

    // Se difiere toda inicialización y registro de eventos de scroll hasta después de la hidratación de React
    const initTimer = setTimeout(() => {
      if (isCleanedUp) return;

      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.setAttribute('data-visible', 'true');
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.01, rootMargin: '0px 0px 300px 0px' }
        );

        const elements = document.querySelectorAll(SELECTOR);
        elements.forEach((el) => observer.observe(el));
      }

      // Comprobación inicial de viewport tras hidratación completa
      checkElements();

      // Revelar elementos si hay un ancla en la URL (#banner-promocional, #cotizador, etc.)
      if (typeof window !== 'undefined' && window.location.hash) {
        try {
          const target = document.querySelector(window.location.hash);
          if (target) {
            target.setAttribute('data-visible', 'true');
            target.querySelectorAll('.fade-in-up, .zoom-in, .slide-in-right').forEach((el) => {
              el.setAttribute('data-visible', 'true');
            });
          }
        } catch {
          // Ignorar hashes inválidos
        }
      }

      // Escuchar scroll y resize únicamente después de terminar la hidratación
      window.addEventListener('scroll', checkElements, { passive: true });
      window.addEventListener('resize', checkElements, { passive: true });
    }, 180);

    // Failsafe de seguridad: a los 800ms forzar visibilidad de cualquier elemento restante
    const failsafeTimer = setTimeout(() => {
      if (isCleanedUp) return;
      const hidden = document.querySelectorAll(SELECTOR);
      hidden.forEach((el) => el.setAttribute('data-visible', 'true'));
    }, 800);

    return () => {
      isCleanedUp = true;
      clearTimeout(initTimer);
      clearTimeout(failsafeTimer);
      window.removeEventListener('scroll', checkElements);
      window.removeEventListener('resize', checkElements);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  return null;
}
