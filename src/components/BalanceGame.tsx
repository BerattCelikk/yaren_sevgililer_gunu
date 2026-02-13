import { useEffect, useRef, useState } from 'react';

interface BalanceGameProps {
  onWin: () => void;
  onFail: () => void; // called each time marker hits red (one fail)
}

export default function BalanceGame({ onWin, onFail }: BalanceGameProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [marker, setMarker] = useState(50); // 0..100
  const velocity = 0.06; // automatic drift (reduced for easier control)
  const [holdingLeft, setHoldingLeft] = useState(false);
  const [holdingRight, setHoldingRight] = useState(false);

  const [accumInside, setAccumInside] = useState(0); // seconds accumulated inside green
  const durationNeeded = 10; // seconds

  const [isShaking, setIsShaking] = useState(false);

  // marker boundaries
  const minX = 0;
  const maxX = 100;

  // green safe zone (percent) - center 40..60
  // make safe zone wider for easier play
  const greenStart = 35;
  const greenEnd = 65;

  // failure animation: when marker hits red region
  const handleFailure = () => {
    if (failureRef.current) return;
    failureRef.current = true;
    setIsShaking(true);
    setHoldingLeft(false);
    setHoldingRight(false);
    setTimeout(() => setIsShaking(false), 420);
    setAccumInside(0);
    onFail();
    // small cooldown before allowing another failure
    setTimeout(() => {
      failureRef.current = false;
    }, 600);
  };

  // controls: note spec wants left button to push marker RIGHT, right to push LEFT
  useEffect(() => {
    let last = performance.now();

    const loop = (t: number) => {
      const dt = Math.min(50, t - last) / 1000;
      last = t;

      setMarker(prev => {
        let m = prev;

        // automatic drift (sway)
        const sway = Math.sin(t / 350) * 0.02; // small oscillation
        m += velocity * dt * 10 + sway;

        // player inputs: left pushes marker right; right pushes marker left
        if (holdingLeft) m += 1.0 * dt * 60; // push right (slightly stronger)
        if (holdingRight) m -= 1.0 * dt * 60; // push left

        if (m < minX) m = minX;
        if (m > maxX) m = maxX;

        return m;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [holdingLeft, holdingRight, velocity]);

  // accumulation logic: when marker inside green zone, accumulate time
  useEffect(() => {
    // Use RAF to check marker and accumulate; keep simple and robust
    let running = true;
    const tick = () => {
      if (!running) return;

      setAccumInside(prev => {
        const inside = marker >= greenStart && marker <= greenEnd;
        if (inside) {
          const next = Math.min(durationNeeded, prev + 1 / 60); // assume ~60fps
          if (next >= durationNeeded) {
            running = false;
            onWin();
          }
          return next;
        }

        // if marker well into red, trigger failure
        if (marker < greenStart - 6 || marker > greenEnd + 6) {
          handleFailure();
        }

        return 0;
      });

      if (running) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marker]);

  // touch / pointer handlers for mobile buttons
  const startLeft = () => setHoldingLeft(true);
  const stopLeft = () => setHoldingLeft(false);
  const startRight = () => setHoldingRight(true);
  const stopRight = () => setHoldingRight(false);

  const remaining = Math.max(0, Math.ceil(durationNeeded - accumInside));

  const failureRef = useRef(false);

  // reset state when component mounts
  useEffect(() => {
    setMarker(50);
    setAccumInside(0);
    setHoldingLeft(false);
    setHoldingRight(false);
    setIsShaking(false);
    failureRef.current = false;
  }, []);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="w-full h-full bg-black/80 flex items-center justify-center">
        <div ref={areaRef} className={`relative w-[360px] h-[640px] max-w-[96vw] bg-[#1b1030] rounded-md pixel-border overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
          {/* Yaren sprite (simple circle placeholder) */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
            <div className="w-28 h-40 bg-[url('/yaren_karakter.png')] bg-contain bg-center bg-no-repeat" />
          </div>

          {/* Balance bar */}
          <div className="absolute left-6 right-6 bottom-36 h-12 flex items-center justify-center">
            <div className="relative w-full h-4 bg-red-900 rounded-md overflow-hidden">
              {/* green safe zone */}
              <div style={{ left: `${greenStart}%`, width: `${greenEnd - greenStart}%` }} className="absolute top-0 h-4 bg-green-500" />

              {/* progress fill inside green zone */}
              <div style={{ left: `${greenStart}%`, width: `${(greenEnd - greenStart) * (accumInside / durationNeeded)}%` }} className="absolute top-0 h-4 bg-white/40" />

              {/* marker */}
              <div style={{ left: `${marker}%` }} className="absolute top-[-8px] w-4 h-20 -translate-x-1/2 flex items-center justify-center">
                <div className="w-3 h-12 bg-yellow-300 rounded" />
              </div>
            </div>
          </div>

          {/* HUD: remaining seconds and fail hint */}
          <div className="absolute top-4 left-4 text-sm text-pink-200">Süre: {remaining}s</div>
          <div className="absolute top-4 right-4 text-sm text-pink-200">Hata sırası: kontrol et</div>

          {/* Controls */}
          <div className="absolute left-4 right-4 bottom-6 flex justify-between px-4">
            <button
              onPointerDown={startLeft}
              onPointerUp={stopLeft}
              onPointerLeave={stopLeft}
              onTouchStart={startLeft}
              onTouchEnd={stopLeft}
              className="w-28 h-14 rounded-lg bg-purple-800 text-pink-200 font-bold shadow-lg"
            >◀</button>

            <button
              onPointerDown={startRight}
              onPointerUp={stopRight}
              onPointerLeave={stopRight}
              onTouchStart={startRight}
              onTouchEnd={stopRight}
              className="w-28 h-14 rounded-lg bg-purple-800 text-pink-200 font-bold shadow-lg"
            >▶</button>
          </div>
        </div>
      </div>
    </div>
  );
}
