import { useEffect, useRef, useState } from 'react';
import PixelParallaxBackground from './PixelParallaxBackground';

interface CoffeeGameProps {
  onWin: () => void;
  onLose: () => void;
}

type Obstacle = { id: number; x: number; y: number; w: number; h: number; passed?: boolean };

export default function CoffeeGame({ onWin, onLose }: CoffeeGameProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const spawnRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const nextId = useRef(1);

  const [charX, setCharX] = useState<number>(50); // percent
  const [runFrame, setRunFrame] = useState<number>(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState<number>(0);

  // spawn obstacles from top at interval
  useEffect(() => {
    spawnRef.current = window.setInterval(() => {
      const id = nextId.current++;
      const w = 6 + Math.random() * 6; // percent width (smaller)
      const h = 4 + Math.random() * 6; // percent height (shorter)
      const x = 6 + Math.random() * (88 - w); // keep within bounds
      const y = -12 - Math.random() * 10; // start above view
      setObstacles(prev => [...prev, { id, x, y, w, h }]);
    }, 1500);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, []);

  // main loop: advance obstacles and handle collisions/score
  useEffect(() => {
    const loop = (t: number) => {
      if (!lastRef.current) lastRef.current = t;
      const dt = Math.min(50, t - lastRef.current);
      lastRef.current = t;

      setObstacles(prev => {
        const area = areaRef.current?.getBoundingClientRect();
        // slower falling speed so obstacles come down gently
        const speedBase = 0.008 + Math.min(0.03, score * 0.0003);
        const next: Obstacle[] = [];

        for (const ob of prev) {
          const newY = ob.y + speedBase * (dt / 16) * 100; // percent per frame-ish
          const moved = { ...ob, y: newY };

          // if area exists, check collision and scoring
          if (area) {
            const charW = 10; // percent (smaller)
            const charH = 22; // percent (smaller)
            const charLeft = (charX / 100) * area.width;
            const charRight = ((charX + charW) / 100) * area.width;
            const charTop = area.top + area.height - (charH / 100) * area.height - 22; // moved up onto road
            const charBottom = area.top + area.height - 22;

            const obLeft = (moved.x / 100) * area.width;
            const obRight = obLeft + (moved.w / 100) * area.width;
            const obTop = area.top + (moved.y / 100) * area.height;
            const obBottom = obTop + (moved.h / 100) * area.height;

            const horizOverlap = obRight >= charLeft && obLeft <= charRight;
            const vertOverlap = obBottom >= charTop && obTop <= charBottom;

            if (horizOverlap && vertOverlap) {
              // collision -> lose
              setTimeout(() => onLose(), 60);
              // stop processing further obstacles
              return prev;
            }

              // scoring: when obstacle passes bottom of character
            if (!moved.passed && obTop > charBottom) {
              moved.passed = true;
              setScore(s => s + 10);
            }
          }

          // keep obstacles that are still above a bit beyond bottom
          if (moved.y < 120) next.push(moved);
        }

        return next;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastRef.current = null;
    };
  }, [charX, score, onLose]);

  // win condition
  useEffect(() => {
    if (score >= 100) setTimeout(() => onWin(), 300);
  }, [score, onWin]);

  // run animation frames for character
  useEffect(() => {
    let mounted = true;
    let timer = window.setTimeout(function step() {
      setRunFrame(f => (f % 5) + 1);
      if (mounted) timer = window.setTimeout(step, 110);
    }, 120);
    return () => { mounted = false; clearTimeout(timer); };
  }, []);

  // keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setCharX(x => Math.max(0, x - 6));
      else if (e.key === 'ArrowRight' || e.key === 'd') setCharX(x => Math.min(76, x + 6));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={areaRef}
          className="relative w-[360px] h-[640px] rounded-md overflow-hidden pixel-border"
          style={{ width: 360, height: 640 }}
        >
          <PixelParallaxBackground bgImage="/image.png" />

          <div className="absolute top-3 left-3 flex gap-3 z-20">
            <div className="px-3 py-1 bg-purple-900/95 text-pink-200 rounded-xl shadow-lg border-2 border-pink-600/20">Puan: <span className="font-bold">{score}</span></div>
          </div>

          {obstacles.map(ob => (
            <div
              key={ob.id}
              style={{
                position: 'absolute',
                left: `${ob.x}%`,
                top: `${ob.y}%`,
                transform: 'translate(-50%, 0)',
                width: `${ob.w}%`,
                height: `${ob.h}%`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 15
              }}
            >
              <div style={{ width: '100%', height: '100%', background: '#8b5cf6', borderRadius: 6, boxShadow: '0 4px 8px rgba(0,0,0,0.4)' }} />
            </div>
          ))}

          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: `calc(${charX}% )`,
              transform: 'translateX(-50%)',
              width: 88,
              height: 128,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              zIndex: 20
            }}
          >
            <img
              src={`/yaren_karakter_2_kosu${runFrame}.png`}
              alt="Yaren"
              onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.src = '/yaren_karakter.png'; }}
              style={{ width: 88, height: 128, objectFit: 'contain', pointerEvents: 'none' }}
            />
          </div>

          <button
            onClick={() => setCharX(x => Math.max(0, x - 10))}
            aria-label="Sola"
            className="w-14 h-14 rounded-full bg-purple-800 text-pink-200 flex items-center justify-center shadow-2xl border-2 border-pink-600/20"
            style={{ position: 'absolute', left: 12, bottom: 40, zIndex: 30 }}
          >
            <span style={{ fontSize: 20 }}>◀</span>
          </button>

          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 92, width: 56, height: 56, zIndex: 20 }} />

          <button
            onClick={() => setCharX(x => Math.min(76, x + 10))}
            aria-label="Sağa"
            className="w-14 h-14 rounded-full bg-purple-800 text-pink-200 flex items-center justify-center shadow-2xl border-2 border-pink-600/20"
            style={{ position: 'absolute', right: 12, bottom: 40, zIndex: 30 }}
          >
            <span style={{ fontSize: 20 }}>▶</span>
          </button>
        </div>
      </div>
    </div>
  );
}
