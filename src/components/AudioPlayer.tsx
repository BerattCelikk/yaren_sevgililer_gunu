import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioSrc?: string;
  isPlaying: boolean;
}

export default function AudioPlayer({ audioSrc, isPlaying }: AudioPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const synthTimerRef = useRef<number | null>(null);

  // If an external src is provided, use the <audio> element as before.
  useEffect(() => {
    if (audioSrc && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.log('Audio play failed:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioSrc]);

  // Otherwise, create a simple WebAudio synth loop (romantic pad / chord progression)
  useEffect(() => {
    if (audioSrc) return; // not our concern if external file is used

    if (!isPlaying) {
      // stop synth
      if (synthTimerRef.current) {
        window.clearInterval(synthTimerRef.current);
        synthTimerRef.current = null;
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.suspend(); } catch (e) {}
      }
      return;
    }

    // start or resume context
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextCtor();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = isMuted ? 0 : 0.18;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current!;

    // chord frequencies (C, Am, F, G) - simple romantic progression
    const chords = [
      [261.63, 329.63, 392.0], // C major
      [220.0, 277.18, 329.63], // A minor
      [174.61, 220.0, 261.63], // F major variant
      [196.0, 246.94, 392.0],  // G major variant
    ];

    // play a single chord with gentle envelope
    const playChord = (freqs: number[]) => {
      const now = ctx.currentTime;
      const duration = 2.0; // seconds per chord
      const chordGain = ctx.createGain();
      chordGain.gain.setValueAtTime(0, now);
      chordGain.gain.linearRampToValueAtTime(1.0, now + 0.6);
      chordGain.gain.linearRampToValueAtTime(0.0001, now + duration - 0.4);
      chordGain.connect(master);

      const oscillators: OscillatorNode[] = [];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 1 ? 'sawtooth' : 'sine';
        osc.frequency.value = f;
        // subtle detune for warmth
        osc.detune.value = (i === 0 ? -6 : i === 2 ? 6 : 0);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        const nodeGain = ctx.createGain();
        nodeGain.gain.value = 0.6 / (i + 1);
        osc.connect(filter);
        filter.connect(nodeGain);
        nodeGain.connect(chordGain);
        osc.start(now);
        osc.stop(now + duration);
        oscillators.push(osc);
      });

      // cleanup after chord finishes
      setTimeout(() => {
        try { chordGain.disconnect(); } catch (e) {}
      }, (duration + 0.2) * 1000);
    };

    // play initial progression immediately and then loop
    let idx = 0;
    playChord(chords[idx]);
    idx = (idx + 1) % chords.length;
    synthTimerRef.current = window.setInterval(() => {
      playChord(chords[idx]);
      idx = (idx + 1) % chords.length;
    }, 2000);

    // resume if suspended
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    return () => {
      if (synthTimerRef.current) {
        window.clearInterval(synthTimerRef.current);
        synthTimerRef.current = null;
      }
    };
  }, [isPlaying, audioSrc, isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      if (masterGainRef.current) {
        masterGainRef.current.gain.value = next ? 0 : 0.18;
      }
      return next;
    });
  };

  return (
    <>
      {audioSrc ? <audio ref={audioRef} src={audioSrc} loop /> : null}

      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 bg-pink-500 hover:bg-pink-600 p-3 rounded-lg shadow-lg transition-colors pixel-border"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-white" />
        ) : (
          <Volume2 className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}
