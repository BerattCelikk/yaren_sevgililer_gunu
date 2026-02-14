import React, { useEffect, useRef, useState } from 'react';

type Props = {
  onWin: () => void;
  onLose: () => void;
};

// SuperDuo - cooperative mini-game
const SuperDuo: React.FC<Props> = ({ onWin, onLose }) => {
  const [timeLeft, setTimeLeft] = useState(45);
  const [running, setRunning] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // positions in percentage across the playfield
  const pos = useRef({ bX: 6, bY: 0, yX: 94, yY: 0 });
  const vel = useRef({ bVY: 0, yVY: 0 });

  const obstacles = useRef([
    // simple spike (x position percent, width percent, type)
    { x: 28, w: 6, type: 'spike' },
    // wide gap that requires synchronized jump
    { x: 50, w: 14, type: 'gap' },
    // wall near the end that requires plate to open
    { x: 78, w: 6, type: 'wall' }
  ] as Array<{ x: number; w: number; type: string }>);

  // pressure plate location (percent)
  const plate = useRef({ x: 72, w: 6, active: false, heldBy: '' as 'b' | 'y' | '' });

  const holding = useRef({ left: false, right: false });

  // physics
  const GRAVITY = 0.5;
  const JUMP = -8;

  // Audio (retro music) - may not exist, fallback silently
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    musicRef.current = new Audio('/audio/superduo-8bit.mp3');
    musicRef.current.loop = true;
    musicRef.current.volume = 0.6;
    musicRef.current.play().catch(() => {});

    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => {
      clearInterval(timer);
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setRunning(false);
      if (musicRef.current) musicRef.current.pause();
      onLose();
    }
  }, [timeLeft, onLose]);

  // main loop
  useEffect(() => {
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      if (!running) return;

      // auto-run toward center/right
      pos.current.bX += 18 * dt; // left character moves right
      pos.current.yX -= 18 * dt; // right character moves left (towards center)

      // apply gravity
      vel.current.bVY += GRAVITY;
      vel.current.yVY += GRAVITY;
      pos.current.bY += vel.current.bVY;
      pos.current.yY += vel.current.yVY;

      // ground clamp
      if (pos.current.bY > 0) { pos.current.bY = 0; vel.current.bVY = 0; }
      if (pos.current.yY > 0) { pos.current.yY = 0; vel.current.yVY = 0; }

      // pressure plate detection (Berat must hold)
      const bOnPlate = pos.current.bX >= plate.current.x && pos.current.bX <= plate.current.x + plate.current.w;
      const yOnPlate = pos.current.yX <= plate.current.x + plate.current.w && pos.current.yX >= plate.current.x;
      if (bOnPlate && holding.current.left) {
        plate.current.heldBy = 'b';
        plate.current.active = true;
      } else if (yOnPlate && holding.current.right) {
        plate.current.heldBy = 'y';
        plate.current.active = true;
      } else {
        plate.current.heldBy = '';
        plate.current.active = false;
      }

      // if plate active, remove wall obstacle
      if (plate.current.active) {
        obstacles.current = obstacles.current.filter(o => o.type !== 'wall');
      }

      // collision checks
      for (const obs of obstacles.current) {
        if (obs.type === 'gap') {
          // gap collision: if character within gap x range and on ground -> lose unless jumping
          const gapLeft = obs.x - obs.w / 2;
          const gapRight = obs.x + obs.w / 2;
          if (pos.current.bX >= gapLeft && pos.current.bX <= gapRight && pos.current.bY === 0) {
            setRunning(false);
            if (musicRef.current) musicRef.current.pause();
            onLose();
            return;
          }
          if (pos.current.yX >= gapLeft && pos.current.yX <= gapRight && pos.current.yY === 0) {
            setRunning(false);
            if (musicRef.current) musicRef.current.pause();
            onLose();
            return;
          }
        } else if (obs.type === 'spike') {
          if (Math.abs(pos.current.bX - obs.x) < obs.w / 2 && pos.current.bY === 0) {
            setRunning(false);
            if (musicRef.current) musicRef.current.pause();
            onLose();
            return;
          }
          if (Math.abs(pos.current.yX - obs.x) < obs.w / 2 && pos.current.yY === 0) {
            setRunning(false);
            if (musicRef.current) musicRef.current.pause();
            onLose();
            return;
          }
        }
      }

      // finish when both near the end (symmetric)
      if (pos.current.bX >= 92 && pos.current.yX <= 8) {
        setRunning(false);
        if (musicRef.current) musicRef.current.pause();
        onWin();
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, onLose, onWin]);

  // input handling - touch / pointer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width / 2) {
        // left tap - Berat jump
        holding.current.left = true;
        if (pos.current.bY === 0) vel.current.bVY = JUMP;
      } else {
        holding.current.right = true;
        if (pos.current.yY === 0) vel.current.yVY = JUMP;
      }
    };

    const onPointerUp = () => {
      holding.current.left = false;
      holding.current.right = false;
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative" style={{ width: '100%', maxWidth: 430, aspectRatio: '9/16', background: '#08121a' }}>
        <div className="absolute top-3 left-3 text-pink-200">Süre: {timeLeft}s</div>

        {/* ground */}
        <div className="absolute left-0 right-0 bottom-14 h-2 bg-zinc-800" />

        {/* obstacles visuals */}
        {obstacles.current.map((o, i) => (
          <div key={i} className={`absolute bottom-14 ${o.type==='spike'?'bg-red-700':'bg-zinc-700'}`} style={{ left: `${o.x}%`, width: `${o.w}%`, height: 12, transform: 'translateX(-50%)' }} />
        ))}

        {/* pressure plate */}
        <div className="absolute" style={{ left: `${plate.current.x}%`, bottom: 8, width: `${plate.current.w}%`, transform: 'translateX(-50%)' }}>
          <div className={`h-3 ${plate.current.active ? 'bg-green-400' : 'bg-red-600'}`} />
        </div>

        {/* Berat */}
        <div className="absolute" style={{ left: `${pos.current.bX}%`, bottom: `${14 + pos.current.bY}px`, transform: 'translateX(-50%)' }}>
          <div className="w-8 h-12 bg-gray-300" />
        </div>

        {/* Yaren */}
        <div className="absolute" style={{ left: `${pos.current.yX}%`, bottom: `${14 + pos.current.yY}px`, transform: 'translateX(-50%)' }}>
          <div className="w-8 h-12 bg-pink-600" />
        </div>
      </div>
    </div>
  );
};

export default SuperDuo;
