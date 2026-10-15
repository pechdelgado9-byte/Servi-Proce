"use client";
import { useEffect, useRef } from 'react';

export default function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Si el usuario prefiere movimiento reducido, no inicializamos las partículas
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const isDarkMode = () => {
      return document.documentElement.classList.contains('dark') || 
        (!document.documentElement.classList.contains('light') && 
         window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.2 + 1.2;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
        this.isRed = Math.random() > 0.45;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw(dark) {
        if (this.isRed) {
          ctx.fillStyle = dark ? 'rgba(239, 68, 68, 0.70)' : 'rgba(185, 28, 28, 0.65)';
        } else {
          ctx.fillStyle = dark ? 'rgba(255, 255, 255, 0.48)' : 'rgba(30, 41, 59, 0.40)';
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particlesArray = [];
    // Densidad óptima de partículas
    const count = Math.min(85, Math.floor((window.innerWidth * window.innerHeight) / 14000));
    for (let i = 0; i < count; i++) {
      particlesArray.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dark = isDarkMode();

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw(dark);
        
        // Conexiones de red entre partículas cercanas
        for (let j = i + 1; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 115) {
            const alpha = (1 - distance / 115) * (dark ? 0.22 : 0.16);
            ctx.beginPath();
            if (particlesArray[i].isRed || particlesArray[j].isRed) {
              ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`;
            } else {
              ctx.strokeStyle = dark ? `rgba(255, 255, 255, ${alpha})` : `rgba(71, 85, 105, ${alpha})`;
            }
            ctx.lineWidth = 0.75;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 1 
      }} 
      aria-hidden="true"
    />
  );
}
