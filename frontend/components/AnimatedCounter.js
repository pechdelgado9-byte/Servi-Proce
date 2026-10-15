"use client";
import { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  
  useEffect(() => {
    let rafId = null;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        let startTime = null;
        const animate = (time) => {
          if (!startTime) startTime = time;
          const progress = time - startTime;
          const increment = Math.min(progress / duration, 1);
          setCount(Math.floor(increment * end));
          if (progress < duration) {
            rafId = requestAnimationFrame(animate);
          } else {
            setCount(end);
          }
        };
        rafId = requestAnimationFrame(animate);
        observer.disconnect();
      }
    });

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}
