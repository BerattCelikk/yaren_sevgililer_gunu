import { useEffect, useRef, useState } from 'react';

interface OrderUpProps {
  onWin: () => void;
  onLose: () => void;
}

type ItemType = 'pizza' | 'coffee' | 'pastry' | 'burnt' | 'broccoli' | 'broken_plate';
type Item = { id: number; x: number; y: number; type: ItemType };

export default function OrderUp({ onWin, onLose }: OrderUpProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [trayX, setTrayX] = useState(50);
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const nextId = useRef(1);
  const spawnRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // spawn items frequently
    spawnRef.current = window.setInterval(() => {
      setItems(prev => {
        const id = nextId.current++;
        const x = Math.random() * 92 + 4;
        const r = Math.random();
        let type: ItemType = 'pizza';
        if (r < 0.45) type = 'pizza';
        else if (r < 0.72) type = 'coffee';
        else if (r < 0.9) type = 'pastry';
        else if (r < 0.94) type = 'burnt';
        else if (r < 0.98) type = 'broccoli';
        else type = 'broken_plate';
        return [...prev, { id, x, y: 0, type }];
      });
    }, 600);

    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(50, t - last);
      last = t;
      setItems(prev => prev.map(it => ({ ...it, y: it.y + 0.02 * (dt / 16) * 100 })).filter(it => it.y < 120));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // pointer control
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (!areaRef.current) return;
      const rect = areaRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setTrayX(Math.max(6, Math.min(94, x)));
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
    const trayWidth = 20; // percent
    const trayLeft = (trayX / 100) * rect.width;
    const trayRight = ((trayX + trayWidth) / 100) * rect.width;
    const trayTop = rect.height * 0.78;

    setItems(prev => {
      const remaining: Item[] = [];
      prev.forEach(it => {
        const itemX = (it.x / 100) * rect.width;
        const itemY = (it.y / 100) * rect.height;
        if (itemY >= trayTop) {
          if (itemX >= trayLeft - 28 && itemX <= trayRight + 28) {
            // caught
            if (it.type === 'pizza' || it.type === 'coffee' || it.type === 'pastry') {
              setScore(s => s + 10);
            } else {
              setLives(l => Math.max(0, l - 1));
            }
            return; // consumed
          }
        }
        remaining.push(it);
      });
      return remaining;
    });
  }, [items, trayX]);

  // timer and win/lose checks
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          onLose();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onLose]);

  useEffect(() => {
    if (score >= 150) {
      setTimeout(() => onWin(), 300);
    }
  }, [score, onWin]);

  useEffect(() => {
    if (lives <= 0) {
      // stop spawning and animation so player can see 0 life
      if (spawnRef.current) {
        clearInterval(spawnRef.current);
        spawnRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // allow a short delay so UI updates to show 0 before signalling loss
      const t = setTimeout(() => onLose(), 700);
      return () => clearTimeout(t);
    }
  }, [lives, onLose]);

  return (
    <div className="fixed inset-0 z-60 bg-black flex items-center justify-center">
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div ref={areaRef} className="relative w-[360px] h-[640px] bg-[#221722] rounded-md overflow-hidden pixel-border">
          <div className="absolute top-3 left-3 text-pink-200">Puan: <span className="font-bold">{score}</span></div>
          <div className="absolute top-3 right-3 text-pink-200">Can: <span className="font-bold">{lives}</span></div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-sm text-pink-200">Süre: {timeLeft}s</div>

          {/* falling items */}
          {items.map(it => (
            <div key={it.id} style={{ position: 'absolute', left: `${it.x}%`, top: `${it.y}%`, transform: 'translate(-50%, -50%)' }}>
              <div style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: getBg(it.type), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getIcon(it.type)}</div>
              </div>
            </div>
          ))}

          {/* tray */}
          <div style={{ position: 'absolute', bottom: 8, left: `calc(${trayX}% )`, transform: 'translateX(-50%)', width: 120, height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ width: 120, height: 38, background: '#4b2b1f', borderRadius: 8, border: '2px solid #f3d9b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: '#f3d9b6', fontWeight: 700 }}>Tepsi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getIcon(type: ItemType) {
  if (type === 'pizza') return '🍕';
  if (type === 'coffee') return '☕';
  if (type === 'pastry') return '🥐';
  if (type === 'burnt') return '🔥';
  if (type === 'broccoli') return '🥦';
  return '🍽';
}

function getBg(type: ItemType) {
  if (type === 'pizza') return '#f97316';
  if (type === 'coffee') return '#92400e';
  if (type === 'pastry') return '#f59e0b';
  if (type === 'burnt') return '#4b1f1f';
  if (type === 'broccoli') return '#166534';
  return '#7f1d1d';
}
