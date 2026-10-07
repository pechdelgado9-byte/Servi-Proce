"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Delay adding the class slightly to ensure React hydration has finished
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, 50);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px 50px 0px" });

    // Use interval to find unobserved elements and act as a failsafe
    const intervalId = setInterval(() => {
      const elements = document.querySelectorAll('.fade-in-up:not(.is-observed), .zoom-in:not(.is-observed), .slide-in-right:not(.is-observed)');
      elements.forEach(el => {
        el.classList.add('is-observed');
        
        // Failsafe: if the element is already in the viewport upon observation,
        // force it visible immediately to prevent blank blocks if observer drops it
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
           setTimeout(() => {
             el.classList.add('is-visible');
           }, 50);
        } else {
           observer.observe(el);
        }
      });
    }, 250);

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
