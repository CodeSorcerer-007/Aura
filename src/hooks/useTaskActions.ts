import { useTaskStore } from '../store/useTaskStore';

export function useTaskActions() {
    const addTask = useTaskStore(s => s.addTask);
    const toggleTask = useTaskStore(s => s.toggleTask);
    const deleteTask = useTaskStore(s => s.deleteTask);
    const archiveTask = useTaskStore(s => s.archiveTask);
    const restoreTask = useTaskStore(s => s.restoreTask);
    const saveTaskDetail = useTaskStore(s => s.saveTaskDetail);
    const setTaskDependency = useTaskStore(s => s.setTaskDependency);
    const addAttachmentToTask = useTaskStore(s => s.addAttachmentToTask);
    const deleteAttachmentFromTask = useTaskStore(s => s.deleteAttachmentFromTask);
    const reorderTask = useTaskStore(s => s.reorderTask);
    const toggleSubtask = useTaskStore(s => s.toggleSubtask);
    const togglePin = useTaskStore(s => s.togglePin);
    const logDistraction = useTaskStore(s => s.logDistraction);
    const setTasks = useTaskStore(s => s.setTasks);
    const saveTemplate = useTaskStore(s => s.saveTemplate);
    const updateTaskOrderAndSection = useTaskStore(s => s.updateTaskOrderAndSection);
    const setJournalEntries = useTaskStore(s => s.setJournalEntries);

    return {
        addTask,
        toggleTask,
        deleteTask,
        archiveTask,
        restoreTask,
        saveTaskDetail,
        setTaskDependency,
        addAttachmentToTask,
        deleteAttachmentFromTask,
        reorderTask,
        toggleSubtask,
        togglePin,
        logDistraction,
        setTasks,
        saveTemplate,
        updateTaskOrderAndSection,
        setJournalEntries,
    };
}
