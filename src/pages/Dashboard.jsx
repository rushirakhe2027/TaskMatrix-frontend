import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Plus,
    TrendingUp,
    CreditCard,
    Clock,
    LayoutGrid,
    Search,
    Users,
    Activity,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectModal from '../components/layout/ProjectModal';
import { fetchProjects } from '../redux/slices/projectSlice';
import { fetchMe } from '../redux/slices/authSlice';
import { fetchMyTasks } from '../redux/slices/taskSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { projects, loading: projectsLoading } = useSelector((state) => state.projects);
    const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchProjects());
        dispatch(fetchMe());
        dispatch(fetchMyTasks());
    }, [dispatch]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);

    const taskStats = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.length - completed;
        const velocity = tasks.length > 0 ? ((completed / tasks.length) * 100).toFixed(1) : 0;
        return { completed, pending, velocity };
    }, [tasks]);

    const colors = [
        { bg: 'bg-indigo-50/50', dot: 'bg-indigo-500', text: 'text-indigo-900', border: 'border-indigo-100' },
        { bg: 'bg-blue-50/50', dot: 'bg-blue-500', text: 'text-blue-900', border: 'border-blue-100' },
        { bg: 'bg-rose-50/50', dot: 'bg-rose-500', text: 'text-rose-900', border: 'border-rose-100' },
        { bg: 'bg-emerald-50/50', dot: 'bg-emerald-500', text: 'text-emerald-900', border: 'border-emerald-100' },
        { bg: 'bg-slate-50/50', dot: 'bg-slate-500', text: 'text-slate-900', border: 'border-slate-100' },
    ];

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="grid grid-cols-12 gap-5 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Left Column: Stats */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

                {/* Task Pulse - REAL DATA */}
                <div className="premium-card bg-white border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-1000" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 tracking-wider flex items-center gap-2 italic uppercase">
                                    <Activity size={14} className="text-black" />
                                    Task Pulse
                                </h3>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">Real-time Metrics</p>
                            </div>
                            <div className="bg-slate-50 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase text-slate-400 border border-slate-100 shadow-sm">Live</div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                                    <div className="flex items-end justify-between">
                                        <p className="text-xl font-black text-slate-900">{taskStats.completed}</p>
                                        <CheckCircle2 size={12} className="text-emerald-500 mb-1" />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">In Queue</span>
                                    <div className="flex items-end justify-between">
                                        <p className="text-xl font-black text-slate-900">{taskStats.pending}</p>
                                        <Clock size={12} className="text-amber-500 mb-1" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-[#121212] rounded-2xl text-white flex items-center justify-between shadow-lg shadow-black/10">
                                <div>
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Efficiency Wave</p>
                                    <p className="text-lg font-black mt-0.5 italic">{taskStats.velocity}%</p>
                                </div>
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <TrendingUp size={16} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Overview Card */}
                <div className="premium-card bg-slate-50/30 border border-slate-100 p-6 relative overflow-hidden group">
                    <h3 className="font-black text-[10px] mb-6 flex items-center gap-2 text-slate-900 relative z-10 uppercase tracking-widest italic">
                        <CreditCard size={14} className="text-black" />
                        Project Finances
                    </h3>

                    <div className="space-y-5 relative z-10">
                        <div>
                            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1.5">Total Pipeline Value</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(user?.totalRevenue)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex justify-between items-center shadow-sm">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Settled</span>
                                <p className="text-[11px] font-black text-emerald-600 italic">{formatCurrency(user?.receivedRevenue)}</p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex justify-between items-center shadow-sm">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Awaiting</span>
                                <p className="text-[11px] font-black text-rose-500 italic">{formatCurrency(user?.remainingRevenue)}</p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${(user?.receivedRevenue / user?.totalRevenue) * 100 || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Projects */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">

                {/* Slim Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white border border-slate-100 p-2.5 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-60">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Locate projects..."
                                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold focus:ring-1 focus:ring-black outline-none placeholder:text-slate-300 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="bg-[#121212] text-white px-3 py-2 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
                            <LayoutGrid size={14} />
                            <span className="text-[10px] font-black italic">{filteredProjects.length}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#121212] text-white flex items-center justify-center gap-2 shadow-xl hover:scale-[1.03] transition-all active:scale-95 group border border-white/10"
                    >
                        <Plus size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Initialize Project</span>
                    </button>
                </div>

                {/* Compact Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredProjects.map((project, index) => {
                        const style = colors[index % colors.length];
                        const deadlineDate = project.deadline ? new Date(project.deadline) : null;

                        return (
                            <Link
                                key={project._id}
                                to={`/projects/${project._id}`}
                                className={`bg-white border border-slate-50 rounded-2xl p-6 group hover:shadow-xl transition-all duration-500 block relative hover:-translate-y-1`}
                            >
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex flex-col gap-1">
                                        <span className={`bg-slate-50 text-slate-600 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-slate-100 inline-block w-fit`}>
                                            {project.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-60">
                                        <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse shadow-sm`} />
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                                    </div>
                                </div>

                                <h4 className="font-black text-lg text-slate-900 tracking-tight mb-1 group-hover:text-black transition-colors uppercase italic truncate">{project.name}</h4>
                                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest opacity-60 mb-6 truncate leading-relaxed">
                                    {project.description || 'System Integration Workspace'}
                                </p>

                                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                                    <div className="flex -space-x-2">
                                        {project.members?.slice(0, 3).map((m, i) => (
                                            <div key={m.user?._id || i} className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden shadow-sm hover:z-10 transition-all hover:scale-110">
                                                <img
                                                    src={m.user?.photo || m.user?.avatar ? (m.user?.photo?.startsWith('data:') || m.user?.photo?.startsWith('http') ? m.user.photo : (m.user?.avatar?.startsWith('data:') || m.user?.avatar?.startsWith('http') ? m.user.avatar : `https://task-matrix-backend.vercel.app/img/users/${m.user?.photo || m.user?.avatar}`)) : `https://ui-avatars.com/api/?name=${m.user?.name || 'User'}&background=121212&color=fff`}
                                                    className="w-full h-full object-cover"
                                                    alt="contributor"
                                                />
                                            </div>
                                        ))}
                                        {project.members?.length > 3 && (
                                            <div className="w-8 h-8 rounded-lg border-2 border-white bg-slate-50 flex items-center justify-center text-[9px] font-black text-slate-400">
                                                +{project.members.length - 3}
                                            </div>
                                        )}
                                        {(!project.members || project.members.length === 0) && (
                                            <div className="w-8 h-8 rounded-lg border-2 border-white bg-slate-50 flex items-center justify-center text-slate-300">
                                                <Users size={12} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] font-black text-slate-900 italic">{formatCurrency(project.price)}</p>
                                        <p className="text-[7px] font-black text-slate-300 uppercase tracking-tighter mt-0.5">Project Value</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Empty State */}
                    {!filteredProjects.length && !projectsLoading && (
                        <div className="col-span-full py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center px-10">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                                <Plus size={20} className="text-slate-300" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-tight">System Ready</h4>
                            <p className="text-slate-400 font-bold text-[8px] max-w-xs mb-4 uppercase tracking-[0.1em]">Initialize Workspace Platform.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-[#121212] text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl shadow-lg border border-white/10"
                            >
                                Create Project
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
