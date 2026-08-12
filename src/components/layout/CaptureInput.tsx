import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from '../icons/Icons';

interface CaptureInputProps {
    onAddTask: (text: string) => void;
}

export const CaptureInput: React.FC<CaptureInputProps> = ({ onAddTask }) => {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (text.trim()) { 
            onAddTask(text.trim()); 
            setText(''); 
        } 
    };

    return (
        <div className="w-full pointer-events-auto">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <input 
                    type="text" 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Capture a thought... (N)" 
                    className="w-full bg-[var(--color-bg-input)] backdrop-blur-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] px-5 py-3 rounded-full border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all text-sm shadow-sm"
                    aria-label="Capture new task input"
                />
                <button 
                    type="submit" 
                    className="bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-secondary-hover)] text-[var(--color-text-primary)] p-3 rounded-full transition-colors flex-shrink-0 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] shadow-sm"
                    aria-label="Add Task"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </form>
            {isFocused && (
                <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[11px] text-[var(--color-text-secondary)]"
                >
                    <span>Shortcuts:</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">! Urgent</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">@tag</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">#category</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">"every day"</span>
                    <span className="bg-[var(--color-bg-input)] px-2 py-0.5 rounded-md border border-[var(--color-border)]">"by friday"</span>
                </motion.div>
            )}
        </div>
    );
};
