import React, { useEffect, useRef, useState } from 'react';

type Props = { onWin: () => void; onLose: () => void };

const FrequencySync: React.FC<Props> = ({ onWin, onLose }) => {
  const [amp, setAmp] = useState(1); // pink amplitude multiplier
  const [phase, setPhase] = useState(0); // radians
  const [timeLeft, setTimeLeft] = useState(40);
  const [isWin, setIsWin] = useState(false);
  const rafRef = useRef<number | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const matchSinceRef = useRef<number | null>(null);

  // samples for comparison
  const SAMPLES = 256;

  useEffect(() => {
    musicRef.current = new Audio('/audio/sync-8bit.mp3');
    musicRef.current.loop = true;
    musicRef.current.volume = 0.5;
    musicRef.current.play().catch(() => {});
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);

    // initialize with a small random mismatch so the game doesn't auto-win on mount
    setAmp(Math.random() * 1.6 + 0.2); // 0.2 .. 1.8
    setPhase((Math.random() * 6.28) - 3.14); // -pi .. pi
    return () => { clearInterval(t); if (musicRef.current) { musicRef.current.pause(); musicRef.current = null; } };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (musicRef.current) musicRef.current.pause();
      onLose();
    }
  }, [timeLeft, onLose]);

  // compute signals and check overlap
  useEffect(() => {
    const loop = (now: number) => {

      // compute average absolute difference between base (blue) and pink
      const baseAmp = 1;
      const basePhase = 0;
      let sum = 0;
      let maxVal = 0;
      for (let i = 0; i < SAMPLES; i++) {
        const x = (i / SAMPLES) * Math.PI * 2;
        const b = baseAmp * Math.sin(x + basePhase);
        const p = amp * Math.sin(x + phase);
        sum += Math.abs(b - p);
        maxVal += Math.abs(b) + Math.abs(p);
      }
      const avg = sum / SAMPLES;
      const norm = avg / 2; // approx

      // If within tolerance 0.02 (2% approx), require it to hold for a short duration
      const TOLERANCE = 0.02;
      const HOLD_MS = 400;
      if (norm <= TOLERANCE) {
        if (matchSinceRef.current === null) matchSinceRef.current = now;
        else if (!isWin && now - matchSinceRef.current >= HOLD_MS) {
          setIsWin(true);
          // stop audio and cancel RAF loop before calling onWin so the
          // component can unmount cleanly; this avoids a race where a
          // pending time-left tick could trigger onLose after a win is
          // detected.
          if (musicRef.current) {
            try { musicRef.current.pause(); } catch (e) {}
          }
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          // call onWin immediately (no extra timeout) to avoid races
          onWin();
          return;
        }
      } else {
        matchSinceRef.current = null;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [amp, phase, isWin, onWin]);

  // render SVG wave path
  const renderPath = (a: number, ph: number) => {
    const w = 360, h = 180;
    const samples = 200;
    const points: string[] = [];
    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * w;
      const t = (i / samples) * Math.PI * 2;
      const y = h / 2 - (a * Math.sin(t + ph)) * (h / 3);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative" style={{ width: '100%', maxWidth: 430, aspectRatio: '9/16', background: '#071018' }}>
        <div className="absolute top-3 left-3 text-pink-200">Süre: {timeLeft}s</div>

        <div className="absolute left-1/2 transform -translate-x-1/2 top-12">
          <svg width={360} height={180} viewBox={`0 0 360 180`}>
            <rect width={360} height={180} fill="#061018" />
            <g stroke="#3aa0ff" strokeWidth={2} fill="none">
              <path d={renderPath(1, 0)} />
            </g>
            <g stroke="#ff66b2" strokeWidth={2} fill="none" style={{ filter: isWin ? 'drop-shadow(0 0 8px #ff9999)' : undefined }}>
              <path d={renderPath(amp, phase)} />
            </g>
          </svg>
        </div>

        <div className="absolute left-6 right-6 bottom-20 flex flex-col gap-3">
          <div className="text-pink-200">Genlik</div>
          <input type="range" min="0" max="2" step="0.01" value={amp} onChange={e => setAmp(Number(e.target.value))} />
          <div className="text-pink-200">Faz</div>
          <input type="range" min="-6.28" max="6.28" step="0.01" value={phase} onChange={e => setPhase(Number(e.target.value))} />
        </div>
      </div>
    </div>
  );
};

export default FrequencySync;
