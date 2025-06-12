import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export default function AdvancedParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { theme } = useTheme();

  const createParticle = useCallback((x?: number, y?: number): Particle => {
    const colors = theme === 'dark' 
      ? ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fed7d7', '#8b5cf6', '#a855f7']
      : ['#dc2626', '#ef4444', '#f87171', '#6366f1', '#8b5cf6', '#a855f7'];
    
    return {
      x: x ?? Math.random() * window.innerWidth,
      y: y ?? Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 400 + 300
    };
  }, [theme]);

  const initializeParticles = useCallback(() => {
    particlesRef.current = [];
    for (let i = 0; i < 80; i++) {
      particlesRef.current.push(createParticle());
    }
  }, [createParticle]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = particle.color;
    ctx.fill();
    ctx.restore();
  }, []);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    const maxDistance = 100;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.2;
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = theme === 'dark' ? '#dc2626' : '#ef4444';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }, [theme]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with fade effect
    ctx.fillStyle = theme === 'dark' 
      ? 'rgba(3, 7, 18, 0.05)' 
      : 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Mouse interaction - more subtle and smooth
      const dx = mouseRef.current.x - particle.x;
      const dy = mouseRef.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        const force = (150 - distance) / 150;
        particle.vx += (dx / distance) * force * 0.05;
        particle.vy += (dy / distance) * force * 0.05;
      }
      
      // Add slight drift for natural movement
      particle.vx += (Math.random() - 0.5) * 0.02;
      particle.vy += (Math.random() - 0.5) * 0.02;
      
      // Damping to prevent excessive speed
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Boundary check
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(canvas.height, particle.y));

      // Fade out as particle ages
      if (particle.life > particle.maxLife * 0.8) {
        particle.opacity = Math.max(0, particle.opacity - 0.01);
      }

      // Respawn particle if it's too old or invisible
      if (particle.life > particle.maxLife || particle.opacity <= 0) {
        particlesRef.current[index] = createParticle();
      }

      drawParticle(ctx, particle);
    });

    // Draw connections between nearby particles
    drawConnections(ctx, particlesRef.current);

    animationRef.current = requestAnimationFrame(animate);
  }, [theme, createParticle, drawParticle, drawConnections]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    resizeCanvas();
    initializeParticles();
    animate();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [resizeCanvas, initializeParticles, animate, handleMouseMove]);

  // Reinitialize when theme changes
  useEffect(() => {
    initializeParticles();
  }, [theme, initializeParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #030712 0%, #0c1426 25%, #1e1b4b 50%, #312e81 75%, #1e1b4b 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #e0e7ff 50%, #c7d2fe 75%, #e0e7ff 100%)'
      }}
    />
  );
}