import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { VoiceVisualizer } from '../common/VoiceVisualizer';

interface QuickCaptureOverlayProps {
    onAddTask: (text: string) => void;
    onClose?: () => void;
}

export const QuickCaptureOverlay: React.FC<QuickCaptureOverlayProps> = ({ onAddTask, onClose }) => {
    const [text, setText] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        isRecording,
        interimTranscript,
        duration,
        volumeLevel,
        startRecording,
        stopRecording,
        cancelRecording,
    } = useVoiceRecorder({
        onTranscriptChange: (liveText) => {
            setText(liveText);
        },
        onFinalResult: (result) => {
            if (result.transcript.trim()) {
                submitTask(result.transcript.trim());
            }
        },
    });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if ((window as any).electronAPI?.onAddTaskFromCapture) {
            const unsub = (window as any).electronAPI.onAddTaskFromCapture((taskText: string) => {
                onAddTask(taskText);
            });
            return unsub;
        }
    }, [onAddTask]);

    const submitTask = (taskText: string) => {
        const trimmed = taskText.trim();
        if (!trimmed) return;

        if ((window as any).electronAPI?.submitQuickCapture) {
            (window as any).electronAPI.submitQuickCapture(trimmed);
        } else {
            onAddTask(trimmed);
        }
        setText('');
        onClose?.();
    };

    const handleSubmit = () => {
        if (isRecording) {
            stopRecording();
            return;
        }
        submitTask(text);
    };

    const toggleVoice = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') {
            if (isRecording) {
                cancelRecording();
                return;
            }
            if ((window as any).electronAPI?.cancelQuickCapture) {
                (window as any).electronAPI.cancelQuickCapture();
            }
            onClose?.();
        }
    };

    const isStandalone = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'quick-capture';

    if (isStandalone) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-transparent select-none">
                <AnimatePresence>
                    {isRecording && (
                        <div className="w-full mb-1">
                            <VoiceVisualizer
                                isRecording={isRecording}
                                volumeLevel={volumeLevel}
                                duration={duration}
                                interimTranscript={interimTranscript}
                                onStop={() => stopRecording()}
                                onCancel={cancelRecording}
                            />
                        </div>
                    )}
                </AnimatePresence>

                <div className="relative flex items-center w-full bg-[#1e293b] border border-white/20 rounded-2xl shadow-2xl overflow-hidden px-3 py-1.5" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-transparent" />
                    <span className="pl-3 pr-2 text-teal-400 text-base font-mono select-none">⚡</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isRecording ? "Listening... speak your task..." : "Capture a thought... (Enter to save, Esc to close)"}
                        className="flex-grow py-2 pr-2 bg-transparent text-white placeholder:text-white/40 focus:outline-none text-sm"
                        autoFocus
                    />

                    {/* Microphone Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleVoice}
                        className={`p-1.5 rounded-lg transition-all mr-1.5 flex items-center justify-center ${
                            isRecording
                                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/50'
                                : 'text-white/60 hover:text-teal-400 hover:bg-white/10'
                        }`}
                        title="Voice Speech-to-Text"
                    >
                        <span className="text-sm">🎙️</span>
                    </button>

                    {text && (
                        <button
                            onClick={handleSubmit}
                            className="mr-1 px-3 py-1 rounded-lg bg-teal-400 text-black text-xs font-bold hover:bg-teal-300 transition-colors"
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>
        );
    }

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
                    <AnimatePresence>
                        {isRecording && (
                            <VoiceVisualizer
                                isRecording={isRecording}
                                volumeLevel={volumeLevel}
                                duration={duration}
                                interimTranscript={interimTranscript}
                                onStop={() => stopRecording()}
                                onCancel={cancelRecording}
                            />
                        )}
                    </AnimatePresence>

                    <div className="relative flex items-center bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-accent)] to-transparent rounded-l-2xl" />

                        <span className="pl-5 pr-2 text-[var(--color-accent)] text-lg font-mono select-none">⚡</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isRecording ? "Listening... speak your task..." : "Capture a thought... (Enter to save, Esc to close)"}
                            className="flex-grow py-4 pr-2 bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none text-base"
                        />

                        {/* Microphone Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleVoice}
                            className={`p-2 rounded-xl transition-all mr-2 flex items-center justify-center ${
                                isRecording
                                    ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/50'
                                    : 'text-[var(--color-text-secondary)] hover:text-teal-400 hover:bg-white/10'
                            }`}
                            title="Voice recording / Speech-to-text"
                        >
                            <span className="text-base">🎙️</span>
                        </button>

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
