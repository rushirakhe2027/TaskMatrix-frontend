import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
    Clock,
    MessageSquare,
    Paperclip,
    Flag,
    CheckCircle2,
    Lock
} from 'lucide-react';

const TaskCard = ({ task, index, onClick }) => {
    const isDone = task.status === 'done';

    const priorityColors = {
        urgent: 'bg-rose-50 text-rose-600 border-rose-100',
        high: 'bg-orange-50 text-orange-600 border-orange-100',
        medium: 'bg-blue-50 text-blue-600 border-blue-100',
        low: 'bg-slate-50 text-slate-400 border-slate-100'
    };

    const deadlineDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = deadlineDate && deadlineDate < new Date() && !isDone;

    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    className={`
                        bg-white p-4 rounded-xl border border-slate-100 shadow-sm group
                        hover:shadow-md hover:border-slate-200 transition-all cursor-pointer relative
                        ${snapshot.isDragging ? 'shadow-2xl border-black rotate-2 z-50' : ''}
                        ${isDone ? 'opacity-80' : ''}
                    `}
                >
                    {/* Lock Icon for Done Tasks */}
                    {isDone && (
                        <div className="absolute top-2 right-2 text-slate-300">
                            <Lock size={12} />
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {/* Tags / Priority */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${priorityColors[task.priority] || priorityColors.low}`}>
                                {task.priority}
                            </span>
                            {task.category && (
                                <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100 italic">
                                    {task.category}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h3 className={`text-[12px] font-black leading-tight tracking-tight italic uppercase ${isDone ? 'text-slate-400 line-through' : 'text-slate-900 line-clamp-2'}`}>
                            {task.title}
                        </h3>

                        {/* Description Preview */}
                        {task.description && !isDone && (
                            <p className="text-[10px] text-slate-400 font-medium line-clamp-1 opacity-60">
                                {task.description}
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3">
                                {task.dueDate && (
                                    <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${isOverdue ? 'text-rose-500' : 'text-slate-300'}`}>
                                        <Clock size={10} />
                                        <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                )}
                                {(task.attachments?.length > 0) && (
                                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-300">
                                        <Paperclip size={10} />
                                        <span>{task.attachments.length}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex -space-x-1.5">
                                {task.assignees?.slice(0, 2).map((member, i) => (
                                    <div key={member._id || i} className="w-6 h-6 rounded-lg border-2 border-white overflow-hidden shadow-sm bg-slate-100">
                                        <img
                                            src={member?.photo || member?.avatar ? (member?.photo?.startsWith('data:') || member?.photo?.startsWith('http') ? member.photo : (member?.avatar?.startsWith('data:') || member?.avatar?.startsWith('http') ? member.avatar : `https://task-matrix-backend.vercel.app/img/users/${member?.photo || member?.avatar}`)) : `https://ui-avatars.com/api/?name=${member?.name || 'User'}&background=121212&color=fff`}
                                            className="w-full h-full object-cover"
                                            alt="assignee"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
