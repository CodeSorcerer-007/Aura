import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';

export const FocusView = ({ task, onClose, onComplete, onLogDistraction }) => {
    const [duration, setDuration] = useState(25);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);
    const [soundType, setSoundType] = useState('off');
    const [distractionText, setDistractionText] = useState('');
    const [showDistractionInput, setShowDistractionInput] = useState(false);
    const [distractionsThisSession, setDistractionsThisSession] = useState([]);
    const soundPlayer = useRef(null);
    const completedRef = useRef(false);
    const distractionInputRef = useRef(null);

    const soundOptions = [
        { id: 'off', label: 'Off' },
        { id: 'pink', label: 'Pink' },
        { id: 'brown', label: 'Brown' },
        { id: 'white', label: 'White' },
    ];

    useEffect(() => {
        let isMounted = true;
        if (soundPlayer.current) {
            try { soundPlayer.current.stop(); soundPlayer.current.dispose(); } catch (e) {}
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
                try { soundPlayer.current.stop(); soundPlayer.current.dispose(); } catch (e) {}
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

    const distractionsRef = useRef([]);
    distractionsRef.current = distractionsThisSession;

    useEffect(() => { setTimeLeft(duration * 60); }, [duration]);

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
                    onComplete(task.id, distractionsRef.current);
                    onClose();
                }
            }, 500);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, task.id, onComplete, onClose]);

    const handleLogDistraction = () => {
        const trimmed = distractionText.trim();
        if (!trimmed) return;
        const newDistraction = { text: trimmed, time: new Date().toISOString() };
        setDistractionsThisSession(prev => [...prev, newDistraction]);
        if (onLogDistraction) onLogDistraction(trimmed);
        setDistractionText('');
        setShowDistractionInput(false);
    };

    const handleCloseSession = () => {
        setIsActive(false);
        if (soundPlayer.current) { try { soundPlayer.current.stop(); } catch (e) {} }
        onClose();
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((duration * 60) - timeLeft) / (duration * 60);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4" style={{ WebkitAppRegion: 'no-drag' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md text-center relative">

                {/* Distraction Log Button — only visible when timer is active */}
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute -right-2 top-0"
                    >
                        {showDistractionInput ? (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-2"
                            >
                                <input
                                    ref={distractionInputRef}
                                    type="text"
                                    value={distractionText}
                                    onChange={e => setDistractionText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleLogDistraction(); if (e.key === 'Escape') setShowDistractionInput(false); }}
                                    placeholder="What distracted you?"
                                    autoFocus
                                    className="text-sm bg-transparent text-white w-44 focus:outline-none"
                                />
                                <button onClick={handleLogDistraction} className="text-xs bg-white/20 px-2 py-1 rounded-lg text-white">Log</button>
                            </motion.div>
                        ) : (
                            <button
                                onClick={() => setShowDistractionInput(true)}
                                className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl px-3 py-2 text-white/60 hover:text-white text-xs transition-all"
                                title="Log a distraction (keeps your focus on track)"
                            >
                                ⚡ Distracted?
                            </button>
                        )}
                    </motion.div>
                )}

                <h2 className="text-xl text-white/70 mb-3">Focusing on:</h2>
                <p className="text-2xl font-bold text-white mb-5 px-4">{task.text}</p>

                <div className="flex items-center justify-center gap-6 mb-6 text-white">
                    <button onClick={() => setDuration(d => Math.max(5, d - 5))} disabled={isActive} className="text-4xl font-light w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all">-</button>
                    <span className="text-lg w-32 text-center text-white/80">Set Timer: {duration} min</span>
                    <button onClick={() => setDuration(d => d + 5)} disabled={isActive} className="text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all">+</button>
                </div>

                <div className="relative w-48 h-48 mx-auto mb-8">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-white/10" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent" stroke="currentColor"/>
                        <motion.circle className="text-teal-400" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeDasharray={2 * Math.PI * 45} initial={{ strokeDashoffset: 2 * Math.PI * 45 }} animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1-progress) }} transition={{ duration: 1, ease: 'linear' }} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-mono text-white">{`${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`}</span>
                        {distractionsThisSession.length > 0 && (
                            <span className="text-xs text-amber-400/80 mt-1">⚡ {distractionsThisSession.length} logged</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-5">
                    <button onClick={() => setIsActive(!isActive)} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full text-lg font-semibold w-32 transition-all text-white">{isActive ? 'Pause' : 'Start'}</button>
                    <button onClick={handleCloseSession} className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full text-white/70 transition-all">End Session</button>
                </div>

                {/* Sound selector */}
                <div className="flex items-center justify-center gap-2">
                    {soundOptions.map(opt => (
                        <button key={opt.id} onClick={() => setSoundType(opt.id)} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${soundType === opt.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Recent distractions for this session */}
                {distractionsThisSession.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 text-left bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-white/50 font-semibold mb-2">⚡ Distractions this session:</p>
                        {distractionsThisSession.map((d, i) => (
                            <p key={i} className="text-xs text-white/70">• {d.text}</p>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};
