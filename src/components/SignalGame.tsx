import { useEffect, useRef, useState } from 'react';

interface SignalGameProps {
  onWin: () => void;
  onLose: () => void;
}

type ItemType =
  | 'heart'
  | 'message'
  | 'wifi'
  | 'broken'
  | 'low_battery'
  | 'red_x';

type Item = { id: number; x: number; y: number; type: ItemType };

export default function SignalGame({ onWin, onLose }: SignalGameProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [bucketX, setBucketX] = useState(50); // percent
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [message, setMessage] = useState<string | null>(null);
  const nextId = useRef(1);
  const spawnRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // spawn items
    spawnRef.current = window.setInterval(() => {
      setItems(prev => {
        const id = nextId.current++;
        const x = Math.random() * 92 + 4;
        // weighted types: hearts/messages/wifi more common
        const rnd = Math.random();
        let type: ItemType;
        if (rnd < 0.35) type = 'heart';
        else if (rnd < 0.65) type = 'message';
        else if (rnd < 0.85) type = 'wifi';
        else if (rnd < 0.92) type = 'broken';
        else if (rnd < 0.98) type = 'low_battery';
        else type = 'red_x';

        return [...prev, { id, x, y: 0, type }];
      });
    }, 900);

    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(50, t - last);
      last = t;

      setItems(prev => {
        const speed = 0.02 * (dt / 16);
        const next = prev
          .map(it => ({ ...it, y: it.y + speed * 100 }))
          .filter(it => it.y < 115);
        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // pointer move control
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!areaRef.current) return;
      const rect = areaRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setBucketX(Math.max(0, Math.min(92, x)));
    };

    const area = areaRef.current;
    if (area) {
      area.addEventListener('pointermove', onPointer);
      area.addEventListener('pointerdown', onPointer);
    }
    return () => {
      if (area) {
        area.removeEventListener('pointermove', onPointer);
        area.removeEventListener('pointerdown', onPointer);
      }
    };
  }, []);

  // collision detection
  useEffect(() => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const bucketWidth = 18; // percent
    const bucketLeft = (bucketX / 100) * rect.width;
    const bucketRight = ((bucketX + bucketWidth) / 100) * rect.width;
    const bucketTop = rect.height * 0.78;

    setItems(prev => {
      const remaining: Item[] = [];
      prev.forEach(it => {
        const itemX = (it.x / 100) * rect.width;
        const itemY = (it.y / 100) * rect.height;

        if (itemY >= bucketTop) {
          if (itemX >= bucketLeft - 28 && itemX <= bucketRight + 28) {
            // caught
            if (it.type === 'heart') {
              setScore(s => s + 50);
              setMessage('Mükemmel Bağlantı!');
            } else if (it.type === 'message') {
              setScore(s => s + 30);
              setMessage('Mükemmel Bağlantı!');
            } else if (it.type === 'wifi') {
              setScore(s => s + 20);
              setMessage('Mükemmel Bağlantı!');
            } else {
              // negative
              setLives(l => {
                const next = l - 1;
                return next;
              });
            }

            // clear temporary message after 700ms
            if (message === null) {
              setTimeout(() => setMessage(null), 700);
            } else {
              setTimeout(() => setMessage(null), 700);
            }

            return;
          }
        }

        remaining.push(it);
      });

      return remaining;
    });
  }, [items, bucketX]);

  useEffect(() => {
    if (score >= 500) {
      setTimeout(() => onWin(), 400);
    }
  }, [score, onWin]);

  useEffect(() => {
    if (lives <= 0) {
      setTimeout(() => onLose(), 300);
    }
  }, [lives, onLose]);

  return (
    <div className="fixed inset-0 z-60 bg-black flex items-center justify-center">
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div ref={areaRef} className="relative w-[360px] h-[640px] bg-[#07020b] rounded-md overflow-hidden pixel-border">

          {/* Score & Lives */}
          <div className="absolute top-3 left-3 text-pink-200">
            Puan: <span className="font-bold">{score}</span>
          </div>
          <div className="absolute top-3 right-3 text-pink-200">
            Can: <span className="font-bold">{lives}</span>
          </div>

          {/* falling items */}
          {items.map(it => (
            <div key={it.id} style={{ position: 'absolute', left: `${it.x}%`, top: `${it.y}%`, transform: 'translate(-50%, -50%)' }}>
              <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: getBg(it.type), color: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                  {getIcon(it.type)}
                </div>
              </div>
            </div>
          ))}

          {/* bucket */}
          <div style={{ position: 'absolute', bottom: 6, left: `calc(${bucketX}% )`, transform: 'translateX(-50%)', width: 90, height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ width: 90, height: 40, background: '#2b1133', borderRadius: 8, border: '2px solid #f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: '#fda4af', fontWeight: 700 }}>▮▮▮</div>
            </div>
          </div>

          {/* message popup */}
          {message && (
            <div className="absolute left-1/2 top-28 transform -translate-x-1/2 bg-black/60 px-4 py-2 rounded-md text-pink-200">{message}</div>
          )}

        </div>
      </div>
    </div>
  );
}

function getIcon(type: ItemType) {
  if (type === 'heart') return '❤';
  if (type === 'message') return '💬';
  if (type === 'wifi') return '📶';
  if (type === 'broken') return '💔';
  if (type === 'low_battery') return '🔋';
  return '✖';
}

function getBg(type: ItemType) {
  if (type === 'heart') return '#ef4444';
  if (type === 'message') return '#06b6d4';
  if (type === 'wifi') return '#fb923c';
  if (type === 'broken') return '#7f1d1d';
  if (type === 'low_battery') return '#854d0e';
  return '#7f1d1d';
}
