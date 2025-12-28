import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    MoreVertical,
    Calendar,
    Flag,
    CheckSquare,
    Paperclip,
    Plus,
    Filter,
    History,
    MessageCircle,
    Download,
    CloudUpload,
    Mail,
    Send,
    X,
    FileText,
    Image as ImageIcon
} from 'lucide-react';
import { updateProject, fetchProjectById } from '../../redux/slices/projectSlice';
import { fetchProjectMessages, sendMessageAsync, addMessage } from '../../redux/slices/messageSlice';
import { io } from '../../utils/socketMock'; // Use Mock Socket for Vercel

const socket = io();

const ProjectOverview = ({ project, onEdit }) => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { currentMessages } = useSelector((state) => state.messages);

    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [newMilestone, setNewMilestone] = useState('');
    const [showMilestoneInput, setShowMilestoneInput] = useState(false);

    const chatEndRef = useRef(null);

    useEffect(() => {
        if (project?._id) {
            dispatch(fetchProjectMessages(project._id));
            socket.emit('join_project_chat', project._id);

            socket.on('new_project_message', (msg) => {
                dispatch(addMessage(msg));
            });

            return () => {
                socket.emit('leave_project_chat', project._id);
                socket.off('new_project_message');
            };
        }
    }, [project?._id, dispatch]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        dispatch(sendMessageAsync({
            project: project._id,
            text: newMessage
        }));
        setNewMessage('');
    };

    const handleAddMilestone = async () => {
        if (!newMilestone.trim()) return;
        try {
            await API.post(`/projects/${project._id}/milestones`, { text: newMilestone });
            dispatch(fetchProjectById(project._id));
            setNewMilestone('');
            setShowMilestoneInput(false);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleMilestone = async (milestoneId, completed) => {
        try {
            await API.patch(`/projects/${project._id}/milestones/${milestoneId}`, { completed: !completed });
            dispatch(fetchProjectById(project._id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setIsUploading(true);

        try {
            await API.post(`/projects/${project._id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            dispatch(fetchProjectById(project._id));
        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const deadlineDate = project?.deadline ? new Date(project.deadline) : null;
    const daysLeft = deadlineDate
        ? Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24))
        : null;

    const otherMembers = project?.members?.filter(m => m.user?._id !== currentUser?._id) || [];
    const hasMembers = otherMembers.length > 0;

    const handleStatusUpdate = (status) => {
        if (status === 'completed' && (project?.paidAmount || 0) < (project?.price || 0)) {
            alert(`Financial Lock: Project cannot be finalized until the full budget (${formatCurrency(project?.price)}) is paid. Current: ${formatCurrency(project?.paidAmount)}`);
            return;
        }
        dispatch(updateProject({ id: project._id, data: { status } }));
    };

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 h-full overflow-x-hidden overflow-y-auto lg:overflow-hidden pb-20 lg:pb-6 custom-scrollbar">
            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-auto lg:h-full lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar">
                <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">{project?.name}</h2>
                        </div>

                        {/* Functional Status Toggle */}
                        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl gap-1 shadow-sm border border-slate-200/50">
                            <button
                                onClick={() => handleStatusUpdate('active')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${project?.status === 'active' ? 'bg-white text-emerald-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                In Progress
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('completed')}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${project?.status === 'completed' ? 'bg-[#1e1e1e] text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Completed
                            </button>
                        </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-slate-50">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-3">Owner</p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-[1.2rem] p-1 border border-slate-100 shadow-sm">
                                    <img
                                        alt={project?.owner?.name}
                                        className="w-full h-full rounded-[0.8rem] object-cover"
                                        src={project?.owner?.avatar || `https://ui-avatars.com/api/?name=${project?.owner?.name || project?.owner?.email || 'User'}&background=1e1e1e&color=fff`}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{project?.owner?.name || 'Admin'}</p>
                                    <p className="text-xs text-slate-400 font-bold">Project Admin</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-3">Deadline</p>
                            <div className="flex items-center gap-3 h-12">
                                <div className="w-12 h-12 rounded-[1.2rem] bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                    <Calendar size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-black text-slate-900">
                                        {deadlineDate ? deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                                    </p>
                                    {daysLeft !== null && (
                                        <p className={`text-xs font-bold ${daysLeft < 5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {daysLeft > 0 ? `${daysLeft} Days Left` : 'Overdue'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-3">Financials</p>
                            <div className="flex items-center gap-2 h-12">
                                <div className="flex flex-col">
                                    <p className="text-sm font-black text-slate-900">{formatCurrency(project?.price)}</p>
                                    <p className="text-xs text-slate-400 font-bold">Total Budget</p>
                                </div>
                                <div className="w-px h-8 bg-slate-100 mx-2"></div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-black text-emerald-600">{formatCurrency(project?.paidAmount)}</p>
                                    <p className="text-xs text-emerald-600/60 font-bold">Paid</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="pt-10 space-y-4 border-b border-slate-50 pb-10">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
                            Description
                        </h3>
                        <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed font-medium">
                            <p>{project?.description || "No description provided for this project."}</p>
                        </div>
                    </div>

                    {/* Milestones / Checklist */}
                    <div className="pt-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
                                <CheckSquare size={20} className="text-slate-400" />
                                Key Milestones
                            </h3>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                                {project?.milestones?.filter(t => t.completed).length || 0}/{project?.milestones?.length || 0} Done
                            </span>
                        </div>
                        <div className="space-y-3">
                            {(!project?.milestones || project.milestones.length === 0) && !showMilestoneInput ? (
                                <p className="text-slate-400 text-sm font-medium italic p-10 text-center border-4 border-dashed border-slate-50 rounded-[2.5rem] bg-slate-50/30">
                                    No milestones added yet. Start by defining major goals.
                                </p>
                            ) : (
                                project?.milestones?.map((milestone) => (
                                    <label key={milestone._id} className="flex items-center gap-4 p-5 rounded-[1.8rem] border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer group bg-white shadow-sm ring-inset hover:ring-2 hover:ring-slate-100/50">
                                        <input
                                            type="checkbox"
                                            checked={milestone.completed}
                                            onChange={() => toggleMilestone(milestone._id, milestone.completed)}
                                            className="w-6 h-6 rounded-xl border-slate-300 text-[#1e1e1e] focus:ring-[#1e1e1e] cursor-pointer"
                                        />
                                        <span className={`text-sm font-black tracking-tight ${milestone.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                            {milestone.text}
                                        </span>
                                    </label>
                                ))
                            )}

                            {showMilestoneInput ? (
                                <div className="flex gap-3 p-2 bg-slate-100 rounded-[1.5rem] animate-in slide-in-from-top-2 duration-300">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="What needs to be done?"
                                        className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-[#1e1e1e]"
                                        value={newMilestone}
                                        onChange={(e) => setNewMilestone(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
                                    />
                                    <button
                                        onClick={handleAddMilestone}
                                        className="px-6 bg-[#1e1e1e] text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setShowMilestoneInput(false)}
                                        className="p-3 bg-white text-slate-400 rounded-xl"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowMilestoneInput(true)}
                                    className="w-full py-5 rounded-[1.8rem] border-4 border-dashed border-slate-50 text-slate-400 font-black hover:text-[#1e1e1e] hover:border-slate-200 hover:bg-slate-50/50 transition-all text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    <Plus size={18} /> Add Milestone
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attachments Section */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
                            <Paperclip size={20} className="text-slate-400" />
                            Attachments
                            <span className="text-sm text-slate-400 font-bold bg-slate-50 px-2.5 py-1 rounded-xl">{project?.attachments?.length || 0}</span>
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {project?.attachments?.map((file, idx) => (
                            <div key={idx} className="group relative rounded-[2rem] border border-slate-100 p-4 transition-all hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1">
                                <div className="aspect-square rounded-2xl bg-slate-100 flex items-center justify-center mb-4 overflow-hidden relative">
                                    {file.fileType?.includes('image') ? (
                                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText size={40} className="text-slate-300" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all gap-2">
                                        <a href={file.url} download className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1e1e1e] hover:scale-110 active:scale-95 transition-all">
                                            <Download size={18} />
                                        </a>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-slate-900 truncate px-1 uppercase tracking-wider">{file.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 px-1">{new Date(file.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}

                        <label className="rounded-[2rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center gap-3 hover:border-[#1e1e1e] hover:bg-slate-50 transition-all group p-6 min-h-[160px] cursor-pointer relative overflow-hidden">
                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <MoreVertical className="animate-spin text-slate-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Uploading...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-300 group-hover:text-[#1e1e1e] transition-all group-hover:scale-110">
                                        <CloudUpload size={24} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 group-hover:text-[#1e1e1e] uppercase tracking-widest">Share Files</span>
                                </>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Team Chat */}
            <div className="col-span-12 lg:col-span-4 flex flex-col min-h-[400px] lg:h-full">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white z-10 sticky top-0">
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight text-lg mb-1 italic uppercase">{hasMembers ? 'Sync Center' : 'System Log'}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${hasMembers ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                {hasMembers ? 'Real-time Stream' : 'Encrypted Space'}
                            </p>
                        </div>
                        {hasMembers && (
                            <div className="flex -space-x-2">
                                {otherMembers.slice(0, 3).map(m => (
                                    <img
                                        key={m.user?._id}
                                        src={m.user?.avatar || `https://ui-avatars.com/api/?name=${m.user?.name}&background=random`}
                                        className="w-9 h-9 rounded-xl border-4 border-white shadow-md ring-1 ring-slate-100"
                                        alt="member"
                                    />
                                ))}
                                {otherMembers.length > 3 && (
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-500 shadow-md">
                                        +{otherMembers.length - 3}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
                        {currentMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6 text-slate-100 border border-slate-100">
                                    <MessageCircle size={32} />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">{hasMembers ? 'No messages' : 'Solo Mode'}</h4>
                                <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-[200px]">
                                    {hasMembers ? 'Start the conversation with your team' : 'Invite members to unlock real-time collaboration.'}
                                </p>
                            </div>
                        ) : (
                            currentMessages.map((msg, idx) => {
                                const isMine = msg.sender?._id === currentUser?._id;
                                return (
                                    <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-full animate-in slide-in-from-bottom-2`}>
                                        {!isMine && (
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1">{msg.sender?.name}</span>
                                        )}
                                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-[11px] font-black leading-relaxed break-words max-w-[85%] ${isMine ? 'bg-[#121212] text-white rounded-tr-none shadow-lg' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                                            {msg.text}
                                            <div className="flex justify-end mt-1 opacity-30">
                                                <span className="text-[7px] uppercase tracking-tighter">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-8 bg-slate-50/50 border-t border-slate-50">
                        <div className="relative flex items-center gap-3">
                            <div className="flex-1 relative">
                                <textarea
                                    className={`w-full bg-white border border-slate-100 rounded-2xl p-4 pr-12 text-[11px] focus:ring-1 focus:ring-black focus:border-black text-slate-900 font-bold resize-none shadow-sm transition-all placeholder:text-slate-300 outline-none ${!hasMembers ? 'opacity-50' : ''}`}
                                    placeholder={hasMembers ? "Broadcast a message..." : "Sync disabled - No nodes active"}
                                    rows="1"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    disabled={!hasMembers}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!hasMembers || !newMessage.trim()}
                                    className={`absolute right-2 top-2 w-8 h-8 ${hasMembers && newMessage.trim() ? 'bg-black text-white shadow-lg' : 'bg-slate-50 text-slate-300'} rounded-xl flex items-center justify-center transition-all active:scale-95`}
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectOverview;
