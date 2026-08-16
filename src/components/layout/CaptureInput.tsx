import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '../icons/Icons';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { VoiceVisualizer } from '../common/VoiceVisualizer';

interface CaptureInputProps {
    onAddTask: (text: string) => void;
}

export const CaptureInput: React.FC<CaptureInputProps> = ({ onAddTask }) => {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

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
                onAddTask(result.transcript.trim());
                setText('');
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (isRecording) {
            stopRecording();
            return;
        }
        if (text.trim()) { 
            onAddTask(text.trim()); 
            setText(''); 
        } 
    };

    const toggleVoice = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="w-full pointer-events-auto">
            {/* Live Audio & Speech Visualizer */}
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

            <form onSubmit={handleSubmit} className="flex gap-2 items-center relative">
                <div className="relative w-full flex items-center">
                    <input 
                        type="text" 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        placeholder={isRecording ? "Listening... speak your task..." : "Capture a thought... (N)"} 
                        className={`w-full bg-[var(--color-bg-input)] backdrop-blur-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] pl-5 pr-12 py-3 rounded-full border ${
                            isRecording 
                                ? 'border-teal-400 ring-2 ring-teal-400/40' 
                                : 'border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent)]'
                        } focus:outline-none transition-all text-sm shadow-sm`}
                        aria-label="Capture new task input"
                    />

                    {/* Microphone voice capture button inside input */}
                    <button
                        type="button"
                        onClick={toggleVoice}
                        className={`absolute right-3 p-1.5 rounded-full transition-all flex items-center justify-center ${
                            isRecording
                                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/50'
                                : 'text-[var(--color-text-secondary)] hover:text-teal-400 hover:bg-white/10'
                        }`}
                        title={isRecording ? "Stop recording & add task" : "Voice recording / Speech-to-text"}
                        aria-label="Voice recording"
                    >
                        <span className="text-base leading-none">🎙️</span>
                    </button>
                </div>

                <button 
                    type="submit" 
                    className="bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-secondary-hover)] text-[var(--color-text-primary)] p-3 rounded-full transition-colors flex-shrink-0 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] shadow-sm"
                    aria-label="Add Task"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </form>

            {isFocused && !isRecording && (
                <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[11px] text-[var(--color-text-secondary)]"
                >
                    <span>Shortcuts:</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">! Urgent</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">@tag</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">#category</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">🎙️ Voice</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">"by friday"</span>
                </motion.div>
            )}
        </div>
    );
};
