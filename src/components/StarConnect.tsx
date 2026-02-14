import { useEffect, useRef, useState } from 'react';

interface StarConnectProps {
  onWin: () => void;
  onLose: () => void;
}

type Star = { id: number; x: number; y: number };

const defaultPositions: Star[] = [
  { id: 1, x: 20, y: 18 },
  { id: 2, x: 70, y: 14 },
  { id: 3, x: 40, y: 26 },
  { id: 4, x: 80, y: 32 },
  { id: 5, x: 18, y: 40 },
  { id: 6, x: 58, y: 44 },
  { id: 7, x: 30, y: 56 },
  { id: 8, x: 74, y: 60 },
  { id: 9, x: 44, y: 72 },
  { id: 10, x: 60, y: 82 }
];

export default function StarConnect({ onWin, onLose }: StarConnectProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  // shuffle initial positions for variety and difficulty
  const [stars, setStars] = useState<Star[]>(() => shuffle(defaultPositions.slice()));
  const [nextId, setNextId] = useState(1);
  const [lines, setLines] = useState<Array<[number, number]>>([]);
  // reduce time to make game harder
  const [timeLeft, setTimeLeft] = useState(12);
  const timerRef = useRef<number | null>(null);
  const jitterRef = useRef<number | null>(null);
  const [showNumbers, setShowNumbers] = useState(true);

  useEffect(() => {
    // countdown
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onLose();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // slightly move stars every 700ms to increase difficulty
    jitterRef.current = window.setInterval(() => {
      setStars(prev => prev.map(s => ({
        ...s,
        x: clamp(s.x + (Math.random() - 0.5) * 6, 6, 94),
        y: clamp(s.y + (Math.random() - 0.5) * 4, 8, 92)
      })));
    }, 700);

    // hide numbers shortly after start to make memorization harder
    const numTimeout = window.setTimeout(() => setShowNumbers(false), 1500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (jitterRef.current) clearInterval(jitterRef.current);
      clearTimeout(numTimeout);
    };
  }, [onLose]);

  // reset helper (unused by parent; kept for potential reuse)
  // removed to avoid unused-variable TS warning

  const handleStarClick = (id: number) => {
    if (id !== nextId) {
      // wrong star
      // small visual feedback handled by parent via onLose
      onLose();
      return;
    }

    // connect
    if (nextId > 1) {
      setLines(l => [...l, [nextId - 1, nextId]]);
    }

    if (nextId >= 10) {
      // success
      if (timerRef.current) clearInterval(timerRef.current);
      // brief delay to show last line
      setTimeout(() => onWin(), 300);
      return;
    }

    setNextId(n => n + 1);
  };

  // Draw connecting lines as absolute positioned SVG overlay
  const renderLines = () => {
    if (!areaRef.current) return null;
    const rect = areaRef.current.getBoundingClientRect();
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {lines.map((ln, i) => {
          const a = stars.find(s => s.id === ln[0])!;
          const b = stars.find(s => s.id === ln[1])!;
          const x1 = (a.x / 100) * rect.width;
          const y1 = (a.y / 100) * rect.height;
          const x2 = (b.x / 100) * rect.width;
          const y2 = (b.y / 100) * rect.height;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff6bcb" strokeWidth={3} strokeLinecap="round" />;
        })}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-60 bg-black flex items-center justify-center">
      <div className="w-full h-full bg-[#041227] flex items-center justify-center">
        <div ref={areaRef} className="relative w-[360px] h-[640px] rounded-md overflow-hidden pixel-border">
          {/* timer */}
          <div className="absolute top-3 left-3 text-pink-200">Süre: <span className="font-bold">{timeLeft}s</span></div>

          {/* stars */}
          {stars.map(s => (
            <button
              key={s.id}
              onClick={() => handleStarClick(s.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${s.id < nextId ? 'bg-pink-400' : 'bg-white/90'}`}
              style={{ left: `${s.x}%`, top: `${s.y}%`, boxShadow: '0 4px 12px rgba(0,0,0,0.6)', transition: 'left 300ms linear, top 300ms linear' }}
              aria-label={`Yıldız ${s.id}`}
            >
              {showNumbers ? s.id : ''}
            </button>
          ))}

          {/* lines overlay */}
          {renderLines()}
        </div>
      </div>
    </div>
  );
}

// Helpers
function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

