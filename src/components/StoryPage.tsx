import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface StoryPageProps {
  videoSrc: string;
  dialogue: string | string[];
  onNext: () => void;
  pageNumber: number;
}

export default function StoryPage({ videoSrc, dialogue, onNext, pageNumber }: StoryPageProps) {
  const [partIndex, setPartIndex] = useState(0);
  const [password, setPassword] = useState('');
  const [showIyikiImage, setShowIyikiImage] = useState(false);
  const [pwError, setPwError] = useState('');

  // Reset pagination when the page changes
  useEffect(() => {
    setPartIndex(0);
  }, [pageNumber]);

  const dialogueParts = Array.isArray(dialogue) ? dialogue : [dialogue];

  const handleClick = () => {
    // If we're on scene 6 and the password input is being shown (last
    // dialogue part), prevent clicks outside the input from advancing the
    // dialogue or closing the panel.
    if (pageNumber === 6 && partIndex === dialogueParts.length - 1 && !showIyikiImage) {
      return;
    }

    if (partIndex < dialogueParts.length - 1) {
      setPartIndex(partIndex + 1);
    } else {
      onNext();
    }
  };

  const handlePwSubmit = () => {
    const raw = (password || '').trim();
    // Simpler normalization: replace Turkish dotted/dotless variants to 'I',
    // uppercase, and strip non-letters. Avoid using Unicode property escapes
    // which may not be supported in some runtimes.
    let s = raw.replace(/İ/g, 'I').replace(/ı/g, 'I').replace(/i/g, 'I').replace(/I/g, 'I');
    s = s.toUpperCase();
    s = s.replace(/[^A-Z]/g, '');
    if (s === 'IYIKI') {
      setPwError('');
      // small timeout to ensure any focus/click handlers finish before
      // showing the overlay; also play a confirmation sound for effect.
      setTimeout(() => {
        try {
          const a = new Audio('/audio/tamam.mp3');
          a.volume = 0.9;
          a.play().catch(() => {});
        } catch (e) {}
        setShowIyikiImage(true);
      }, 60);
    } else {
      setPwError('Yanlış şifre — tekrar deneyin');
      setTimeout(() => setPwError(''), 2200);
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* When password prompt is active on scene 6, render a click-capturing
          overlay that prevents any clicks from reaching the parent handler.
          This ensures clicks outside the input won't advance or restart the
          story. */}
      {pageNumber === 6 && partIndex === dialogueParts.length - 1 && !showIyikiImage && (
        // overlay sits underneath the dialogue panel (which has z-10)
        // so the input remains clickable while clicks outside the panel
        // are intercepted here.
        <div className="absolute inset-0 z-0" onClick={(e) => e.stopPropagation()} />
      )}
      {showIyikiImage && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0 bg-black/90" />
          <motion.div className="relative flex items-center justify-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
            <div className="relative" style={{ width: '100%', maxWidth: 430, aspectRatio: '9/16' }}>
              <motion.img src="/iyiki_varsin.png" alt="İYİKİ" className="object-contain w-full h-full" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} />

              <div className="absolute left-1/2 bottom-6 transform -translate-x-1/2 w-[86%]">
                <div className="pixel-border bg-purple-900/95 p-3 text-center text-pink-100 text-sm">
                  SEVGİLİLER GÜNÜMÜZ KUTLU OLSUN, CANIM!
                </div>
              </div>

              <button onClick={() => setShowIyikiImage(false)} className="absolute left-1/2 top-[70%] transform -translate-x-1/2 w-40 h-12 bg-pink-400 text-purple-900 font-bold rounded">Tamam</button>
            </div>
          </motion.div>
        </div>
      )}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 flex-1" />

      <motion.div
        className="relative z-10 p-6 pb-8"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="pixel-border bg-purple-900/95 backdrop-blur-sm p-6 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-2 h-2 bg-pink-400 mt-2 animate-pulse" />

            <div className="text-pink-100 text-xs md:text-sm leading-relaxed flex-1">
              <p>{dialogueParts[partIndex]}</p>

              {pageNumber === 6 && partIndex === dialogueParts.length - 1 && (
                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <div className="text-sm text-pink-200 mb-2">Şifre:</div>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="şifre girin"
                    className="w-full p-2 rounded bg-black/30 text-pink-100"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handlePwSubmit(); } }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  {pwError && <div className="text-red-400 text-sm mt-2">{pwError}</div>}
                  <div className="mt-3">
                    <button onClick={(e) => { e.stopPropagation(); handlePwSubmit(); }} className="px-4 py-2 bg-pink-400 text-purple-900 rounded font-bold">Gönder</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-pink-500/30">
            <div className="text-pink-400 text-xs">
              SAHNE {pageNumber}/6
            </div>

            <motion.div
              className="flex items-center gap-2 text-pink-300 text-xs"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {partIndex < dialogueParts.length - 1 ? 'Devam Et' : 'Peki ya sonra?'}
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// (No module-scope helpers required)
