import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProjects,
    deleteProject,
    updateProject
} from '../redux/slices/projectSlice';
import {
    Plus,
    Search,
    MoreVertical,
    LayoutGrid,
    List,
    Clock,
    Users,
    Trash2,
    Edit3,
    Eye,
    Archive
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectModal from '../components/layout/ProjectModal';
import { motion, AnimatePresence } from 'framer-motion';

const Projects = () => {
    const dispatch = useDispatch();
    const { projects, loading } = useSelector((state) => state.projects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [activeActionMenu, setActiveActionMenu] = useState(null);

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);

    const handleEdit = (project) => {
        setProjectToEdit(project);
        setIsModalOpen(true);
        setActiveActionMenu(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Archive this workspace identity?')) {
            dispatch(deleteProject(id));
            setActiveActionMenu(null);
        }
    };

    const stats = useMemo(() => {
        const active = projects.filter(p => p.status === 'active').length;
        const total = projects.length;
        return { active, total };
    }, [projects]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setProjectToEdit(null);
                }}
                projectToEdit={projectToEdit}
            />

            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Workspace Hub</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">System Deployment Map</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-72">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Locate identity..."
                            className="w-full bg-white border border-slate-100 rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-black'}`}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-black'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#121212] text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.03] transition-all flex items-center gap-2 border border-white/10"
                    >
                        <Plus size={16} />
                        Initialize
                    </button>
                </div>
            </div>

            {/* Distribution Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Nodes", val: stats.active, color: "text-emerald-500" },
                    { label: "Total Fleet", val: stats.total, color: "text-slate-900" },
                    { label: "Archived", val: "0", color: "text-slate-300" },
                    { label: "Allocated", val: projects.length > 0 ? formatCurrency(projects.reduce((a, b) => a + (b.price || 0), 0)) : "₹0", color: "text-slate-900" }
                ].map((s, i) => (
                    <div key={i} className="bg-white border border-slate-50 p-4 rounded-xl shadow-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{s.label}</p>
                        <p className={`text-sm font-black italic uppercase ${s.color}`}>{s.val}</p>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-8 h-8 border-2 border-slate-100 border-t-black rounded-full animate-spin mx-auto" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No System Entities Found</p>
                    </div>
                ) : (
                    filteredProjects.map((project, idx) => (
                        <div
                            key={project._id}
                            className={`
                                group bg-white border border-slate-50 relative overflow-hidden transition-all duration-500
                                ${viewMode === 'grid' ? 'p-5 rounded-2xl hover:shadow-xl hover:-translate-y-1' : 'p-3 rounded-xl flex items-center gap-4 hover:shadow-md'}
                            `}
                        >
                            <div className={`flex flex-col flex-1 min-w-0 ${viewMode === 'list' ? 'md:flex-row md:items-center gap-4' : ''}`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 text-[8px] font-black uppercase tracking-widest italic">
                                            {project.category || 'General'}
                                        </span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'active' ? 'bg-emerald-400' : 'bg-slate-200'} animate-pulse shadow-sm`} />
                                    </div>
                                    <Link to={`/projects/${project._id}`} className="block">
                                        <h3 className="text-sm font-black text-slate-900 truncate tracking-tight group-hover:text-black italic uppercase italic leading-tight mb-1">
                                            {project.name}
                                        </h3>
                                        {viewMode === 'grid' && (
                                            <p className="text-[10px] text-slate-400 font-bold line-clamp-2 opacity-60 leading-relaxed mb-4">
                                                {project.description || 'Secure communication and workspace module integration.'}
                                            </p>
                                        )}
                                    </Link>
                                </div>

                                {viewMode === 'list' && (
                                    <div className="flex items-center gap-6 hidden md:flex">
                                        <div className="flex flex-col items-end">
                                            <p className="text-[10px] font-black text-slate-900 italic uppercase leading-none">{formatCurrency(project.price)}</p>
                                            <p className="text-[7px] font-black text-slate-300 uppercase tracking-tighter mt-1 italic">Value</p>
                                        </div>
                                        <div className="flex -space-x-1.5">
                                            {project.members?.slice(0, 3).map((m, i) => (
                                                <div key={i} className="w-6 h-6 rounded-lg border-2 border-white overflow-hidden shadow-sm bg-slate-50">
                                                    <img src={m.user?.avatar || `https://ui-avatars.com/api/?name=${m.user?.name}&background=121212&color=fff`} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {viewMode === 'grid' && (
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex -space-x-1.5">
                                        {project.members?.slice(0, 3).map((m, i) => (
                                            <div key={i} className="w-7 h-7 rounded-lg border-2 border-white overflow-hidden shadow-sm bg-slate-50">
                                                <img src={m.user?.avatar || `https://ui-avatars.com/api/?name=${m.user?.name}&background=121212&color=fff`} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-black text-slate-900 italic leading-none">{formatCurrency(project.price)}</p>
                                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mt-1 italic">Financial Node</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Menu Trigger */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveActionMenu(activeActionMenu === project._id ? null : project._id);
                                }}
                                className="absolute top-4 right-4 p-1 rounded-lg text-slate-300 hover:text-black hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical size={14} />
                            </button>

                            {/* Action Menu Dropdown */}
                            <AnimatePresence>
                                {activeActionMenu === project._id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute top-12 right-4 w-32 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 p-1"
                                    >
                                        <Link to={`/projects/${project._id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-[9px] font-black uppercase text-slate-600 italic">
                                            <Eye size={12} /> Inspect
                                        </Link>
                                        <button onClick={() => handleEdit(project)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-[9px] font-black uppercase text-slate-600 italic">
                                            <Edit3 size={12} /> Recode
                                        </button>
                                        <button onClick={() => handleDelete(project._id)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-rose-50 text-[9px] font-black uppercase text-rose-500 italic">
                                            <Trash2 size={12} /> Purge
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Projects;
