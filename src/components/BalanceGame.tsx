import { useEffect, useRef, useState } from 'react';
// background now uses a direct image for this mini-game

interface BalanceGameProps {
  onWin: () => void;
  onFail: () => void;
}

type Obstacle = { id: number; x: number; y?: number; w: number; h: number; kind: 'ground' | 'bird'; passed?: boolean };

export default function BalanceGame({ onWin, onFail }: BalanceGameProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const canSpawnRef = useRef(true);
  const nextId = useRef(1);
  const lastSpawnRef = useRef<number>(0);
  const spawnIntervalMs = 280; // desired minimum ms between spawns

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [charY, setCharY] = useState(0); // px above ground
  const velRef = useRef(0);
  const gravity = -1.2; // stronger gravity for snappier arcs
  const jumpVel = 18; // stronger jump so player clears taller obstacles
  const [showTap, setShowTap] = useState(true);
  const [score, setScore] = useState(0);
  // target score to advance to next scene
  const targetScore = 100;
  const [runFrame, setRunFrame] = useState(1);

  // helper: spawn a single obstacle (ground or bird). immediate param places it closer.
  const spawnObstacle = (kind: 'ground' | 'bird' = 'ground', immediate = false) => {
    const id = nextId.current++;
    if (kind === 'bird') {
      const w = 5 + Math.random() * 3;
      const h = 4 + Math.random() * 3;
      const x = immediate ? 88 : 110;
      const y = 10 + Math.random() * 18;
      setObstacles(prev => [...prev, { id, x, y, w, h, kind }]);
    } else {
      const w = 5 + Math.random() * 4; // narrower
      const h = 4 + Math.random() * 4; // shallower
      const x = immediate ? 88 : 110;
      setObstacles(prev => [...prev, { id, x, w, h, kind }]);
    }
    canSpawnRef.current = false;
    lastSpawnRef.current = Date.now();
    // re-enable spawn faster so player is under pressure
    const cooldown = 250 + Math.random() * 250; // much shorter cooldown
    window.setTimeout(() => { canSpawnRef.current = true; }, cooldown);
  };

  // initial spawn to start the flow
  useEffect(() => {
    const t = window.setTimeout(() => spawnObstacle('ground'), 300);
    return () => clearTimeout(t);
  }, []);

  // spawn loop: try to spawn periodically when spacing allows
  useEffect(() => {
    // time-based spawner: spawn at least `spawnIntervalMs` apart. This is
    // resilient to tab visibility throttling because it checks wall-clock time.
    const iv = setInterval(() => {
      if (!canSpawnRef.current) return;
      const now = Date.now();
      if (now - lastSpawnRef.current < spawnIntervalMs) return;
      const last = obstacles.length ? obstacles[obstacles.length - 1] : null;
      if (!last || last.x < 65 || last.passed) {
        const kind = Math.random() < 0.32 ? 'bird' : 'ground';
        spawnObstacle(kind as 'ground' | 'bird', false);
        // paired obstacle more likely for pressure
        if (Math.random() < 0.36) {
          setTimeout(() => { if (canSpawnRef.current) spawnObstacle('ground', true); }, 120 + Math.random() * 160);
        }
        lastSpawnRef.current = now;
      }
    }, 140); // check ~7x per second

    return () => clearInterval(iv);
  }, [obstacles]);

  // fallback spawner: if nothing spawned for a short while (e.g. after tab switch)
  // force an obstacle so the player isn't left waiting.
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      // if it's been more than 1.2s since last spawn, force one
      if (now - lastSpawnRef.current > 1200) {
        const kind = Math.random() < 0.36 ? 'bird' : 'ground';
        spawnObstacle(kind as 'ground' | 'bird', false);
        // small paired follow-up
        if (Math.random() < 0.32) setTimeout(() => spawnObstacle('ground', true), 140 + Math.random() * 180);
        lastSpawnRef.current = now;
      }
    }, 700);

    return () => clearInterval(iv);
  }, []);

  // hide tap indicator after 2 seconds
  useEffect(() => {
    const t = window.setTimeout(() => setShowTap(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // game loop: move obstacles, update jump physics, detect collision / scoring
  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(50, t - last);
      last = t;

      setObstacles(prev => {
        const area = areaRef.current?.getBoundingClientRect();
        const baseSpeed = 120 + Math.min(400, score * 0.6); // speed scales mildly with score
        const next: Obstacle[] = [];

        for (const ob of prev) {
          const delta = (baseSpeed * dt) / 1000; // percent this frame
          const nx = ob.x - delta;
          const moved = { ...ob, x: nx } as Obstacle;

          if (area) {
            const charWidthPx = 72;
            const charHeightPx = 110;
            const charCenterPercent = 24; // percent from left where character stands
            const charCenterX = area.left + (charCenterPercent / 100) * area.width;
            const charLeft = charCenterX - charWidthPx / 2;
            const charRight = charLeft + charWidthPx;
            const charBottom = area.top + area.height - 6;
            const charTop = charBottom - (charHeightPx + charY);

            const obWidthPx = (moved.w / 100) * area.width;
            const obLeftCenter = area.left + (moved.x / 100) * area.width;
            const obLeft = obLeftCenter - obWidthPx / 2;
            const obRight = obLeft + obWidthPx;

                  if (moved.kind === 'ground') {
                    const obTop = area.top + area.height - (moved.h / 100) * area.height - 6;
                    const obBottom = area.top + area.height - 6;

                    const horizOverlap = obRight >= charLeft && obLeft <= charRight;
                    // if player is sufficiently high (jumping), allow passing
                    const isJumpingHigh = charY > 14; // lower threshold, easier to clear
                    const vertOverlap = obBottom >= charTop && obTop <= charBottom;

                    if (horizOverlap && vertOverlap && !isJumpingHigh) {
                      setTimeout(() => onFail(), 80);
                      return prev;
                    }

                    // scoring when obstacle passed character center
                    if (!moved.passed && obRight < charCenterX) {
                      moved.passed = true;
                      setScore(s => {
                        const nextScore = s + 10;
                        if (nextScore >= targetScore) setTimeout(() => onWin(), 300);
                        return nextScore;
                      });
                    }
                  } else {
              // bird - positioned by top percent
              const obTop = area.top + ((moved.y || 12) / 100) * area.height;
              const obBottom = obTop + (moved.h / 100) * area.height;

              const horizOverlap = obRight >= charLeft && obLeft <= charRight;
              const vertOverlap = obBottom >= charTop && obTop <= charBottom;

              // If player is in air (jumping) and overlaps bird, treat as collision
              if (horizOverlap && vertOverlap && charY > 8) {
                setTimeout(() => onFail(), 80);
                return prev;
              }
            }
          }

          if (moved.x > -30) next.push(moved);
        }

        return next;
      });

      // update character physics (charY is height above ground in px)
      if (velRef.current !== 0 || charY > 0) {
        velRef.current += gravity * (dt / 16);
        const nextY = Math.max(0, charY + velRef.current * (dt / 16));
        if (nextY <= 0) {
          velRef.current = 0;
          setCharY(0);
        } else {
          setCharY(nextY);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [charY, onFail, onWin, score]);

  // jump handler (tap)
  const doJump = () => {
    // single jump only: allow when on (near) ground
    if (charY <= 2) {
      velRef.current = jumpVel;
      setCharY(prev => Math.max(prev, 12));
    }
  };

  // touch/keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === ' ' || e.code === 'Space') doJump(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // running frames
  useEffect(() => {
    let mounted = true;
    let t = window.setTimeout(function step() {
      setRunFrame(f => (f % 5) + 1);
      if (mounted) t = window.setTimeout(step, 100);
    }, 120);
    return () => { mounted = false; clearTimeout(t); };
  }, []);

  // reset on mount
  useEffect(() => {
    setObstacles([]);
    setCharY(0);
    velRef.current = 0;
    setScore(0);
  }, []);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div ref={areaRef} className="relative w-[360px] h-[640px] rounded-md overflow-hidden pixel-border" style={{ width: 360, height: 640, touchAction: 'none' }} onClick={doJump} onPointerDown={doJump} onTouchStart={doJump}>
          <img src="/image2.png" alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', zIndex: 2 }} />

          <div className="absolute top-3 left-3 z-20 flex gap-3">
              <div className="px-3 py-1 bg-purple-900/95 text-pink-200 rounded-xl shadow-lg border-2 border-pink-600/20">Puan: <span className="font-bold">{score}</span></div>
              <div className="px-3 py-1 bg-purple-900/95 text-pink-200 rounded-xl shadow-lg border-2 border-pink-600/20">Hedef: <span className="font-bold">{score}/{targetScore}</span></div>
          </div>

          {/* ground */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg,#254, #0b0720)' }} />

          {/* obstacles */}
          {obstacles.map(ob => (
            ob.kind === 'ground' ? (
              <div key={ob.id} style={{ position: 'absolute', bottom: 6, left: `${ob.x}%`, transform: 'translateX(-50%)', width: `${ob.w}%`, height: `${ob.h}%`, zIndex: 15 }}>
                <div style={{ width: '100%', height: '100%', background: '#7c3aed', borderRadius: 6, boxShadow: '0 4px 8px rgba(0,0,0,0.4)' }} />
              </div>
            ) : (
              <div key={ob.id} style={{ position: 'absolute', top: `${ob.y}%`, left: `${ob.x}%`, transform: 'translate(-50%, 0)', width: `${ob.w}%`, height: `${ob.h}%`, zIndex: 18 }}>
                <div style={{ width: '100%', height: '100%', background: '#f59e0b', borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }} />
              </div>
            )
          ))}

          {/* character */}
          <div style={{ position: 'absolute', bottom: 6 + charY, left: '24%', transform: 'translateX(-50%)', width: 72, height: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 20 }}>
            <img src={`/yaren_karakter_2_kosu${runFrame}.png`} alt="Yaren" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/yaren_karakter.png'; }} style={{ width: 72, height: 110, objectFit: 'contain', pointerEvents: 'none' }} />
          </div>

          {/* tap indicator */}
          {showTap && <div className="absolute left-1/2 transform -translate-x-1/2 bottom-24 text-pink-200 z-30">Tap to jump</div>}

          {/* removed explicit jump UI per request (tapping area still triggers jump) */}
        </div>
      </div>
    </div>
  );
}
