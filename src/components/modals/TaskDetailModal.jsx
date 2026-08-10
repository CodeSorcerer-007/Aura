import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, LinkIcon } from '../icons/Icons';
import { getFile } from '../../utils/db';

export const TaskDetailModal = ({ isOpen, onClose, task, onSave, onSetDependency, allTasks, onAddAttachment, onDeleteAttachment }) => {
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');
    const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
    const [attachmentURLs, setAttachmentURLs] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        let localUrls = {};
        if(task) {
            setText(task.text);
            setNotes(task.notes || '');
            setTags((task.tags || []).join(', '));
            
            const attachmentPromises = (task.attachments || []).map(async (att) => {
                const fileBlob = await getFile(att.id);
                if (fileBlob && isMounted) {
                    localUrls[att.id] = URL.createObjectURL(fileBlob);
                }
            });
            Promise.all(attachmentPromises).then(() => {
                if (isMounted) setAttachmentURLs(localUrls);
            });

            return () => {
                isMounted = false;
                Object.values(localUrls).forEach(url => URL.revokeObjectURL(url));
            }
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const handleSave = () => {
        const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSave(task.id, text, notes, parsedTags);
        onClose();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onAddAttachment(task.id, file);
        }
    };

    const dependencyTask = allTasks.find(t => t.id === task.dependsOn);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
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
                            className="w-full bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)]"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold mb-1">Notes</label>
                        <textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            rows="4"
                            placeholder="Add extra context, links, or sub-goals..."
                            className="w-full bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Tags (comma separated)</label>
                        <input 
                            type="text" 
                            value={tags} 
                            onChange={(e) => setTags(e.target.value)} 
                            placeholder="work, projectA, urgent"
                            className="w-full bg-[var(--color-bg)] p-2 rounded-lg border border-[var(--color-border)]"
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

                     <div>
                        <label className="block text-sm font-semibold mb-1">Attachments</label>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button onClick={() => fileInputRef.current.click()} className="text-xs bg-[var(--color-bg)] p-2 rounded-lg w-full text-center hover:bg-[var(--color-bg-secondary-hover)] mb-2">Add File Attachment</button>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {(task.attachments || []).map(att => (
                                <div key={att.id} className="flex items-center justify-between bg-[var(--color-bg)] p-2 rounded-lg text-sm">
                                    <a href={attachmentURLs[att.id]} download={att.name} target="_blank" rel="noopener noreferrer" className="truncate hover:underline max-w-[200px]">{att.name}</a>
                                    <button onClick={() => onDeleteAttachment(task.id, att)} className="text-rose-400 text-xs"><XIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
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
