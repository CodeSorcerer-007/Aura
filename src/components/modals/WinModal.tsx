import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { Task } from '../../types';

interface WinModalProps {
    onClose: () => void;
    task?: Task;
    onSaveWin: (taskId: string, winText: string) => void;
}

export const WinModal: React.FC<WinModalProps> = ({ onClose, task, onSaveWin }) => {
    const [winText, setWinText] = useState('');
    const trapRef = useFocusTrap(Boolean(task));
    
    if (!task) return null;

    const handleSave = () => {
        if (winText.trim()) {
            onSaveWin(task.id, winText.trim());
            setWinText('');
            onClose();
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <motion.div ref={trapRef as any} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 text-center">
                <h2 className="text-xl font-bold mb-2">Celebrate Your Win! 🎉</h2>
                <p className="text-[var(--color-text-secondary)] text-sm mb-4">You finished: <strong>{task.text}</strong></p>
                <textarea
                    value={winText}
                    onChange={(e) => setWinText(e.target.value)}
                    placeholder="Write a quick reflection or win note..."
                    rows={3}
                    className="w-full bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4 text-sm"
                />
                <div className="flex gap-3">
                    <button onClick={onClose} className="w-full bg-[var(--color-bg-secondary-hover)] py-2 rounded-lg text-sm">Skip</button>
                    <button onClick={handleSave} className="w-full bg-[var(--color-accent)] text-black font-semibold py-2 rounded-lg text-sm">Save Win</button>
                </div>
            </motion.div>
        </motion.div>
    );
};
