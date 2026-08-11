import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickCaptureOverlayProps {
    onAddTask: (text: string) => void;
    onClose?: () => void;
}

export const QuickCaptureOverlay: React.FC<QuickCaptureOverlayProps> = ({ onAddTask, onClose }) => {
    const [text, setText] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const t = setTimeout(() => {
            setIsVisible(true);
            inputRef.current?.focus();
        }, 50);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if ((window as any).electronAPI?.onAddTaskFromCapture) {
            const unsub = (window as any).electronAPI.onAddTaskFromCapture((taskText: string) => {
                onAddTask(taskText);
            });
            return unsub;
        }
    }, [onAddTask]);

    const handleSubmit = () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        if ((window as any).electronAPI?.submitQuickCapture) {
            (window as any).electronAPI.submitQuickCapture(trimmed);
        } else {
            onAddTask(trimmed);
        }
        setText('');
        onClose?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') {
            if ((window as any).electronAPI?.cancelQuickCapture) {
                (window as any).electronAPI.cancelQuickCapture();
            }
            onClose?.();
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="fixed top-1/4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-lg px-4"
                >
                    <div className="relative flex items-center bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-accent)] to-transparent rounded-l-2xl" />

                        <span className="pl-5 pr-2 text-[var(--color-accent)] text-lg font-mono select-none">⚡</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Capture a thought... (Enter to save, Esc to close)"
                            className="flex-grow py-4 pr-4 bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none text-base"
                        />
                        {text && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleSubmit}
                                className="mr-3 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-black text-sm font-bold"
                            >
                                Add
                            </motion.button>
                        )}
                    </div>
                    <p className="text-center text-xs text-[var(--color-text-secondary)]/50 mt-2">
                        Press <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] font-mono text-xs">Esc</kbd> to dismiss
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
