import React from 'react';
import { motion } from 'framer-motion';
import { WidgetItem, WidgetSize } from '../../types';
import { XIcon } from '../icons/Icons';

export interface WidgetCardProps {
  widget: WidgetItem;
  isEditMode: boolean;
  onRemove: (id: string) => void;
  onResize: (id: string, size: WidgetSize) => void;
  children: React.ReactNode;
  className?: string;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  widget,
  isEditMode,
  onRemove,
  onResize,
  children,
  className = '',
}) => {
  // Grid column span classes based on widget size
  const sizeClasses: Record<WidgetSize, string> = {
    small: 'col-span-1 min-h-[200px]',
    medium: 'col-span-1 md:col-span-2 min-h-[220px]',
    large: 'col-span-1 md:col-span-2 lg:col-span-2 min-h-[360px]',
    wide: 'col-span-1 md:col-span-2 lg:col-span-3 min-h-[140px]',
    banner: 'col-span-1 md:col-span-2 lg:col-span-3 min-h-[280px]',
  };

  const nextSizes: Record<WidgetSize, WidgetSize> = {
    small: 'medium',
    medium: 'large',
    large: 'wide',
    wide: 'small',
    banner: 'medium',
  };

  // iOS-style wiggle animation in Edit Mode
  const wiggleVariants = {
    idle: { rotate: 0 },
    wiggling: {
      rotate: [0, -1, 1, -1, 0],
      transition: {
        repeat: Infinity,
        duration: 0.28,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      layout
      variants={wiggleVariants}
      animate={isEditMode ? 'wiggling' : 'idle'}
      className={`relative rounded-2xl bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-secondary)]/80 border border-[var(--color-border)] p-4 shadow-xl backdrop-blur-xl flex flex-col justify-between overflow-hidden transition-shadow duration-300 hover:shadow-2xl hover:border-white/20 ${
        sizeClasses[widget.size] || sizeClasses.medium
      } ${className}`}
    >
      {/* Edit Mode Overlay & Controls */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-40 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-xl border border-white/20 shadow-2xl">
          {/* Resize Button */}
          <button
            onClick={() => onResize(widget.id, nextSizes[widget.size])}
            title={`Resize (Current: ${widget.size})`}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
          >
            {widget.size}
          </button>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(widget.id)}
            title="Remove Widget"
            className="w-5 h-5 rounded-full bg-rose-500/30 hover:bg-rose-500 text-rose-200 hover:text-white flex items-center justify-center transition-colors"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Widget Interior Content */}
      <div className="flex-1 flex flex-col">{children}</div>
    </motion.div>
  );
};
