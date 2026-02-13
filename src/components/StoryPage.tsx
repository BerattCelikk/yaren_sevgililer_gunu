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

  // Reset pagination when the page changes
  useEffect(() => {
    setPartIndex(0);
  }, [pageNumber]);

  const dialogueParts = Array.isArray(dialogue) ? dialogue : [dialogue];

  const handleClick = () => {
    if (partIndex < dialogueParts.length - 1) {
      setPartIndex(partIndex + 1);
    } else {
      onNext();
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
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

            <p className="text-pink-100 text-xs md:text-sm leading-relaxed flex-1">
              {dialogueParts[partIndex]}
            </p>
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
