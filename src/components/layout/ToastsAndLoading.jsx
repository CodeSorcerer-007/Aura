import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, TrophyIcon, XIcon } from '../icons/Icons';

export const LoadingScreen = () => (
    <motion.div
        key="loading-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center z-[100]"
    >
        <motion.div
            animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            <SparklesIcon className="w-16 h-16 text-[var(--color-accent)]" />
        </motion.div>
        <h1 className="text-2xl font-bold mt-4 text-[var(--color-text-primary)]">Aura</h1>
    </motion.div>
);

export const AchievementToast = ({ achievement, onClose }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
    >
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-4 rounded-xl shadow-2xl text-black flex items-center gap-4">
            <TrophyIcon className="w-10 h-10 flex-shrink-0" />
            <div>
                <p className="font-bold">Achievement Unlocked!</p>
                <p className="text-sm">{achievement.title}</p>
            </div>
            <button onClick={onClose} className="ml-auto text-black/50 hover:text-black"><XIcon className="w-5 h-5"/></button>
        </div>
    </motion.div>
);

export const GenericToast = ({ message, onClose }) => {
    const bgColor = message.type === 'success' ? 'bg-emerald-600' : message.type === 'info' ? 'bg-indigo-600' : 'bg-rose-600';
    
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
            <div className={`p-4 rounded-xl shadow-2xl text-white flex items-center justify-between gap-3 ${bgColor}`}>
                <p className="font-semibold text-sm truncate flex-grow">{message.text}</p>
                {message.actionLabel && message.onAction && (
                    <button 
                        onClick={() => { message.onAction(); onClose(); }} 
                        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors flex-shrink-0"
                    >
                        {message.actionLabel}
                    </button>
                )}
                <button onClick={onClose} className="text-white/70 hover:text-white flex-shrink-0"><XIcon className="w-5 h-5"/></button>
            </div>
        </motion.div>
    );
};
