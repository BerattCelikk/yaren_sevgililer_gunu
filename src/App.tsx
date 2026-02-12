import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MobileLayout from './components/MobileLayout';
import LandingPage from './components/LandingPage';
import StoryPage from './components/StoryPage';
import AudioPlayer from './components/AudioPlayer';
import { storyScenes } from './data/storyData';

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const handleStart = () => {
    setIsAudioPlaying(true);
    setCurrentPage(1);
  };

  const handleNext = () => {
    if (currentPage < storyScenes.length) {
      setCurrentPage(currentPage + 1);
    } else {
      setCurrentPage(0);
      setIsAudioPlaying(false);
    }
  };

  const getCurrentBackground = () => {
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
            <StoryPage
              videoSrc={storyScenes[currentPage - 1].videoSrc}
              dialogue={storyScenes[currentPage - 1].dialogue}
              onNext={handleNext}
              pageNumber={currentPage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}

export default App;
