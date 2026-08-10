import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';

export const CommandPalette = ({ isOpen, onClose, commands }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if(isOpen) {
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

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[90] flex items-start justify-center pt-20 p-4">
            <motion.div initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-2xl">
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
                                key={cmd.id}
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
