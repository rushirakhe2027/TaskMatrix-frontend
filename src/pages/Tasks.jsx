import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTasks } from '../redux/slices/taskSlice';
import { CheckCircle2, Circle, Clock, MoreVertical, Plus, Filter, Search, Zap, Calendar, Flag, LayoutGrid, CheckCircle } from 'lucide-react';

const Tasks = () => {
    const dispatch = useDispatch();
    const { tasks, loading } = useSelector((state) => state.tasks);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchMyTasks());
    }, [dispatch]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;
            if (activeTab === 'completed') return task.status === 'done';
            if (activeTab === 'upcoming') return task.status !== 'done';
            return true;
        });
    }, [tasks, activeTab, searchTerm]);

    const stats = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.length - completed;
        const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
        return { completed, pending, completionRate };
    }, [tasks]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Work Assignments</h2>
                    <p className="text-slate-400 font-bold text-[8px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        Control Hub <span className="w-1 h-1 bg-slate-200 rounded-full" /> Execution Stream
                    </p>
                </div>
                <button className="px-5 py-2.5 bg-[#121212] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-[1.03] transition-all flex items-center gap-2 border border-white/10">
                    <Plus size={14} />
                    New Assignment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="bg-white border border-slate-100 p-1.5 rounded-xl shadow-sm flex items-center gap-1 w-fit">
                            {[
                                { id: 'upcoming', label: 'Active' },
                                { id: 'completed', label: 'Finished' },
                                { id: 'all', label: 'Journal' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#121212] text-white shadow-md' : 'text-slate-400 hover:text-black'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Locate task..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-[9px] font-bold focus:ring-1 focus:ring-black outline-none w-full md:w-48 placeholder:text-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {loading ? (
                            <div className="flex justify-center p-16">
                                <div className="w-6 h-6 border-2 border-slate-200 border-t-black rounded-full animate-spin" />
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                <p className="text-slate-300 font-bold uppercase tracking-widest text-[9px]">Zero Results Found</p>
                            </div>
                        ) : (
                            filteredTasks.map((task, i) => (
                                <div key={task._id} className="bg-white border border-slate-50 p-4 rounded-xl hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-black">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${task.status === 'done' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                                            {task.status === 'done' ? <CheckCircle size={18} /> : <Circle size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-black text-sm tracking-tight truncate uppercase italic ${task.status === 'done' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>{task.title}</h3>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{task.project?.name || 'Workspace Unit'}</p>
                                        </div>
                                        <div className="hidden md:flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center gap-1 border ${task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                {task.priority}
                                            </span>
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <Calendar size={12} />
                                                    <span className="text-[8px] font-black">{new Date(task.dueDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button className="w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-300 transition-all opacity-0 group-hover:opacity-100">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Performance Summary */}
                    <div className="premium-card bg-[#121212] text-white p-6 relative overflow-hidden group border-none shadow-xl shadow-black/10">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-all duration-1000">
                            <CheckCircle2 size={100} />
                        </div>
                        <h3 className="font-black text-[8px] uppercase tracking-[0.25em] mb-6 text-white/30 italic">Fleet Efficiency</h3>

                        <div className="space-y-5 relative z-10">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/30 text-[7px] font-black uppercase tracking-widest mb-1">Total Finished</p>
                                    <p className="text-2xl font-black italic">{stats.completed}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/30 text-[7px] font-black uppercase tracking-widest mb-1">Hold Status</p>
                                    <p className="text-lg font-black text-white/60 italic">{stats.pending}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Completion Wave</span>
                                    <span className="text-[10px] font-black text-white italic">{stats.completionRate}%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${stats.completionRate}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                        <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 italic">Recent Activity</h3>
                        <div className="space-y-3">
                            {tasks.slice(0, 5).map((t, idx) => (
                                <div key={idx} className="flex items-center gap-2.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'done' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                    <p className="text-[9px] font-bold text-slate-900 truncate flex-1 uppercase tracking-tight italic">{t.title}</p>
                                    <span className="text-[7px] font-black text-slate-300 uppercase">{t.status}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 bg-slate-50 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 hover:bg-slate-100 hover:text-black transition-all border border-slate-50">
                            Access Full Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
