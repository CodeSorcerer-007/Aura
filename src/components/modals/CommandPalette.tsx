import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface Command {
    id?: string;
    label: string;
    action: () => void;
    shortcut?: string;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const trapRef = useFocusTrap(isOpen);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const filteredCommands = useMemo(() => {
        if (!searchTerm) return commands;
        return commands.filter(cmd => cmd.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, commands]);
    
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredCommands]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                onClose();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[90] flex items-start justify-center pt-20 p-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <motion.div ref={trapRef as any} initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xl">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command or search..."
                    className="w-full bg-transparent p-4 border-b border-[var(--color-border)] focus:outline-none text-[var(--color-text-primary)]"
                />
                <div className="max-h-64 overflow-y-auto p-2">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <div
                                key={cmd.id || cmd.label || index}
                                onClick={() => { cmd.action(); onClose(); }}
                                className={`p-3 rounded-lg flex justify-between items-center cursor-pointer ${selectedIndex === index ? 'bg-[var(--color-accent)] text-black font-semibold' : 'hover:bg-[var(--color-bg-secondary-hover)]'}`}
                            >
                                <span>{cmd.label}</span>
                                {cmd.shortcut && <span className="text-xs opacity-60">{cmd.shortcut}</span>}
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-sm text-[var(--color-text-secondary)]">No commands found.</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
