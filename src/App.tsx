import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MobileLayout from './components/MobileLayout';
import LandingPage from './components/LandingPage';
import StoryPage from './components/StoryPage';
import AudioPlayer from './components/AudioPlayer';
import CoffeeGame from './components/CoffeeGame';
import BalanceGame from './components/BalanceGame';
import StarConnect from './components/StarConnect';
import OrderUp from './components/OrderUp';
import FrequencySync from './components/FrequencySync';
import { storyScenes } from './data/storyData';

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMiniGameActive, setIsMiniGameActive] = useState(false);
  const [showMiniTransition, setShowMiniTransition] = useState(false);
  const [showFlashY, setShowFlashY] = useState(false);
  const [isBalanceGameActive, setIsBalanceGameActive] = useState(false);
  const [showBalanceTransition, setShowBalanceTransition] = useState(false);
  const [, setBalanceFailCount] = useState(0);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [showBalanceReward, setShowBalanceReward] = useState(false);

  // StarConnect (mini-game 3) states
  const [isStarGameActive, setIsStarGameActive] = useState(false);
  const [showStarTransition, setShowStarTransition] = useState(false);
  const [showStarTryAgain, setShowStarTryAgain] = useState(false);
  const [showStarReward, setShowStarReward] = useState(false);


  const handleStart = () => {
    setIsAudioPlaying(true);
    setCurrentPage(1);
  };

  const handleNext = () => {
    // After scene 1 final next, start the mini-game transition instead of going to scene 2
    if (currentPage === 1 && !isMiniGameActive && !showMiniTransition) {
      setShowMiniTransition(true);
      // wait for transition animation, then show game
      setTimeout(() => {
        setShowMiniTransition(false);
        setIsMiniGameActive(true);
      }, 600);
      return;
    }

    // After scene 2 final next, start Balance (Dengeyi Koru) mini-game instead of going to scene 3
    if (currentPage === 2 && !isBalanceGameActive && !showBalanceTransition) {
      // immediately reset counters so the game can't trigger TryAgain from old state
      setBalanceFailCount(0);
      setShowTryAgain(false);
      setShowBalanceTransition(true);
      setTimeout(() => {
        setShowBalanceTransition(false);
        setIsBalanceGameActive(true);
      }, 600);
      return;
    }

    // After scene 3 final next, start StarConnect mini-game instead of going to scene 4
    if (currentPage === 3 && !isStarGameActive && !showStarTransition) {
      setShowStarTransition(true);
      setTimeout(() => {
        setShowStarTransition(false);
        setIsStarGameActive(true);
      }, 600);
      return;
    }

    // After scene 4 final next, start OrderUp mini-game instead of going to scene 5
    if (currentPage === 4 && !isOrderGameActive && !showOrderTransition) {
      setShowOrderTransition(true);
      setTimeout(() => {
        setShowOrderTransition(false);
        setIsOrderGameActive(true);
      }, 600);
      return;
    }
    
    // After scene 5 final next, start FrequencySync mini-game instead of going to scene 6
    if (currentPage === 5 && !isFreqActive && !showFreqTransition) {
      setShowFreqTransition(true);
      setTimeout(() => {
        setShowFreqTransition(false);
        setIsFreqActive(true);
      }, 600);
      return;
    }
    

    if (currentPage < storyScenes.length) {
      setCurrentPage(currentPage + 1);
    } else {
      setCurrentPage(0);
      setIsAudioPlaying(false);
    }
  };

  const handleGameWin = () => {
    // hide game and show the reveal; advance only after user confirms
    setIsMiniGameActive(false);
    setShowFlashY(true);
  };

  const handleGameLose = () => {
    // immediate sharp reset to start
    setIsMiniGameActive(false);
    setCurrentPage(0);
    setIsAudioPlaying(false);
  };

  const handleConfirmSuccess = () => {
    playTamam();
    setShowFlashY(false);
    // advance to scene 2 after user confirms
    setCurrentPage(2);
  };

  // Balance game handlers
  const handleBalanceWin = () => {
    setIsBalanceGameActive(false);
    setShowBalanceReward(true);
  };

  const handleBalanceFail = () => {
    // increment count and check new value reliably; if reaches 3, pause game and show Try Again
    setBalanceFailCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setIsBalanceGameActive(false);
        setShowTryAgain(true);
      }
      return next;
    });
  };

  const handleTryAgain = () => {
    // reset and restart balance game
    setBalanceFailCount(0);
    setShowTryAgain(false);
    setIsBalanceGameActive(true);
  };

  const handleConfirmBalanceReward = () => {
    playTamam();
    setShowBalanceReward(false);
    setCurrentPage(3);
  };

  // StarConnect handlers
  const handleStarWin = () => {
    setIsStarGameActive(false);
    setShowStarReward(true);
  };

  const handleStarLose = () => {
    setIsStarGameActive(false);
    setShowStarTryAgain(true);
  };

  const handleStarTryAgain = () => {
    setShowStarTryAgain(false);
    setIsStarGameActive(true);
  };

  const handleConfirmStarReward = () => {
    playTamam();
    setShowStarReward(false);
    setCurrentPage(prev => Math.min(prev + 1, storyScenes.length));
  };

  // OrderUp (mini-game 4) states & handlers
  const [isOrderGameActive, setIsOrderGameActive] = useState(false);
  const [showOrderTransition, setShowOrderTransition] = useState(false);
  const [showOrderTryAgain, setShowOrderTryAgain] = useState(false);
  const [showOrderReward, setShowOrderReward] = useState(false);

  const handleOrderWin = () => {
    setIsOrderGameActive(false);
    setShowOrderReward(true);
  };

  const handleOrderLose = () => {
    setIsOrderGameActive(false);
    setShowOrderTryAgain(true);
  };

  const handleOrderTryAgain = () => {
    setShowOrderTryAgain(false);
    setIsOrderGameActive(true);
  };

  const handleConfirmOrderReward = () => {
    setShowOrderReward(false);
    // When confirming the order/minigame reward, go to scene 5.
    // Setting to 5 ensures the 'Tamam' under the K advances to scene 5.
    setCurrentPage(5);
  };

  // Finale stages after mini-game 4
  const [showStage1, setShowStage1] = useState(false); // 'İ' popup
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);
  const [passwordVal, setPasswordVal] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showGrandFinale, setShowGrandFinale] = useState(false);
  const [showEpilogue, setShowEpilogue] = useState(false);
  const finalAudioRef = useRef<HTMLAudioElement | null>(null);
  const particlesRef = useRef<HTMLCanvasElement | null>(null);
  const tamaAudioRef = useRef<HTMLAudioElement | null>(null);

  const playTamam = () => {
    try {
      if (!tamaAudioRef.current) {
        tamaAudioRef.current = new Audio('/audio/tamam.mp3');
        tamaAudioRef.current.volume = 0.9;
      }
      tamaAudioRef.current.currentTime = 0;
      tamaAudioRef.current.play().catch(() => {});
    } catch (e) {}
  };

  // particle system for grand finale
  useEffect(() => {
    let raf = 0;
    let ctx: CanvasRenderingContext2D | null = null;
    const canvas = particlesRef.current;
    if (!showGrandFinale || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      canvas.style.width = canvas.clientWidth + 'px';
      canvas.style.height = canvas.clientHeight + 'px';
      ctx && ctx.scale(dpr, dpr);
    };

    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#ff3b8a', '#ffd84b', '#7ae7ff', '#9b7aff', '#f59e0b'];
    const particles: Array<any> = [];

    const spawn = () => {
      const count = 8 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.clientWidth,
          y: -10,
          vx: (Math.random() - 0.5) * 2,
          vy: 1 + Math.random() * 3,
          size: 2 + Math.random() * 5,
          life: 60 + Math.random() * 60,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    let ticks = 0;
    const loop = () => {
      ticks++;
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      if (ticks % 8 === 0) spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.life -= 1;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        if (p.y > canvas.clientHeight + 20 || p.life <= 0) particles.splice(i, 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => { window.removeEventListener('resize', resize); if (raf) cancelAnimationFrame(raf); };
  }, [showGrandFinale]);

  const handleStage1Confirm = () => {
    playTamam();
    setShowStage1(false);
    setShowPasswordPanel(true);
  };

  const handlePasswordSubmit = (val?: string) => {
    const v = (val ?? passwordVal).trim();
    if (v === 'İYİKİ') {
      setPasswordError('');
      setShowPasswordPanel(false);
      // start grand finale
      setShowGrandFinale(true);
      // play final music
      setTimeout(() => {
        if (!finalAudioRef.current) {
          finalAudioRef.current = new Audio('/audio/final-8bit.mp3');
          finalAudioRef.current.loop = false;
          finalAudioRef.current.volume = 0.9;
        }
        finalAudioRef.current.play().catch(() => {});
      }, 80);
      // schedule epilogue after 10s
      setTimeout(() => setShowEpilogue(true), 10000);
    } else {
      setPasswordError('Tekrar dene, ipuçlarını hatırla!');
      // shake handled via CSS class on the panel
      setTimeout(() => setPasswordError(''), 2200);
    }
  };

  const handleReplay = () => {
    // stop audio and particles
    if (finalAudioRef.current) {
      try { finalAudioRef.current.pause(); finalAudioRef.current.currentTime = 0; } catch (e) {}
    }
    setShowEpilogue(false);
    setShowGrandFinale(false);
    // go back to scene 1 (start)
    setCurrentPage(1);
    setIsAudioPlaying(true);
  };

  // FrequencySync (mini-game 5) states & handlers
  const [isFreqActive, setIsFreqActive] = useState(false);
  const [showFreqTransition, setShowFreqTransition] = useState(false);
  const [showFreqTryAgain, setShowFreqTryAgain] = useState(false);
  const [showFreqReward, setShowFreqReward] = useState(false);
  const [showFinalTransition] = useState(false);

  const handleFreqWin = () => {
    setIsFreqActive(false);
    // show the Frequency reward image (mini_games_5.png) when frequencies
    // are correctly matched.
    setShowFreqReward(true);
  };

  const handleFreqLose = () => {
    setIsFreqActive(false);
    setShowFreqTryAgain(true);
  };

  const handleFreqTryAgain = () => {
    setShowFreqTryAgain(false);
    setIsFreqActive(true);
  };

  const handleConfirmFreqReward = () => {
    // play the confirm sound and advance to scene 6 directly when the
    // user presses Tamam on mini_games_5.png
    playTamam();
    setShowFreqReward(false);
    setCurrentPage(6);
  };

  

  const getCurrentBackground = () => {
    // if any mini-game or overlay is active, hide background so only mini-game UI shows
    if (isMiniGameActive || isBalanceGameActive || isStarGameActive || isOrderGameActive || isFreqActive || showFlashY || showBalanceReward || showTryAgain || showMiniTransition || showBalanceTransition || showStarTransition || showStarTryAgain || showStarReward || showOrderTransition || showOrderTryAgain || showOrderReward || showFreqTransition || showFreqTryAgain || showFreqReward || showFinalTransition) {
      return undefined;
    }

    if (currentPage === 0) {
      return '/anasayfa.png';
    }
    const scene = storyScenes[currentPage - 1];
    return scene?.videoSrc.replace('.mp4', '-poster.jpg') || undefined;
  };

  return (
    <MobileLayout backgroundImage={getCurrentBackground()}>
      <style>{`
        @keyframes heartbeat { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .heartbeat { animation: heartbeat 1.2s ease-in-out infinite; }
        @keyframes finalFlash { 0% { opacity: 1; } 10% { opacity: 0; } 100% { opacity: 0; } }
        .animate-final-flash { animation: finalFlash 400ms ease-out forwards; }
        @keyframes fireworkPulse { 0% { opacity: 0; transform: scale(0.3); } 30% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0; transform: scale(0.6); } }
        .animate-firework { animation: fireworkPulse 1400ms ease-in-out infinite; }
      `}</style>
      <AudioPlayer
        audioSrc="/audio/background-music.mp3"
        isPlaying={isAudioPlaying}
      />

      <AnimatePresence mode="wait">
        {currentPage === 0 ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <LandingPage onStart={handleStart} />
          </motion.div>
        ) : (
          <motion.div
            key={`story-${currentPage}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <>
              {/* If any mini-game/overlay active, hide StoryPage completely so only the mini-game shows */}
              {!isMiniGameActive && !isBalanceGameActive && !isStarGameActive && !isOrderGameActive && !isFreqActive && !showFreqTransition && !showFreqTryAgain && !showFreqReward && !showFlashY && !showBalanceReward && !showTryAgain && !showMiniTransition && !showBalanceTransition && !showStarTransition && !showStarTryAgain && !showStarReward && !showOrderTransition && !showOrderTryAgain && !showOrderReward && (
                <StoryPage
                  videoSrc={storyScenes[currentPage - 1].videoSrc}
                  dialogue={storyScenes[currentPage - 1].dialogue}
                  onNext={handleNext}
                  pageNumber={currentPage}
                />
              )}

              {/* transition overlay when starting the mini game */}
              {showMiniTransition && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="text-pink-200 text-lg">Oyun başlatılıyor...</div>
                  </div>
                </motion.div>
              )}

              {/* show only mini game (itself is full-screen fixed) */}
              {isMiniGameActive && (
                <CoffeeGame onWin={handleGameWin} onLose={handleGameLose} />
              )}

              {/* Balance mini-game */}
              {isBalanceGameActive && (
                <BalanceGame onWin={handleBalanceWin} onFail={handleBalanceFail} />
              )}

              {/* transition overlay when starting the balance mini game */}
              {showBalanceTransition && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="text-pink-200 text-lg">Dengeyi Koru başlıyor...</div>
                  </div>
                </motion.div>
              )}

              {/* Try Again overlay when 3 consecutive fails */}
              {showTryAgain && (
                <div className="fixed inset-0 z-70 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/85" />
                  <div className="relative z-80">
                    <div className="pixel-border bg-purple-900/95 p-6 rounded-lg text-center">
                      <div className="text-2xl text-pink-200 font-bold mb-4">TEKRAR DENE</div>
                      <button onClick={handleTryAgain} className="px-6 py-2 bg-pink-400 text-purple-900 font-bold rounded-lg">Tekrar Dene</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Balance reward screen - show image centered in 9:16 box */}
              {showBalanceReward && (
                <motion.div className="fixed inset-0 z-90 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-black" />

                  <div className="z-20 relative flex items-center justify-center">
                    <div
                      className="relative"
                      style={{ width: '100%', maxWidth: '430px', aspectRatio: '9/16' }}
                    >
                      <img
                        src="/mini_games_2.png"
                        alt="Balance Reward"
                        className="object-contain w-full h-full"
                        style={{ pointerEvents: 'none' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const el = document.getElementById('balance-fallback');
                          if (el) el.style.display = 'block';
                        }}
                      />

                      <div id="balance-fallback" style={{ display: 'none' }} className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl text-pink-200">Tebrikler!</div>
                      </div>

                      <button
                        aria-label="Tamam balance"
                        onClick={handleConfirmBalanceReward}
                        className="absolute left-1/2 top-[64%] transform -translate-x-1/2 -translate-y-1/2 w-40 h-12 bg-transparent border-0 cursor-pointer z-30"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* StarConnect (Yıldızları Birleştir) transition overlay */}
              {showStarTransition && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center pixelated-transition"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-pink-200 text-lg">Yıldızları Birleştir başlatılıyor...</div>
                  </div>
                </motion.div>
              )}

              {/* StarConnect mini-game */}
              {isStarGameActive && (
                <StarConnect onWin={handleStarWin} onLose={handleStarLose} />
              )}

              {/* Star Try Again overlay */}
              {showStarTryAgain && (
                <div className="fixed inset-0 z-70 flex items-center justify-center animate-shake">
                  <div className="absolute inset-0 bg-black/85" />
                  <div className="relative z-80">
                    <div className="pixel-border bg-purple-900/95 p-6 rounded-lg text-center">
                      <div className="text-2xl text-pink-200 font-bold mb-4">Bağlantı Kurulamadı!</div>
                      <div className="text-pink-200 mb-4">Tekrar Dene</div>
                      <button onClick={handleStarTryAgain} className="px-6 py-2 bg-pink-400 text-purple-900 font-bold rounded-lg">TEKRAR DENE</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Star reward screen - mini_games_3 with İ */}
              {showStarReward && (
                <motion.div className="fixed inset-0 z-90 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-black" />

                  <div className="z-20 relative flex items-center justify-center">
                    <div className="relative" style={{ width: '100%', maxWidth: '430px', aspectRatio: '9/16' }}>
                      <img
                        src="/mini_games_3.png"
                        alt="Star Reward"
                        className="object-contain w-full h-full"
                        style={{ pointerEvents: 'none' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const el = document.getElementById('star-fallback');
                          if (el) el.style.display = 'block';
                        }}
                      />

                      <div id="star-fallback" style={{ display: 'none' }} className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl text-pink-200">Tebrikler!</div>
                      </div>

                      {/* Tamam butonu (görselin içindeki Tamam kısmını aktifleştirmek için görünmez overlay) */}
                      <button
                        aria-label="Tamam star"
                        onClick={handleConfirmStarReward}
                        className="absolute left-1/2 top-[56%] transform -translate-x-1/2 w-24 h-10 bg-transparent border-0 cursor-pointer z-30"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Order transition overlay */}
              {showOrderTransition && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center pixelated-transition"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-pink-200 text-lg">Siparişleri Yetiştir başlatılıyor...</div>
                  </div>
                </motion.div>
              )}

              {/* OrderUp mini-game */}
              {isOrderGameActive && (
                <OrderUp onWin={handleOrderWin} onLose={handleOrderLose} />
              )}

              {/* Order Try Again overlay */}
              {showOrderTryAgain && (
                <div className="fixed inset-0 z-70 flex items-center justify-center animate-shake">
                  <div className="absolute inset-0 bg-black/85" />
                  <div className="relative z-80">
                    <div className="pixel-border bg-purple-900/95 p-6 rounded-lg text-center">
                      <div className="text-2xl text-pink-200 font-bold mb-4">Siparişler Karıştı!</div>
                      <div className="text-pink-200 mb-4">Tekrar Dene</div>
                      <button onClick={handleOrderTryAgain} className="px-6 py-2 bg-pink-400 text-purple-900 font-bold rounded-lg">TEKRAR DENE</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order reward screen - mini_games_4 */}
              {showOrderReward && (
                <motion.div className="fixed inset-0 z-90 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-black" />
                  <div className="z-20 relative flex items-center justify-center">
                    <div className="relative" style={{ width: '100%', maxWidth: '430px', aspectRatio: '9/16' }}>
                      <img src="/mini_games_4.png" alt="Order Reward" className="object-contain w-full h-full" style={{ pointerEvents: 'none' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; const el = document.getElementById('order-fallback'); if (el) el.style.display = 'block'; }} />

                      <div id="order-fallback" style={{ display: 'none' }} className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl text-pink-200">Tebrikler!</div>
                      </div>

                      {/* Görselin içindeki 'Tamam' alanını aktifleştiriyoruz; büyük 'E' kaldırıldı */}
                      <button
                        aria-label="Tamam order"
                        onClick={handleConfirmOrderReward}
                        className="absolute left-1/2 top-[60%] transform -translate-x-1/2 -translate-y-1/2 w-28 h-10 bg-transparent border-0 cursor-pointer z-30"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Stage 1: İ popup over mini_games_5 background */}
              {showStage1 && (
                <div className="fixed inset-0 z-100 flex items-center justify-center">
                  <img src="/mini_games_5.png" alt="bg" className="absolute inset-0 w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="relative z-110 flex items-center justify-center">
                    <div className="pixel-border bg-black/80 p-6 rounded-lg text-center" style={{ width: 320 }}>
                      <div style={{ fontSize: 96, color: '#f6d84b', textShadow: '0 2px 0 #7a4d00', fontWeight: 900 }}>İ</div>
                      <button onClick={handleStage1Confirm} className="mt-4 px-6 py-2 bg-yellow-400 text-purple-900 font-bold rounded-lg">TAMAM</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 2: Password panel */}
              {showPasswordPanel && (
                <div className="fixed inset-0 z-110 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/90" />
                  <div className={`relative z-120 ${passwordError ? 'animate-shake' : ''}`}>
                    <div className="pixel-border bg-purple-900/95 p-6 rounded-lg text-center" style={{ width: 320 }}>
                      <div className="text-pink-200 font-bold mb-3">Tüm Harfleri Birleştir:</div>
                      <input maxLength={5} value={passwordVal} onChange={(e) => setPasswordVal(e.target.value.toUpperCase())} className="block mx-auto mb-3 text-center p-2 rounded" style={{ width: 200, background: passwordError ? '#3b0000' : '#1f0336', color: '#ffd9f0', border: passwordError ? '2px solid #ff4444' : '2px solid #5b2b86' }} />
                      <div className="mb-3 text-sm text-pink-300">5 karakter giriniz</div>
                      {passwordError && <div className="text-sm text-red-400 mb-2">{passwordError}</div>}
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => handlePasswordSubmit()} className="px-4 py-2 bg-pink-400 text-purple-900 font-bold rounded">Onayla</button>
                        <button onClick={() => { setShowPasswordPanel(false); setPasswordVal(''); }} className="px-4 py-2 bg-gray-700 text-pink-200 rounded">İptal</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 3: Grand Finale */}
              {showGrandFinale && (
                <div className="fixed inset-0 z-115 flex items-center justify-center">
                  {/* flash effect */}
                  <div className="absolute inset-0 bg-white animate-final-flash" />
                  {/* finale background */}
                  <img src="/iyiki_varsin.png" alt="final" className="absolute inset-0 w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                  {/* particles canvas */}
                  <canvas ref={particlesRef as any} className="absolute inset-0 w-full h-full" />

                  {/* top heartbeat text */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-120">
                    <div className="text-3xl text-white font-bold heartbeat" style={{ textShadow: '0 2px 0 #600' }}>İYİKİ VARSIN</div>
                  </div>

                  {/* decorative fireworks (CSS pulses) */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-20 top-32 w-6 h-6 bg-pink-300 rounded-full opacity-0 animate-firework" style={{ animationDelay: '0s' }} />
                    <div className="absolute left-40 top-20 w-8 h-8 bg-yellow-300 rounded-full opacity-0 animate-firework" style={{ animationDelay: '0.6s' }} />
                    <div className="absolute right-28 top-48 w-5 h-5 bg-cyan-300 rounded-full opacity-0 animate-firework" style={{ animationDelay: '1.2s' }} />
                  </div>
                </div>
              )}

              {/* Stage 4: Epilogue */}
              {showEpilogue && (
                <div className="fixed left-0 right-0 bottom-6 z-130 flex items-center justify-center">
                  <div className="pixel-border bg-black/80 p-4 rounded-lg text-center" style={{ width: 340 }}>
                    <div className="text-pink-200 mb-2">Seni Seviyorum. -Berat</div>
                    <button onClick={handleReplay} className="px-6 py-2 bg-pink-400 text-purple-900 font-bold rounded-lg">Tekrar Oyna</button>
                  </div>
                </div>
              )}

              {/* FrequencySync transition overlay (after scene 5) */}
              {showFreqTransition && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center pixelated-transition"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-pink-200 text-lg">Frekansları Eşitle başlatılıyor...</div>
                  </div>
                </motion.div>
              )}

              {/* FrequencySync mini-game */}
              {isFreqActive && (
                <FrequencySync onWin={handleFreqWin} onLose={handleFreqLose} />
              )}

              {/* FrequencySync Try Again overlay */}
              {showFreqTryAgain && (
                <div className="fixed inset-0 z-70 flex items-center justify-center animate-shake">
                  <div className="absolute inset-0 bg-black/85" />
                  <div className="relative z-80">
                    <div className="pixel-border bg-red-900/95 p-6 rounded-lg text-center">
                      <div className="text-2xl text-pink-200 font-bold mb-4">Bağlantı Hatası: Senkronizasyon Kayboldu</div>
                      <div className="text-pink-200 mb-4">Yeniden Yükle</div>
                      <button onClick={handleFreqTryAgain} className="px-6 py-2 bg-pink-400 text-purple-900 font-bold rounded-lg">YENİDEN YÜKLE</button>
                    </div>
                  </div>
                </div>
              )}

              {/* FrequencySync reward screen - mini_games_5 with golden İ and TAMAM */}
              {showFreqReward && (
                <motion.div className="fixed inset-0 z-90 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-black" />

                  <div className="z-20 relative flex items-center justify-center">
                    <div className="relative" style={{ width: '100%', maxWidth: '430px', aspectRatio: '9/16' }}>
                      <img
                        src="/mini_games_5.png"
                        alt="Frequency Reward"
                        className="object-contain w-full h-full"
                        style={{ pointerEvents: 'none' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const el = document.getElementById('freq-fallback');
                          if (el) el.style.display = 'block';
                        }}
                      />

                      <div id="freq-fallback" style={{ display: 'none' }} className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
                        <div className="text-9xl text-yellow-400 font-bold">İ</div>
                      </div>

                      {/* Tamam overlay inside the image */}
                      <button
                        aria-label="Tamam freq"
                        onClick={handleConfirmFreqReward}
                        className="absolute left-1/2 top-[62%] transform -translate-x-1/2 -translate-y-1/2 w-36 h-12 bg-transparent border-0 cursor-pointer z-30"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Final pixelated transition shown briefly before scene 6 */}
              {showFinalTransition && (
                <motion.div
                  className="fixed inset-0 z-95 flex items-center justify-center pixelated-transition"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-pink-200 text-lg">Finale geçiliyor...</div>
                  </div>
                </motion.div>
              )}

              

              {/* reveal on win - require user confirmation - show centered 9:16 box */}
              {showFlashY && (
                <motion.div
                  className="fixed inset-0 z-90 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* opaque backdrop to hide everything underneath */}
                  <div className="absolute inset-0 bg-black" />

                  <motion.div className="z-20 flex items-center justify-center" initial={{ scale: 1.02, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                    <div className="relative" style={{ width: '100%', maxWidth: '430px', aspectRatio: '9/16' }}>
                      {/* show mini game background behind reveal for cohesion */}
                      <img src="/mini_oyun_1_background.png" alt="bg" className="absolute inset-0 w-full h-full object-cover" style={{ imageRendering: 'pixelated', opacity: 1 }} />

                      <motion.img
                        src="/mini_games_1.png"
                        alt="İ - Reveal"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.style.display = 'none';
                          const el = document.getElementById('flash-fallback-i');
                          if (el) el.style.display = 'block';
                        }}
                        className="object-contain w-full h-full"
                        style={{ pointerEvents: 'none', position: 'relative' }}
                      />

                      {/* fallback big İ if image missing */}
                      <div id="flash-fallback-i" style={{ display: 'none' }} className="absolute inset-0 flex items-center justify-center bg-black">
                        <div className="text-9xl text-pink-300 font-bold">İ</div>
                      </div>

                      {/* Clickable overlay mapped to the 'Tamam' artwork inside the image */}
                      <button
                        aria-label="Tamam - reveal confirm"
                        onClick={handleConfirmSuccess}
                        className="absolute left-1/2 top-[64%] transform -translate-x-1/2 -translate-y-1/2 w-40 h-12 bg-transparent border-0 cursor-pointer z-30"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                        title="Tamam"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}

export default App;
