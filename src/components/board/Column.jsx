import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { MoreHorizontal, Plus } from 'lucide-react';

const Column = ({ columnId, title, tasks, onTaskClick, onAddTask }) => {
    const displayTitle = title || 'Section';
    const lowerTitle = displayTitle.toLowerCase();

    const colors = {
        'to do': { dot: 'bg-slate-300' },
        'in progress': { dot: 'bg-[#121212]' },
        'done': { dot: 'bg-emerald-500' },
        'backlog': { dot: 'bg-rose-500' }
    };

    const style = colors[lowerTitle] || colors['to do'];

    const [isAdding, setIsAdding] = React.useState(false);
    const [newTaskTitle, setNewTaskTitle] = React.useState('');

    const handleQuickAdd = () => {
        if (newTaskTitle.trim()) {
            onAddTask(displayTitle, newTaskTitle);
            setNewTaskTitle('');
            setIsAdding(false);
        }
    };

    return (
        <div className="w-[300px] flex flex-col h-full group">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${style.dot} shadow-sm`} />
                    <h2 className="font-black text-[11px] text-slate-800 tracking-wider uppercase italic">
                        {displayTitle}
                    </h2>
                    <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded-lg text-[9px] font-black border border-slate-100 italic">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-400 hover:text-black transition-all"
                    >
                        <Plus size={14} />
                    </button>
                    <button className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-slate-400 hover:text-black transition-all">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            {/* Task List Container */}
            <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar pb-10 transition-colors duration-300 rounded-2xl ${snapshot.isDraggingOver ? 'bg-slate-50/50 outline-dashed outline-2 outline-slate-200' : ''}`}
                    >
                        {tasks.map((task, index) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                index={index}
                                onClick={() => onTaskClick(task)}
                            />
                        ))}
                        {provided.placeholder}

                        {/* Quick Add Task */}
                        {isAdding ? (
                            <div className="bg-white p-3 rounded-xl border border-black shadow-xl animate-in zoom-in-95 duration-200">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Task identity..."
                                    className="w-full bg-slate-50 border-none rounded-lg text-[10px] font-bold p-2 mb-2 focus:ring-1 focus:ring-black transition-all outline-none italic"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                                />
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={handleQuickAdd}
                                        className="flex-1 py-1.5 bg-[#121212] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all italic"
                                    >
                                        Execute
                                    </button>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all italic"
                                    >
                                        Void
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-dashed border-slate-200 text-slate-300 hover:border-black hover:text-black hover:bg-white transition-all text-[9px] font-black uppercase tracking-widest bg-white/30 italic"
                            >
                                <Plus size={14} />
                                Initialize Unit
                            </button>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default Column;
