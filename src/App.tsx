import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MobileLayout from './components/MobileLayout';
import LandingPage from './components/LandingPage';
import StoryPage from './components/StoryPage';
import AudioPlayer from './components/AudioPlayer';
import CoffeeGame from './components/CoffeeGame';
import BalanceGame from './components/BalanceGame';
import { storyScenes } from './data/storyData';

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMiniGameActive, setIsMiniGameActive] = useState(false);
  const [showMiniTransition, setShowMiniTransition] = useState(false);
  const [showFlashY, setShowFlashY] = useState(false);
  const [isBalanceGameActive, setIsBalanceGameActive] = useState(false);
  const [showBalanceTransition, setShowBalanceTransition] = useState(false);
  const [balanceFailCount, setBalanceFailCount] = useState(0);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [showBalanceReward, setShowBalanceReward] = useState(false);


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
      setShowBalanceTransition(true);
      setTimeout(() => {
        setShowBalanceTransition(false);
        setIsBalanceGameActive(true);
        setBalanceFailCount(0);
        setShowTryAgain(false);
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
    setBalanceFailCount(c => c + 1);
    // if 3 consecutive fails, pause and show Try Again
    setTimeout(() => {
      setShowTryAgain(prev => {
        if (balanceFailCount + 1 >= 3) return true;
        return prev;
      });
    }, 250);
  };

  const handleTryAgain = () => {
    // reset and restart balance game
    setBalanceFailCount(0);
    setShowTryAgain(false);
    setIsBalanceGameActive(true);
  };

  const handleConfirmBalanceReward = () => {
    setShowBalanceReward(false);
    setCurrentPage(3);
  };

  const getCurrentBackground = () => {
    // if any mini-game or overlay is active, hide background so only mini-game UI shows
    if (isMiniGameActive || isBalanceGameActive || showFlashY || showBalanceReward || showTryAgain || showMiniTransition || showBalanceTransition) {
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
              {!isMiniGameActive && !isBalanceGameActive && !showFlashY && !showBalanceReward && !showTryAgain && !showMiniTransition && !showBalanceTransition && (
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

              {/* Balance reward screen */}
              {showBalanceReward && (
                <motion.div className="fixed inset-0 z-90 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="absolute inset-0 bg-black" />
                  <img src="/mini_games_2.png" alt="Balance Reward" className="z-20 object-cover w-screen h-screen" style={{ pointerEvents: 'none' }} onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'; const el = document.getElementById('balance-fallback'); if(el) el.style.display='block';}} />
                  <div id="balance-fallback" style={{display:'none'}} className="z-20 absolute inset-0 flex items-center justify-center"> <div className="text-4xl text-pink-200">Tebrikler!</div> </div>
                  <button aria-label="Tamam balance" onClick={handleConfirmBalanceReward} className="z-30 absolute left-1/2 top-[78%] transform -translate-x-1/2 -translate-y-1/2 w-40 h-12 bg-transparent border-0 cursor-pointer" />
                </motion.div>
              )}

              {/* reveal on win - require user confirmation */}
              {showFlashY && (
                <motion.div
                  className="fixed inset-0 z-90 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* opaque backdrop to hide everything underneath */}
                  <div className="absolute inset-0 bg-black" />

                  {/* full-viewport image (covers entire screen) */}
                  <motion.img
                    src="/mini_games_1.png"
                    alt="İ - Reveal"
                    initial={{ scale: 1.02, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.98, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      img.style.display = 'none';
                      const el = document.getElementById('flash-fallback-i');
                      if (el) el.style.display = 'block';
                    }}
                    className="z-20 object-cover w-screen h-screen"
                    style={{ pointerEvents: 'none' }}
                  />

                  {/* fallback big İ if image missing */}
                  <div id="flash-fallback-i" style={{ display: 'none' }} className="z-20 absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-9xl text-pink-300 font-bold">İ</div>
                  </div>

                  {/* Clickable overlay mapped to the 'Tamam' artwork inside the image */}
                  <button
                    aria-label="Tamam - reveal confirm"
                    onClick={handleConfirmSuccess}
                    className="z-30 absolute left-1/2 top-[64%] transform -translate-x-1/2 -translate-y-1/2 w-40 h-12 bg-transparent border-0 cursor-pointer"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    title="Tamam"
                  />
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
