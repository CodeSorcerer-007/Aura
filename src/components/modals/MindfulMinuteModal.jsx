import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export const MindfulMinuteModal = ({ isOpen, onClose }) => {
    const [prompt, setPrompt] = useState('Prepare to begin...');
    const trapRef = useFocusTrap(isOpen);
    const prompts = ['Breathe in...', 'Hold...', 'Breathe out...'];
    const durations = [4000, 2000, 6000];

    useEffect(() => {
        if (!isOpen) return;

        let index = -1;
        let timer;

        const cycle = () => {
            index = (index + 1) % prompts.length;
            setPrompt(prompts[index]);
            timer = setTimeout(cycle, durations[index]);
        };
        
        const startTimeout = setTimeout(cycle, 1000);

        return () => {
            clearTimeout(startTimeout);
            clearTimeout(timer);
        };
    }, [isOpen]);

    if(!isOpen) return null;

    return (
        <motion.div ref={trapRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[80] flex flex-col items-center justify-center p-4">
             <motion.div 
                className="w-48 h-48 rounded-full border-2 border-[var(--color-accent)]"
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
             />
             <p className="text-2xl font-semibold text-white/80 mt-12">{prompt}</p>
             <button onClick={onClose} className="absolute bottom-12 bg-white/10 px-6 py-3 rounded-full">End Session</button>
        </motion.div>
    );
};
