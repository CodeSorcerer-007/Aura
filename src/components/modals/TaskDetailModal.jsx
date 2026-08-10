import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, LinkIcon } from '../icons/Icons';
import { getFile } from '../../utils/db';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import {
    isElectron, pickAndAttachFiles, openAttachment,
    deleteAttachmentFromDisk, formatFileSize, getFileIcon
} from '../../utils/electronBridge';

export const TaskDetailModal = ({ isOpen, onClose, task, onSave, onSetDependency, allTasks, onAddAttachment, onDeleteAttachment }) => {
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');
    const [estimatedMinutes, setEstimatedMinutes] = useState('');
    const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
    const [attachmentURLs, setAttachmentURLs] = useState({});
    const [isAttaching, setIsAttaching] = useState(false);
    const fileInputRef = useRef(null);
    const trapRef = useFocusTrap(isOpen);

    useEffect(() => {
        let isMounted = true;
        let localUrls = {};
        if (task) {
            setText(task.text);
            setNotes(task.notes || '');
            setTags((task.tags || []).join(', '));
            setEstimatedMinutes(task.estimatedMinutes ? String(task.estimatedMinutes) : '');

            // Only load blob URLs in browser mode (Electron uses paths)
            if (!isElectron()) {
                const attachmentPromises = (task.attachments || []).map(async (att) => {
                    const fileBlob = await getFile(att.id);
                    if (fileBlob && isMounted) {
                        localUrls[att.id] = URL.createObjectURL(fileBlob);
                    }
                });
                Promise.all(attachmentPromises).then(() => {
                    if (isMounted) setAttachmentURLs(localUrls);
                });
            }

            return () => {
                isMounted = false;
                Object.values(localUrls).forEach(url => URL.revokeObjectURL(url));
            };
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const handleSave = () => {
        const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        const mins = parseInt(estimatedMinutes, 10);
        onSave(task.id, text, notes, parsedTags, isNaN(mins) ? null : mins);
        onClose();
    };

    // Browser fallback: use file input
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await onAddAttachment(task.id, file);
        }
    };

    // Electron native: use dialog
    const handleNativeAttach = async () => {
        setIsAttaching(true);
        try {
            const attachments = await pickAndAttachFiles(task.id);
            if (attachments && attachments.length > 0) {
                for (const att of attachments) {
                    await onAddAttachment(task.id, att, true /* isNative */);
                }
            }
        } finally {
            setIsAttaching(false);
        }
    };

    const handleDeleteAttachment = async (att) => {
        await deleteAttachmentFromDisk(att);
        await onDeleteAttachment(task.id, att);
    };

    const handleOpenAttachment = async (att) => {
        if (isElectron() && att.path) {
            await openAttachment(att);
        } else if (attachmentURLs[att.id]) {
            const a = document.createElement('a');
            a.href = attachmentURLs[att.id];
            a.download = att.name;
            a.click();
        }
    };

    // Quick time estimate presets
    const timePresets = [
        { label: '15m', value: 15 },
        { label: '30m', value: 30 },
        { label: '1h', value: 60 },
        { label: '2h', value: 120 },
    ];

    const dependencyTask = allTasks.find(t => t.id === task.dependsOn);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <motion.div ref={trapRef} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold">Task Details</h2>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><XIcon className="w-6 h-6"/></button>
                </div>

                <div className="space-y-4">
                    {/* Task Name */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Task Name</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                    </div>

                    {/* Time Estimate */}
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

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="4"
                            placeholder="Add extra context, links, or sub-goals..."
                            className="w-full bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                    </div>

                    {/* Tags */}
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

                    {/* Dependencies */}
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

                    {/* Attachments */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">📎 Attachments</label>

                        {/* Attach button — native dialog in Electron, file input in browser */}
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
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all flex items-center justify-center gap-2 mb-3"
                                >
                                    + Attach Files (any type)
                                </button>
                            </>
                        )}

                        {/* Attachment list */}
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            <AnimatePresence>
                                {(task.attachments || []).map(att => (
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
                                ))}
                            </AnimatePresence>
                            {(task.attachments || []).length === 0 && (
                                <p className="text-xs text-[var(--color-text-secondary)] text-center py-2">No files attached yet</p>
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

// ── Dependency Selector (unchanged, kept inline) ──────────────────────────────
const DependencySelectorModal = ({ isOpen, onClose, currentTask, allTasks, onSelect }) => {
    const [search, setSearch] = useState('');
    const eligibleTasks = allTasks.filter(t => t.id !== currentTask.id && !t.completed);
    const filtered = eligibleTasks.filter(t => t.text.toLowerCase().includes(search.toLowerCase()));

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-4">
                <h3 className="text-lg font-bold mb-3">Select Dependency</h3>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                    autoFocus
                    className="w-full bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)] mb-3"
                />
                <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filtered.map(t => (
                        <button key={t.id} onClick={() => onSelect(t.id)} className="w-full text-left p-2 rounded-lg hover:bg-[var(--color-bg-secondary-hover)] text-sm">
                            {t.text}
                        </button>
                    ))}
                    {filtered.length === 0 && <p className="text-center text-sm text-[var(--color-text-secondary)] py-4">No matching tasks</p>}
                </div>
                <button onClick={onClose} className="mt-3 w-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Cancel</button>
            </motion.div>
        </motion.div>
    );
};
