import { useEffect, useRef, useState } from 'react';

interface CoffeeGameProps {
  onWin: () => void;
  onLose: () => void;
}

type Item = { id: number; x: number; y: number; type: 'coffee' | 'book' };

export default function CoffeeGame({ onWin, onLose }: CoffeeGameProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [charX, setCharX] = useState(50); // percent (0..100)
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [bookHits, setBookHits] = useState(0);
  const [croppedSrc, setCroppedSrc] = useState<string>('/yaren_karakter.png');
  const nextId = useRef(1);
  const animRef = useRef<number | null>(null);
  const spawnRef = useRef<number | null>(null);

  useEffect(() => {
    // prefer the provided public asset; if missing the <img> onError will fall back to svg
    setCroppedSrc('/yaren_karakter.png');

    // spawn items regularly
    spawnRef.current = window.setInterval(() => {
      setItems(prev => {
        const id = nextId.current++;
        const x = Math.random() * 90 + 5; // percent
        // make game easier: more coffees, fewer books
        const type = Math.random() < 0.85 ? 'coffee' : 'book';
        return [...prev, { id, x, y: 0, type }];
      });
    }, 1300);

    let last = performance.now();

    const loop = (t: number) => {
      const dt = Math.min(50, t - last);
      last = t;

      setItems(prev => {
        // further reduce falling speed to make game comfortably easy
        const speed = 0.015 * (dt / 16); // percent per frame approx
        const next = prev
          .map(it => ({ ...it, y: it.y + speed * 100 }))
          .filter(it => it.y < 110);

        return next;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Collision detection
  useEffect(() => {
    if (!areaRef.current) return;

    const areaRect = areaRef.current.getBoundingClientRect();
    const charWidth = 18; // percent (increased character width for easier catching)
    const charLeft = (charX / 100) * areaRect.width;
    const charRight = ((charX + charWidth) / 100) * areaRect.width;
    const charTop = areaRect.height * 0.78; // y position where character stands

    setItems(prev => {
      const remaining: Item[] = [];
      prev.forEach(it => {
        const itemX = (it.x / 100) * areaRect.width;
        const itemY = (it.y / 100) * areaRect.height;

        // simple collision: if itemY below threshold and x within char bounds
        if (itemY >= charTop) {
          if (itemX >= charLeft - 28 && itemX <= charRight + 28) {
            if (it.type === 'coffee') {
              setScore(s => Math.min(200, s + 10));
            } else {
              setScore(s => s - 20);
              setBookHits(b => b + 1);
            }
            return; // consumed
          }
        }

        // keep
        remaining.push(it);
      });

      return remaining;
    });
  }, [items, charX]);

  useEffect(() => {
    if (score >= 100) {
      // win
      // small delay so player sees final score
      setTimeout(() => onWin(), 400);
    }
  }, [score, onWin]);

  useEffect(() => {
    if (bookHits >= 3) {
      setTimeout(() => onLose(), 200);
    }
  }, [bookHits, onLose]);

  // keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setCharX(x => Math.max(0, x - 6));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setCharX(x => Math.min(82, x + 6));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-60 bg-black flex items-center justify-center">
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* 9:16 centered game frame */}
        <div
          ref={areaRef}
          className="relative bg-black w-[360px] h-[640px] rounded-md overflow-hidden pixel-border"
          style={{ width: '360px', height: '640px', background: '#000' }}
        >
        {/* Score */}
        <div className="absolute top-3 left-3 flex gap-3">
          <div className="px-3 py-1 bg-purple-900/95 text-pink-200 rounded-xl shadow-lg border-2 border-pink-600/20">Puan: <span className="font-bold">{score}</span></div>
          <div className="px-3 py-1 bg-purple-900/95 text-pink-200 rounded-xl shadow-lg border-2 border-pink-600/20">Kitap: <span className="font-bold">{bookHits}/3</span></div>
        </div>

        {/* falling items */}
        {items.map(it => (
          <div
            key={it.id}
            style={{
              position: 'absolute',
              left: `${it.x}%`,
              top: `${it.y}%`,
              transform: 'translate(-50%, -50%)',
              width: 32,
              height: 32,
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: it.type === 'coffee' ? '#f97316' : '#0ea5a4',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
              }}
            >
              {it.type === 'coffee' ? '☕' : '📚'}
            </div>
          </div>
        ))}

        {/* character image (use provided yaren_karakter.png from public/) */}
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: `calc(${charX}% )`,
              transform: 'translateX(-50%)',
              width: 80,
              height: 120,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center'
            }}
          >
          <img
            src={croppedSrc || '/yaren_karakter.png'}
            alt="Yaren"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.src.includes('yaren_karakter.png')) {
                img.src = '/yaren_karakter.svg';
                setCroppedSrc('/yaren_karakter.svg');
              }
            }}
            style={{ width: '80px', height: '120px', objectFit: 'contain', pointerEvents: 'none' }}
          />
        </div>

        {/* simple controls */}
        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button
            onClick={() => setCharX(x => Math.max(0, x - 10))}
            aria-label="Sola"
            className="w-14 h-14 rounded-full bg-purple-800 text-pink-200 flex items-center justify-center shadow-2xl border-2 border-pink-600/20"
          >
            <span style={{ fontSize: 20 }}>◀</span>
          </button>

          <button
            onClick={() => setCharX(x => Math.min(82, x + 10))}
            aria-label="Sağa"
            className="w-14 h-14 rounded-full bg-purple-800 text-pink-200 flex items-center justify-center shadow-2xl border-2 border-pink-600/20"
          >
            <span style={{ fontSize: 20 }}>▶</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
