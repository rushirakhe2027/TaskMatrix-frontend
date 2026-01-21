import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Flag, Calendar, Hash, MessageSquare, History, Send, Save, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
// AnimatePresence is imported but not used in JSX here yet.
// If needed, use SafeAnimatePresence pattern from Board.jsx.
import { useDispatch, useSelector } from 'react-redux';
import { updateTaskAsync } from '../../redux/slices/taskSlice';
import { fetchProjectMessages, sendMessageAsync, addMessage } from '../../redux/slices/messageSlice';
import { io } from '../../utils/socketMock'; // Use Mock Socket for Vercel

const socket = io();

const ProjectDetails = ({ isOpen, onClose, task, projectMembers = [], projectId, projectTitle }) => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { currentMessages } = useSelector((state) => state.messages);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [status, setStatus] = useState('todo');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('General');
    const [assigneeId, setAssigneeId] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const chatEndRef = useRef(null);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'medium');
            setStatus(task.status || 'todo');

            if (task.dueDate) {
                const date = new Date(task.dueDate);
                setDueDate(date.toISOString().split('T')[0]);
            } else {
                setDueDate('');
            }
            setCategory(task.category || 'General');
            setAssigneeId(task.assignees?.[0]?._id || task.assignees?.[0] || '');
        }
    }, [task]);

    useEffect(() => {
        if (isOpen && projectId) {
            dispatch(fetchProjectMessages(projectId));
            socket.emit('join_project_chat', projectId);

            socket.on('new_project_message', (msg) => {
                dispatch(addMessage(msg));
            });

            return () => {
                socket.emit('leave_project_chat', projectId);
                socket.off('new_project_message');
            };
        }
    }, [isOpen, projectId, dispatch]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    if (!isOpen || !task) {
        console.log('ProjectDetails: Not rendering. isOpen:', isOpen, 'task:', !!task);
        return null;
    }
    console.log('ProjectDetails: Rendering task:', task?._id);

    const handleSave = async () => {
        setIsSaving(true);
        const data = {
            title,
            description,
            priority,
            status,
            category,
            dueDate: dueDate || null,
            assignees: assigneeId ? [assigneeId] : []
        };

        try {
            await dispatch(updateTaskAsync({ id: task._id, data })).unwrap();
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
        } catch (err) {
            console.error('Failed to save task:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !projectId) return;
        dispatch(sendMessageAsync({
            project: projectId,
            text: newMessage
        }));
        setNewMessage('');
    };

    const deadlineDate = dueDate ? new Date(dueDate) : null;
    const daysLeft = deadlineDate ? Math.ceil((deadlineDate - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)) : null;
    const isLocked = task?.status === 'done';

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-end">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white h-full w-full max-w-5xl shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden"
            >
                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-slate-50/30">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-8">
                        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="text-[#1e1e1e]">Task Lab</span>
                            <ChevronRight size={14} />
                            <span>{isLocked ? 'Archived Record' : 'Edit Mode'}</span>
                        </nav>

                        <div className="flex items-center gap-3">
                            {!isLocked && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${showSaveSuccess ? 'bg-emerald-500 text-white' : 'bg-[#1e1e1e] text-white hover:scale-105 active:scale-95'}`}
                                >
                                    {showSaveSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
                                    {isSaving ? 'Saving...' : showSaveSuccess ? 'Saved' : 'Save Changes'}
                                </button>
                            )}
                            {isLocked && (
                                <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-slate-100 text-slate-400 border border-slate-200">
                                    <Lock size={16} />
                                    Read Only
                                </div>
                            )}
                            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Innovation Title */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        {isEditingTitle ? (
                            <input
                                autoFocus
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onBlur={() => setIsEditingTitle(false)}
                                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                className="text-4xl font-black text-slate-900 tracking-tight bg-white border-none p-3 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#1e1e1e] w-full max-w-2xl"
                            />
                        ) : (
                            <h2
                                onClick={() => !isLocked && setIsEditingTitle(true)}
                                className={`text-4xl font-black text-slate-900 tracking-tight leading-tight max-w-2xl p-3 -m-3 rounded-2xl transition-all w-full ${!isLocked ? 'cursor-text hover:bg-white' : ''}`}
                            >
                                {title || "Untitled Task"}
                            </h2>
                        )}

                        <select
                            value={status}
                            disabled={isLocked}
                            onChange={(e) => setStatus(e.target.value)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-sm font-black text-xs uppercase tracking-widest focus:ring-0 ${status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : status === 'in-progress' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-white text-slate-600 border-slate-200'} ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                        >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                            <option value="backlog">Backlog</option>
                        </select>
                    </div>

                    {/* Metadata Selection Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10 border-b border-slate-100 mb-10">
                        {/* Category Selection */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</p>
                            <div className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all ${!isLocked ? 'hover:border-brand-400' : 'opacity-70'}`}>
                                <select
                                    value={category}
                                    disabled={isLocked}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className={`w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <option value="General">General</option>
                                    <option value="UI/UX Design">UI/UX Design</option>
                                    <option value="Development">Development</option>
                                    <option value="Research">Research</option>
                                    <option value="Task">Task</option>
                                    <option value="Marketing">Marketing</option>
                                </select>
                            </div>
                        </div>

                        {/* Assignee Selection */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignee</p>
                            <div className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all ${!isLocked ? 'hover:border-[#1e1e1e]' : 'opacity-70'}`}>
                                <select
                                    value={assigneeId}
                                    disabled={isLocked}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className={`w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <option value="">Unassigned</option>
                                    {projectMembers.map((member) => (
                                        <option key={member.user?._id} value={member.user?._id}>
                                            {member.user?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Date</p>
                            <div className={`relative bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 transition-all ${!isLocked ? 'hover:border-blue-400' : 'opacity-70'}`}>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Calendar size={18} />
                                </div>
                                <input
                                    type="date"
                                    value={dueDate}
                                    disabled={isLocked}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className={`flex-1 bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                />
                                {daysLeft !== null && (
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${daysLeft < 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                        {daysLeft < 0 ? 'OLD' : `${daysLeft}D`}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Priority Toggle */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</p>
                            <div className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all ${!isLocked ? 'hover:border-rose-400' : 'opacity-70'}`}>
                                <select
                                    value={priority}
                                    disabled={isLocked}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className={`w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer uppercase'}`}
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Full-width Description Editor */}
                    <div className="space-y-5 mb-12 relative">
                        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 tracking-tight">
                            <Hash size={20} className="text-[#1e1e1e]" />
                            Task Notes
                            {isLocked && <Lock size={14} className="text-slate-400 ml-2 animate-pulse" />}
                        </h3>
                        <textarea
                            value={description}
                            readOnly={isLocked}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-600 leading-relaxed font-bold text-sm focus:ring-2 focus:ring-[#1e1e1e] min-h-[250px] resize-none transition-all placeholder:text-slate-300 ${isLocked ? 'opacity-80 bg-slate-50/50' : ''}`}
                            placeholder={isLocked ? "This record is locked and cannot be edited." : "Draft your task strategy here..."}
                        />
                    </div>
                </div>

                {/* Right Sidebar - Chat Room */}
                <div className="w-full md:w-[400px] border-l border-slate-100 bg-white flex flex-col shadow-2xl">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic truncate max-w-[280px]">
                                {projectTitle || 'Project Chat'}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Signals</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <History size={18} />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/10 text-[11px]">
                        {currentMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-20">
                                <MessageSquare size={48} className="mb-4" />
                                <p className="font-black uppercase tracking-widest">No signals</p>
                            </div>
                        ) : (
                            currentMessages.map((msg, idx) => {
                                const isMine = msg.sender?._id === currentUser?._id;
                                return (
                                    <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-full`}>
                                        {!isMine && (
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1">{msg.sender?.name}</span>
                                        )}
                                        <div className={`px-4 py-3 rounded-2xl shadow-sm font-bold leading-relaxed break-words max-w-[90%] ${isMine ? 'bg-[#1e1e1e] text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100">
                        <div className="relative flex items-center gap-2">
                            <textarea
                                className="w-full bg-slate-100 border-none rounded-2xl p-4 pr-12 text-xs font-bold resize-none focus:ring-2 focus:ring-[#1e1e1e] transition-all"
                                placeholder="Send signal..."
                                rows="1"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className={`absolute right-2 bottom-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${newMessage.trim() ? 'bg-[#1e1e1e] text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectDetails;
