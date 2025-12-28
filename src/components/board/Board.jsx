import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext } from '@hello-pangea/dnd';
import { io } from 'socket.io-client';
import { createTaskAsync, fetchBoardTasks, localTaskMove, taskUpdated, updateTaskAsync, taskDeleted } from '../../redux/slices/taskSlice';
import { fetchProjectBoards, fetchProjectById, updateProject } from '../../redux/slices/projectSlice';
import { fetchAllUsers } from '../../redux/slices/userSlice';
import Column from './Column';
import ProjectDetails from '../layout/ProjectDetails';
import ProjectOverview from '../project/ProjectOverview';
import ProjectModal from '../layout/ProjectModal';
import {
    Plus,
    Search,
    Filter,
    Layout as LayoutIcon,
    List,
    Calendar,
    Share2,
    CalendarDays,
    Settings,
    Bell,
    Mail,
    Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const socket = io('http://localhost:5000');

const Board = () => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const { tasks } = useSelector((state) => state.tasks);
    const { projects, boards, currentProject } = useSelector((state) => state.projects);
    const { users } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);

    const project = (currentProject?._id === projectId) ? currentProject : projects.find(p => p._id === projectId);

    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('home');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMemberMenuOpen, setIsMemberMenuOpen] = useState(false);
    const menuRef = React.useRef(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMemberMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initial Fetch
    useEffect(() => {
        if (projectId) {
            dispatch(fetchProjectById(projectId));
            dispatch(fetchProjectBoards(projectId));
            dispatch(fetchAllUsers());
            socket.emit('join_project', projectId);
        }

        socket.on('task_created', (data) => {
            dispatch(taskUpdated(data));
        });

        socket.on('task_updated', (data) => {
            dispatch(taskUpdated(data));
        });

        socket.on('task_deleted', (data) => {
            dispatch(taskDeleted(data));
        });

        return () => {
            socket.off('task_created');
            socket.off('task_updated');
            socket.off('task_deleted');
            socket.emit('leave_project', projectId);
        };
    }, [projectId, dispatch]);

    // Fetch Tasks when Board is available
    const activeBoard = boards && boards.length > 0 ? boards[0] : null;

    useEffect(() => {
        if (activeBoard) {
            dispatch(fetchBoardTasks(activeBoard._id));
        }
    }, [activeBoard, dispatch]);

    // Compute tasksByColumn
    const tasksByColumn = useMemo(() => {
        if (!activeBoard || !activeBoard.columns) return {};
        console.log('--- RECOMPUTING TASKS BY COLUMN ---');
        console.log('Total tasks in store:', tasks?.length);

        const grouped = {};
        activeBoard.columns.forEach(col => {
            grouped[col._id.toString()] = [];
        });

        let filteredTasks = tasks || [];
        const trimmedSearch = searchTerm.trim().toLowerCase();
        if (trimmedSearch) {
            filteredTasks = filteredTasks.filter(t =>
                t.title?.toLowerCase().includes(trimmedSearch) ||
                t.description?.toLowerCase().includes(trimmedSearch)
            );
        }

        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);
        }

        console.log('Filtered tasks count:', filteredTasks.length);

        filteredTasks.forEach(task => {
            const cid = task.columnId?.toString();
            if (grouped[cid]) {
                grouped[cid].push(task);
            } else {
                console.warn('Task found with unknown columnId:', task._id, cid);
            }
        });

        Object.keys(grouped).forEach(key => { grouped[key].sort((a, b) => a.order - b.order); });
        return grouped;
    }, [tasks, activeBoard, searchTerm, priorityFilter]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Project link copied to clipboard!');
    };

    const handleStatusUpdate = (newStatus) => {
        dispatch(updateProject({ id: projectId, data: { status: newStatus } }));
    };

    const handleAddMember = (userId) => {
        if (project?.members?.some(m => (m.user?._id || m.user) === userId)) return;

        const currentMemberData = project?.members?.map(m => ({
            user: m.user?._id || m.user,
            role: m.role
        })) || [];

        const updatedMembers = [...currentMemberData, { user: userId, role: 'member' }];
        dispatch(updateProject({ id: projectId, data: { members: updatedMembers } }));
        setIsMemberMenuOpen(false);
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const sourceCol = activeBoard.columns.find(c => c._id === source.droppableId);
        if (sourceCol?.title === 'Done') {
            console.log("Record Locked: Finalized tasks cannot be moved.");
            return;
        }

        const destCol = activeBoard.columns.find(c => c._id === destination.droppableId);
        const updateData = {
            columnId: destination.droppableId,
            order: destination.index
        };

        // If moving to Done, automatically finalize the status
        if (destCol?.title === 'Done') {
            updateData.status = 'done';
        }

        // Update local state for immediate feedback
        dispatch(localTaskMove({
            taskId: draggableId,
            newColumnId: destination.droppableId,
            newOrder: destination.index
        }));

        // Persist to database
        dispatch(updateTaskAsync({
            id: draggableId,
            data: updateData
        }));
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsDetailsOpen(true);
    };

    const handleAddTask = (columnTitle, title) => {
        console.log('handleAddTask called with:', { columnTitle, title });
        if (!activeBoard) {
            console.error('No active board found!');
            return;
        }
        const column = activeBoard.columns.find(c => c.title.toLowerCase() === columnTitle.toLowerCase());
        if (!column) {
            console.error('Column not found for title:', columnTitle);
            return;
        }

        console.log('Creating task for column:', column._id);
        dispatch(createTaskAsync({
            title,
            project: projectId,
            board: activeBoard._id,
            columnId: column._id,
            order: (tasksByColumn[column._id]?.length || 0)
        }));
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-700">
            {/* Task Details Modal */}
            <AnimatePresence>
                {isDetailsOpen && (
                    <ProjectDetails
                        isOpen={isDetailsOpen}
                        onClose={() => setIsDetailsOpen(false)}
                        task={selectedTask}
                        projectMembers={project?.members}
                        projectId={projectId}
                        projectTitle={project?.name}
                    />
                )}
            </AnimatePresence>

            {/* Edit Project Modal */}
            <ProjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                projectToEdit={project}
            />

            {/* Consolidated Smart Control Bar */}
            <div className="flex items-center justify-between gap-1 bg-white/90 backdrop-blur-xl p-2 rounded-[2rem] border border-white/50 shadow-lg mb-6 relative z-50 sticky top-0 mx-2 overflow-visible">
                <div className="flex items-center gap-1">
                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/30 gap-1">
                        <button
                            onClick={() => setActiveTab('home')}
                            className={`p-2 rounded-xl transition-all ${activeTab === 'home' ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-black'}`}
                        >
                            <Home size={16} />
                        </button>
                        <button
                            onClick={() => setActiveTab('board')}
                            className={`p-2 rounded-xl transition-all ${activeTab === 'board' ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:text-black'}`}
                        >
                            <LayoutIcon size={16} />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block" />

                    {/* Team Preview */}
                    <div className="hidden sm:flex -space-x-1.5 items-center">
                        {project?.members?.slice(0, 3).map((m, i) => (
                            <img
                                key={m.user?._id || i}
                                src={m.user?.avatar || `https://ui-avatars.com/api/?name=${m.user?.name}&background=121212&color=fff`}
                                className="w-7 h-7 rounded-lg border-2 border-white shadow-sm"
                                alt=""
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search - Icon centric for mobile */}
                    <div className="relative flex items-center group">
                        <Search size={14} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Locate..."
                            className="bg-transparent text-[9px] font-black uppercase tracking-tight w-0 group-hover:w-20 md:group-hover:w-32 focus:w-20 md:focus:w-32 transition-all ml-1 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsMemberMenuOpen(!isMemberMenuOpen);
                                }}
                                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isMemberMenuOpen ? 'bg-black text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                            >
                                <Plus size={12} /> <span>Invite</span>
                            </button>

                            <AnimatePresence>
                                {isMemberMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute top-12 right-0 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[110] p-4 ring-1 ring-black/5"
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invite Node</h4>
                                            <button onClick={() => setIsMemberMenuOpen(false)}>
                                                <X size={14} className="text-slate-300 hover:text-black" />
                                            </button>
                                        </div>
                                        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                            {users?.filter(u => !project?.members?.some(m => m.user?._id === u._id)).map(user => (
                                                <button
                                                    key={user._id}
                                                    onClick={() => handleAddMember(user._id)}
                                                    className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 text-left transition-all"
                                                >
                                                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=121212&color=fff`} className="w-8 h-8 rounded-xl" alt="" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-900 uppercase">{user.name}</p>
                                                        <p className="text-[7px] text-slate-400 font-bold uppercase">{user.designation || 'Active Node'}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="w-10 h-10 bg-black text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                            title="Edit Project"
                        >
                            <Settings size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {/* Project Overview Tab */}
                {activeTab === 'home' && (
                    <div className="h-full animate-in fade-in zoom-in-95 duration-500">
                        <ProjectOverview project={project} onEdit={() => setIsEditModalOpen(true)} />
                    </div>
                )}

                {/* Kanban Board Tab */}
                {activeTab === 'board' && (
                    <div className="h-full overflow-x-auto pb-6 custom-scrollbar scroll-smooth animate-in fade-in zoom-in-95 duration-500">
                        {activeBoard ? (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="flex gap-10 h-full min-w-max px-2">
                                    {activeBoard.columns.map((column) => (
                                        <Column
                                            key={column._id}
                                            columnId={column._id}
                                            title={column.title} // Pass title if existing Column supports it (It likely expects tasks only? Need to check Column props)
                                            tasks={tasksByColumn[column._id] || []}
                                            onTaskClick={handleTaskClick}
                                            onAddTask={handleAddTask}
                                        />
                                    ))}

                                </div>
                            </DragDropContext>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-slate-400 font-bold text-center">
                                    <Settings className="animate-spin mx-auto mb-2 opacity-20" size={32} />
                                    Initialising Experience...
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Board;
