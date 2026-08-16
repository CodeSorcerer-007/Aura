import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, LinkIcon } from '../icons/Icons';
import { getFile } from '../../utils/db';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { VoiceVisualizer, AudioMemoPlayer } from '../common/VoiceVisualizer';
import {
    isElectron, pickAndAttachFiles, openAttachment,
    deleteAttachmentFromDisk, formatFileSize, getFileIcon
} from '../../utils/electronBridge';
import { Task, TaskAttachment } from '../../types';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task;
    onSave: (id: string, text: string, notes: string, tags: string[], estimatedMinutes: number | null) => void;
    onSetDependency: (taskId: string, dependencyId: string | null) => void;
    allTasks: Task[];
    onAddAttachment: (taskId: string, fileOrAtt: any, isNative?: boolean) => void;
    onDeleteAttachment: (taskId: string, attachment: TaskAttachment) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, onSave, onSetDependency, allTasks, onAddAttachment, onDeleteAttachment }) => {
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState('');
    const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
    const [attachmentURLs, setAttachmentURLs] = useState<Record<string, string>>({});
    const [isAttaching, setIsAttaching] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const trapRef = useFocusTrap(isOpen);

    const {
        isRecording,
        interimTranscript,
        duration,
        volumeLevel,
        startRecording,
        stopRecording,
        cancelRecording,
    } = useVoiceRecorder({
        onFinalResult: (result) => {
            if (!task) return;
            const newAttId = 'voice-' + Date.now();
            const voiceAtt: TaskAttachment = {
                id: newAttId,
                name: `Voice Note (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
                type: 'audio',
                audioUrl: result.audioUrl || undefined,
                audioDuration: result.duration,
            };

            onAddAttachment(task.id, voiceAtt, false);

            if (result.transcript.trim()) {
                setNotes(prev => {
                    const addition = `[Voice Note]: "${result.transcript.trim()}"`;
                    return prev ? `${prev}\n\n${addition}` : addition;
                });
            }
        },
    });

    useEffect(() => {
        let isMounted = true;
        let localUrls: Record<string, string> = {};
        if (task) {
            setText(task.text);
            setNotes(task.notes || '');
            setTags((task.tags || []).join(', '));
            setEstimatedMinutes(task.estimatedMinutes ? String(task.estimatedMinutes) : '');

            if (!isElectron()) {
                const attachmentPromises = (task.attachments || []).map(async (att) => {
                    if (att.audioUrl) return;
                    const fileBlob = await getFile(att.id);
                    if (fileBlob && isMounted) {
                        const url = URL.createObjectURL(fileBlob);
                        localUrls[att.id] = url;
                    }
                });

                Promise.all(attachmentPromises).then(() => {
                    if (isMounted) setAttachmentURLs(localUrls);
                });
            }
        }

        return () => {
            isMounted = false;
            Object.values(localUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, [task]);

    if (!isOpen || !task) return null;

    const handleSave = () => {
        const estNum = estimatedMinutes.trim() ? parseInt(estimatedMinutes, 10) : null;
        onSave(task.id, text, notes, tags.split(',').map(t => t.trim()).filter(Boolean), isNaN(estNum as any) ? null : estNum);
        onClose();
    };

    const handleNativeAttach = async () => {
        setIsAttaching(true);
        try {
            const files = await pickAndAttachFiles();
            for (const f of files) {
                onAddAttachment(task.id, f, true);
            }
        } catch (e) {
            console.error('Failed to attach files natively:', e);
        } finally {
            setIsAttaching(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                onAddAttachment(task.id, files[i]);
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDeleteAttachment = async (att: TaskAttachment) => {
        if (isElectron() && att.path) {
            await deleteAttachmentFromDisk(att.path);
        }
        onDeleteAttachment(task.id, att);
    };

    const handleOpenAttachment = (att: TaskAttachment) => {
        if (isElectron() && att.path) {
            openAttachment(att.path);
        } else if (att.audioUrl) {
            // Audio attachment handled inline
        } else if (attachmentURLs[att.id]) {
            const a = document.createElement('a');
            a.href = attachmentURLs[att.id];
            a.download = att.name;
            a.click();
        }
    };

    const timePresets = [
        { label: '15m', value: 15 },
        { label: '30m', value: 30 },
        { label: '1h', value: 60 },
        { label: '2h', value: 120 },
    ];

    const dependencyTask = allTasks.find(t => t.id === task.dependsOn);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <motion.div ref={trapRef as any} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold">Task Details</h2>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><XIcon className="w-6 h-6"/></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Task Name</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">⏱ Time Estimate</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="minutes"
                                value={estimatedMinutes}
                                onChange={(e) => setEstimatedMinutes(e.target.value)}
                                min="1"
                                className="w-28 bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            />
                            <div className="flex gap-1">
                                {timePresets.map(p => (
                                    <button
                                        key={p.label}
                                        onClick={() => setEstimatedMinutes(String(p.value))}
                                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                                            estimatedMinutes === String(p.value)
                                                ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)] font-bold'
                                                : 'bg-[var(--color-bg)] border-[var(--color-border)] hover:border-[var(--color-accent)]'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-semibold">Notes</label>
                            <span className="text-[11px] text-[var(--color-text-secondary)]">Speech notes auto-transcribed</span>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="Add extra context, links, or sub-goals..."
                            className="w-full bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="work, projectA, urgent"
                            className="w-full bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Dependencies</label>
                        {dependencyTask ? (
                            <div className="flex items-center justify-between bg-[var(--color-bg)] p-2 rounded-lg text-sm">
                                <span>Depends on: <strong>{dependencyTask.text}</strong></span>
                                <button onClick={() => onSetDependency(task.id, null)} className="text-rose-400 text-xs">Remove</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsDependencyModalOpen(true)} className="text-sm bg-[var(--color-bg)] p-2 rounded-lg w-full text-left flex items-center justify-between text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary-hover)]">
                                <span>Set a dependency...</span>
                                <LinkIcon className="w-4 h-4"/>
                            </button>
                        )}
                    </div>

                    {/* Attachments & Voice Notes */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold">📎 Attachments & Voice Notes</label>
                            <button
                                type="button"
                                onClick={() => isRecording ? stopRecording() : startRecording()}
                                className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                                    isRecording
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30'
                                }`}
                            >
                                <span>🎙️</span>
                                <span>{isRecording ? 'Stop Recording' : 'Record Voice Note'}</span>
                            </button>
                        </div>

                        {/* Live voice recording feedback inside modal */}
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

                        {isElectron() ? (
                            <button
                                onClick={handleNativeAttach}
                                disabled={isAttaching}
                                className="w-full py-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
                            >
                                {isAttaching ? '⏳ Attaching...' : '+ Attach Files (any type)'}
                            </button>
                        ) : (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all flex items-center justify-center gap-2 mb-3"
                                >
                                    + Attach Files (any type)
                                </button>
                            </>
                        )}

                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            <AnimatePresence>
                                {(task.attachments || []).map(att => {
                                    if (att.type === 'audio' || att.audioUrl) {
                                        return (
                                            <div key={att.id}>
                                                <AudioMemoPlayer
                                                    src={att.audioUrl || attachmentURLs[att.id] || ''}
                                                    duration={att.audioDuration}
                                                    title={att.name}
                                                    onDelete={() => handleDeleteAttachment(att)}
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <motion.div
                                            key={att.id}
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="flex items-center gap-3 bg-[var(--color-bg)] p-2.5 rounded-xl border border-[var(--color-border)] group"
                                        >
                                            <span className="text-xl flex-shrink-0">{getFileIcon(att.name)}</span>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-sm font-medium truncate">{att.name}</p>
                                                {att.size && (
                                                    <p className="text-xs text-[var(--color-text-secondary)]">{formatFileSize(att.size)}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenAttachment(att)}
                                                    className="text-xs px-2 py-1 rounded-lg bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/40 transition-colors"
                                                    title="Open file"
                                                >
                                                    Open
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAttachment(att)}
                                                    className="p-1 rounded-lg text-rose-400 hover:bg-rose-400/10 transition-colors"
                                                    title="Remove attachment"
                                                >
                                                    <XIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {(task.attachments || []).length === 0 && !isRecording && (
                                <p className="text-xs text-[var(--color-text-secondary)] text-center py-2">No files or voice notes attached yet</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[var(--color-bg-secondary-hover)]">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-black font-semibold">Save Changes</button>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {isDependencyModalOpen && (
                    <DependencySelectorModal
                        isOpen={isDependencyModalOpen}
                        onClose={() => setIsDependencyModalOpen(false)}
                        currentTask={task}
                        allTasks={allTasks}
                        onSelect={(depId) => {
                            onSetDependency(task.id, depId);
                            setIsDependencyModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface DependencySelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTask: Task;
    allTasks: Task[];
    onSelect: (id: string | null) => void;
}

const DependencySelectorModal: React.FC<DependencySelectorModalProps> = ({
    isOpen,
    onClose,
    currentTask,
    allTasks,
    onSelect
}) => {
    if (!isOpen) return null;

    const availableTasks = allTasks.filter(t => t.id !== currentTask.id && !t.completed);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
            <div className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 shadow-xl">
                <h3 className="font-bold mb-3">Select Dependency</h3>
                <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                    {availableTasks.length === 0 ? (
                        <p className="text-sm text-[var(--color-text-secondary)]">No available tasks to depend on.</p>
                    ) : (
                        availableTasks.map(t => (
                            <button
                                key={t.id}
                                onClick={() => onSelect(t.id)}
                                className="w-full text-left p-2 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary-hover)] text-sm truncate"
                            >
                                {t.text}
                            </button>
                        ))
                    )}
                </div>
                <div className="flex justify-between">
                    <button
                        onClick={() => onSelect(null)}
                        className="text-xs text-rose-400 hover:underline"
                    >
                        Clear Dependency
                    </button>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-lg bg-[var(--color-bg-secondary-hover)] text-xs"
                    >
                        Close
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
