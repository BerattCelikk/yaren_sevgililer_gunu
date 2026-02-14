import { useEffect, useRef } from 'react';

type Props = {
  width?: number | string;
  height?: number | string;
  bgImage?: string;
};

// Pixelated parallax background with simple particle canvas and a soft light beam
export default function PixelParallaxBackground({ width = '100%', height = '100%', bgImage }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; size: number }>>([]);

  useEffect(() => {
    // initialize particles
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = containerRef.current!.clientWidth * dpr;
      canvas.height = containerRef.current!.clientHeight * dpr;
      canvas.style.width = containerRef.current!.clientWidth + 'px';
      canvas.style.height = containerRef.current!.clientHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // create gentle floating square particles
    const count = Math.max(12, Math.floor((canvas.width / 400) * 12));
    const parts = [];
    for (let i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * canvas.width / (window.devicePixelRatio || 1),
        y: Math.random() * canvas.height / (window.devicePixelRatio || 1),
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.1 - 0.02,
        size: Math.random() * 3 + 1
      });
    }
    particlesRef.current = parts;

    let raf = 0;
    const loop = () => {
      if (!ctx || !containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.max(1, Math.floor(p.size)), Math.max(1, Math.floor(p.size)));
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // simple mouse parallax handler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      const layers = el.querySelectorAll<HTMLElement>('[data-parallax]');
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.parallax) || 0;
        layer.style.transform = `translate3d(${cx * depth * 8}px, ${cy * depth * 6}px, 0)`;
      });
    };

    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, width, height, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* far layer: background image or subtle tiled wallpaper */}
      {bgImage ? (
        <img data-parallax="0.8" src={bgImage} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', opacity: 1 }} />
      ) : (
        <div data-parallax="0.6" style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, #071018 0 8px, #071018 8px 16px), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 8px)`, opacity: 0.9, imageRendering: 'pixelated' }} />
      )}

      {/* mid layer: blocky furniture silhouette (when bgImage present keep subtle) */}
      <div data-parallax="1.2" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%', backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,6,12,0.25) 40%), repeating-linear-gradient(90deg, rgba(30,14,30,0.25) 0 12px, rgba(22,8,22,0.25) 12px 24px)`, filter: 'contrast(1.02) saturate(1.02)', transformOrigin: 'center bottom', imageRendering: 'pixelated', pointerEvents: 'none' }} />

      {/* near layer: light vignette reduced when using full image */}
      <div data-parallax="1.6" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 75%, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.25) 60%)', mixBlendMode: 'multiply', imageRendering: 'pixelated', pointerEvents: 'none' }} />

      {/* soft light beam */}
      <div style={{ position: 'absolute', left: '30%', top: '-10%', width: '40%', height: '80%', transform: 'rotate(-12deg)', background: 'linear-gradient(180deg, rgba(255,255,200,0.06), rgba(255,255,200,0.00))', filter: 'blur(12px)', opacity: 0.9, pointerEvents: 'none' }} />

      {/* particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  );
}
