import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

export interface AdaptiveSliderProps {
  value: number; // 0 - 100 or min - max
  min?: number;
  max?: number;
  step?: number;
  steps?: number[]; // snap points e.g. [15, 25, 45, 60, 90]
  onChange: (value: number) => void;
  formatLabel?: (value: number) => string;
  label?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  className?: string;
  disabled?: boolean;
}

export const AdaptiveSlider: React.FC<AdaptiveSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  steps,
  onChange,
  formatLabel = (v) => `${v}`,
  label,
  icon,
  accentColor = 'var(--color-accent, #2dd4bf)',
  className = '',
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize percentage 0-1
  const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const handlePointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;
      const rect = trackRef.current.getBoundingClientRect();
      const rawPct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      let rawVal = min + rawPct * (max - min);

      // Snap to stepped list if provided
      if (steps && steps.length > 0) {
        let closest = steps[0];
        let minDiff = Math.abs(rawVal - steps[0]);
        for (const s of steps) {
          const diff = Math.abs(rawVal - s);
          if (diff < minDiff) {
            minDiff = diff;
            closest = s;
          }
        }
        onChange(closest);
      } else {
        const steppedVal = Math.round(rawVal / step) * step;
        const clamped = Math.max(min, Math.min(max, steppedVal));
        onChange(clamped);
      }
    },
    [min, max, step, steps, onChange, disabled]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    handlePointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      handlePointer(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(max, value + (step || 1));
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(min, value - (step || 1));
      onChange(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div className={`flex flex-col gap-2 select-none ${className}`}>
      {(label || icon) && (
        <div className="flex items-center justify-between text-xs font-medium text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            {icon && <span className="text-[var(--color-accent)]">{icon}</span>}
            {label && <span>{label}</span>}
          </div>
          <span className="font-mono text-[var(--color-text-primary)] font-semibold">
            {formatLabel(value)}
          </span>
        </div>
      )}

      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative h-9 w-full flex items-center cursor-pointer touch-none focus:outline-none group ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        }`}
      >
        {/* Outer Track */}
        <div className="relative w-full h-3 bg-white/10 dark:bg-white/5 border border-white/10 rounded-full overflow-hidden backdrop-blur-md shadow-inner">
          {/* Active Fill Track */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 rounded-full"
            style={{
              width: `${percentage * 100}%`,
              background: `linear-gradient(90deg, ${accentColor}88 0%, ${accentColor} 100%)`,
            }}
            animate={{
              boxShadow: isDragging || isHovered ? `0 0 12px ${accentColor}66` : 'none',
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Notch Markers */}
          {steps && steps.length > 0 && (
            <div className="absolute inset-0 flex items-center pointer-events-none px-1">
              {steps.map((s) => {
                const stepPct = (s - min) / (max - min);
                const isPassed = value >= s;
                return (
                  <div
                    key={s}
                    className={`absolute w-1 h-1.5 rounded-full -translate-x-1/2 transition-colors duration-200 ${
                      isPassed ? 'bg-white/90' : 'bg-white/20'
                    }`}
                    style={{ left: `${stepPct * 100}%` }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Tactile Magnetic Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#18181b] border-2 shadow-lg flex items-center justify-center pointer-events-none"
          style={{
            left: `${percentage * 100}%`,
            borderColor: accentColor,
          }}
          animate={{
            scale: isDragging ? 1.25 : isHovered ? 1.1 : 1,
            boxShadow: isDragging
              ? `0 0 20px ${accentColor}99, 0 4px 12px rgba(0,0,0,0.5)`
              : `0 2px 8px rgba(0,0,0,0.3)`,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </motion.div>

        {/* Dynamic Tooltip Bubble */}
        <AnimatePresence>
          {(isDragging || isHovered) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -28, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="absolute -top-1 pointer-events-none -translate-x-1/2 px-2.5 py-1 rounded-md bg-[#18181b] border border-white/20 text-white font-mono text-xs font-bold shadow-xl whitespace-nowrap z-30"
              style={{ left: `${percentage * 100}%` }}
            >
              {formatLabel(value)}
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#18181b] border-r border-b border-white/20 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
