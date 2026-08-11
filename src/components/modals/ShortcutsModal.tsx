import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { XIcon } from '../icons/Icons';

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    const trapRef = useFocusTrap(isOpen);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const shortcuts = [
        { key: 'Ctrl+Shift+Space', desc: 'Global Quick Capture (Anywhere in Windows)' },
        { key: 'Ctrl+P', desc: 'Command Palette' },
        { key: 'n', desc: 'Focus Quick Capture Input' },
        { key: 's', desc: 'Open Settings' },
        { key: '?', desc: 'Show this shortcuts overlay' },
        { key: '1-6', desc: 'Switch Views (Flow, Calendar, Constellations, Grove, Journal, Review)' },
        { key: 'Escape', desc: 'Close modals/overlays' }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <motion.div ref={trapRef as any} initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative text-[var(--color-text-primary)]">
                <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                    <XIcon className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold mb-6">Keyboard Shortcuts</h2>
                
                <div className="space-y-3">
                    {shortcuts.map((sc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                            <span className="text-sm">{sc.desc}</span>
                            <kbd className="px-2 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xs font-mono">{sc.key}</kbd>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <button onClick={onClose} className="bg-[var(--color-accent)] text-black px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity">Got it</button>
                </div>
            </motion.div>
        </motion.div>
    );
};
