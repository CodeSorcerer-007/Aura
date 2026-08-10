import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';

export const FocusView = ({ task, onClose, onComplete }) => {
    const [duration, setDuration] = useState(25);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);
    const [soundType, setSoundType] = useState('off');
    const soundPlayer = useRef(null);
    const completedRef = useRef(false);
    const soundOptions = [
        { id: 'off', label: 'Off' },
        { id: 'pink', label: 'Pink' },
        { id: 'brown', label: 'Brown' },
        { id: 'white', label: 'White' },
    ];

    useEffect(() => {
        let isMounted = true;

        if (soundPlayer.current) {
            try {
                soundPlayer.current.stop();
                soundPlayer.current.dispose();
            } catch (e) {}
            soundPlayer.current = null;
        }

        if (soundType !== 'off') {
            try {
                const player = new Tone.Noise(soundType).toDestination();
                player.volume.value = -20;
                if (isMounted) soundPlayer.current = player;
            } catch (e) {}
        }

        return () => {
            isMounted = false;
            if (soundPlayer.current) {
                try {
                    soundPlayer.current.stop();
                    soundPlayer.current.dispose();
                } catch (e) {}
                soundPlayer.current = null;
            }
        };
    }, [soundType]);

    useEffect(() => {
        let isMounted = true;
        if (isActive && soundPlayer.current) {
            Tone.start().then(() => {
                if (isMounted && soundPlayer.current && isActive) {
                    try { soundPlayer.current.start(); } catch (e) {}
                }
            }).catch(() => {});
        } else if (soundPlayer.current) {
            try { soundPlayer.current.stop(); } catch (e) {}
        }
        return () => { isMounted = false; };
    }, [isActive, soundType]);

    useEffect(() => {
        setTimeLeft(duration * 60);
    }, [duration]);

    useEffect(() => { 
        let interval = null; 
        if (isActive) { 
            const startTime = Date.now();
            const initialTimeLeft = timeLeft;
            interval = setInterval(() => { 
                const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
                const newTimeLeft = Math.max(0, initialTimeLeft - secondsPassed);
                setTimeLeft(newTimeLeft);
                if (newTimeLeft <= 0 && !completedRef.current) {
                    completedRef.current = true;
                    setIsActive(false);
                    clearInterval(interval);
                    onComplete(task.id); 
                    onClose(); 
                }
            }, 500); 
        } 
        return () => { if (interval) clearInterval(interval); }; 
    }, [isActive]);

    const handleCloseSession = () => {
        setIsActive(false);
        if (soundPlayer.current) {
            try { soundPlayer.current.stop(); } catch (e) {}
        }
        onClose();
    };

    const minutes = Math.floor(timeLeft / 60); 
    const seconds = timeLeft % 60; 
    const progress = ((duration * 60) - timeLeft) / (duration * 60);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md text-center">
                <h2 className="text-xl text-white/70 mb-4">Focusing on:</h2>
                <p className="text-3xl font-bold text-white mb-6">{task.text}</p>
                 <div className="flex items-center justify-center gap-6 mb-6 text-white">
                     <button onClick={() => setDuration(d => Math.max(5, d - 5))} disabled={isActive} className="text-4xl font-light w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all">-</button>
                     <span className="text-lg w-32 text-center text-white/80">Set Timer: {duration} min</span>
                     <button onClick={() => setDuration(d => d + 5)} disabled={isActive} className="text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all">+</button>
                </div>
                <div className="relative w-48 h-48 mx-auto mb-8">
                    <svg className="w-full h-full" viewBox="0 0 100 100"><circle className="text-white/10" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent"></circle><motion.circle className="text-teal-400" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent" strokeDasharray={2 * Math.PI * 45} initial={{ strokeDashoffset: 2 * Math.PI * 45 }} animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1-progress) }} transition={{ duration: 1, ease: 'linear' }} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}></motion.circle></svg>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-mono">{`${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`}</div>
                </div>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <button onClick={() => setIsActive(!isActive)} className="bg-white/10 px-6 py-3 rounded-full text-lg font-semibold w-32">{isActive ? 'Pause' : 'Start'}</button>
                    <button onClick={handleCloseSession} className="bg-white/5 px-6 py-3 rounded-full">End Session</button>
                </div>
                <div className="flex items-center justify-center gap-2">
                    {soundOptions.map(opt => (
                        <button key={opt.id} onClick={() => setSoundType(opt.id)} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${soundType === opt.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};
