import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface VoiceVisualizerProps {
  isRecording: boolean;
  volumeLevel: number;
  duration: number;
  interimTranscript?: string;
  onStop: () => void;
  onCancel: () => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isRecording,
  volumeLevel,
  duration,
  interimTranscript,
  onStop,
  onCancel,
}) => {
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 5 }}
      className="p-3 rounded-2xl bg-gradient-to-r from-teal-950/80 via-[#111c2e]/90 to-indigo-950/80 border border-teal-500/30 shadow-xl backdrop-blur-md flex flex-col gap-2.5 my-2"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Animated Mic & Pulse Rings */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1 + volumeLevel * 0.8, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="absolute w-8 h-8 rounded-full bg-teal-400/30"
            />
            <div className="relative w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-black shadow-lg shadow-teal-500/40">
              <span className="text-sm">🎙️</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-teal-300">
                Listening & Recording
              </span>
              <span className="text-xs font-mono text-white/50">{formatTime(duration)}</span>
            </div>
            {interimTranscript && (
              <p className="text-xs text-white/80 italic mt-0.5 line-clamp-1">
                "{interimTranscript}"
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="flex items-center gap-1 h-6 px-2">
          {[0.3, 0.6, 0.9, 0.7, 0.4].map((multiplier, i) => {
            const barHeight = Math.max(4, Math.min(24, volumeLevel * 30 * multiplier + 6));
            return (
              <motion.div
                key={i}
                animate={{ height: barHeight }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="w-1 rounded-full bg-gradient-to-t from-teal-400 to-indigo-400"
              />
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 hover:text-white text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onStop}
            className="px-3 py-1 rounded-lg bg-teal-400 hover:bg-teal-300 text-black font-bold text-xs flex items-center gap-1 shadow-md shadow-teal-400/20 transition-all"
          >
            ✓ Done
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export interface AudioMemoPlayerProps {
  src: string;
  duration?: number;
  onDelete?: () => void;
  title?: string;
}

export const AudioMemoPlayer: React.FC<AudioMemoPlayerProps> = ({
  src,
  duration,
  onDelete,
  title = 'Voice Note',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = Number(e.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/90 hover:border-white/20 transition-all">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-7 h-7 rounded-lg bg-teal-400 text-black flex items-center justify-center font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-teal-500/20 shrink-0"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Title & Seek Bar */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] text-white/70">
          <span className="font-semibold truncate flex items-center gap-1">
            🎙️ {title}
          </span>
          <span className="font-mono text-[10px] text-white/50">
            {formatTime(currentTime)} / {formatTime(audioDuration)}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={audioDuration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-400"
        />
      </div>

      {/* Delete button if provided */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors shrink-0"
          title="Delete voice note"
        >
          🗑️
        </button>
      )}
    </div>
  );
};
