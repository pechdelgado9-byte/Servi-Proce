"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    let observer = null;
    let isCleanedUp = false;

    // Función para revelar elementos visibles o cercanos al viewport
    const checkElements = () => {
      if (isCleanedUp) return;
      const elements = document.querySelectorAll(
        '.fade-in-up:not(.is-visible), .zoom-in:not(.is-visible), .slide-in-right:not(.is-visible)'
      );
      
      const vh = window.innerHeight || 800;
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh + 300 && rect.bottom >= -100) {
          el.classList.add('is-visible');
        }
      });
    };

    // Se difiere la inicialización 100ms para asegurar que React termine
    // completamente la fase de hidratación del DOM y evitar cualquier Hydration Mismatch
    const initTimer = setTimeout(() => {
      if (isCleanedUp) return;

      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.01, rootMargin: '0px 0px 300px 0px' }
        );

        const elements = document.querySelectorAll(
          '.fade-in-up:not(.is-visible), .zoom-in:not(.is-visible), .slide-in-right:not(.is-visible)'
        );
        elements.forEach((el) => observer.observe(el));
      }

      // Comprobación de viewport tras hidratación
      checkElements();

      // Revelar elementos si hay un ancla en la URL (#cotizador, etc.)
      if (typeof window !== 'undefined' && window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.classList.add('is-visible');
          target.querySelectorAll('.fade-in-up, .zoom-in, .slide-in-right').forEach((el) => {
            el.classList.add('is-visible');
          });
        }
      }
    }, 100);

    // Failsafe de seguridad: a los 800ms forzar visibilidad de cualquier elemento restante
    const failsafeTimer = setTimeout(() => {
      if (isCleanedUp) return;
      const hidden = document.querySelectorAll(
        '.fade-in-up:not(.is-visible), .zoom-in:not(.is-visible), .slide-in-right:not(.is-visible)'
      );
      hidden.forEach((el) => el.classList.add('is-visible'));
    }, 800);

    // Escuchar scroll pasivo
    window.addEventListener('scroll', checkElements, { passive: true });
    window.addEventListener('resize', checkElements, { passive: true });

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
