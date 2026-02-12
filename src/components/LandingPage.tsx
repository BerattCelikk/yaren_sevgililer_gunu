import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Use a simple semi-transparent overlay so the background image shows cleanly */}
      <div className="absolute inset-0 bg-black/25" />

      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -20,
              rotate: Math.random() * 360
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: Math.random() * 360 + 360
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          >
            <Heart
              className="text-pink-300 opacity-30"
              size={Math.random() * 20 + 10}
              fill="currentColor"
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-8 gap-12">
        <motion.h1
          className="text-3xl md:text-4xl text-center text-pink-200 drop-shadow-lg leading-relaxed"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          VALENTINE'S
          <br />
          STORY
        </motion.h1>

        <motion.button
          onClick={onStart}
          className="px-12 py-6 bg-pink-500 hover:bg-pink-600 text-white text-lg pixel-border shadow-xl relative overflow-hidden group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="relative z-10"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            BAŞLAT
          </motion.span>

          <motion.div
            className="absolute inset-0 bg-pink-400"
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        <motion.div
          className="flex gap-4 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-pink-400"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
