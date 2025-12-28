import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createProject, updateProject } from '../../redux/slices/projectSlice';
import { X, Folder, Type, AlignLeft, Calendar, Tag, Users, Search, Plus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectModal = ({ isOpen, onClose, projectToEdit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [category, setCategory] = useState('Design');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (projectToEdit) {
            setName(projectToEdit.name);
            setDescription(projectToEdit.description);
            setPrice(projectToEdit.price);
            setPaidAmount(projectToEdit.paidAmount);
            setCategory(projectToEdit.category);
            setDeadline(projectToEdit.deadline ? projectToEdit.deadline.split('T')[0] : '');
        } else {
            // Reset for creation mode
            setName('');
            setDescription('');
            setPrice('');
            setPaidAmount('');
            setCategory('Design');
            setDeadline('');
        }
    }, [projectToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const projectData = {
                name,
                description,
                price: Number(price),
                paidAmount: Number(paidAmount),
                category,
                deadline
            };

            if (projectToEdit) {
                await dispatch(updateProject({ id: projectToEdit._id, data: projectData })).unwrap();
            } else {
                await dispatch(createProject(projectData)).unwrap();
            }

            onClose();
        } catch (err) {
            console.error('Failed to save project:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const remainingAmount = (Number(price) || 0) - (Number(paidAmount) || 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative border border-slate-100 flex flex-col"
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{projectToEdit ? 'Edit Project' : 'Create New Project'}</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">{projectToEdit ? 'Update project details and financials' : 'Start a new collaboration workspace'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <form id="project-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* Project Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 ml-1" htmlFor="project-name">Project Name</label>
                            <div className="relative group">
                                <Folder size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1e1e1e] transition-colors" />
                                <input
                                    id="project-name"
                                    type="text"
                                    required
                                    placeholder="e.g. Website Redesign Q3"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#1e1e1e] focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 ml-1" htmlFor="project-desc">Description</label>
                            <textarea
                                id="project-desc"
                                placeholder="Describe the goals and scope of this project..."
                                className="w-full p-5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-[#1e1e1e] focus:bg-white outline-none transition-all placeholder:text-slate-400 min-h-[120px] font-medium resize-none shadow-inner"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Financials Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Total Project Value (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-1 focus:ring-[#1e1e1e] outline-none font-medium"
                                        placeholder="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Advance Payment (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-1 focus:ring-green-500 outline-none font-medium"
                                        placeholder="0"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 pt-2 flex justify-between items-center text-sm px-2">
                                <span className="font-bold text-slate-500">Remaining Balance:</span>
                                <span className={`font-black text-lg ${remainingAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    ₹{remainingAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Category & Deadline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Category</label>
                                <div className="relative">
                                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    <select
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 bg-white text-slate-900 appearance-none focus:ring-1 focus:ring-[#1e1e1e] outline-none cursor-pointer font-medium"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option>Design</option>
                                        <option>Development</option>
                                        <option>Marketing</option>
                                        <option>Research</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 ml-1">Deadline</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 bg-white text-slate-900 focus:ring-1 focus:ring-[#1e1e1e] outline-none font-medium"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 flex justify-end gap-4 rounded-b-[2.5rem] bg-slate-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-white transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        form="project-form"
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 rounded-2xl bg-[#1e1e1e] text-white font-extrabold shadow-xl hover:shadow-[#1e1e1e]/20 hover:scale-[1.02] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            projectToEdit ? <Save size={20} /> : <Plus size={20} />
                        )}
                        {projectToEdit ? 'Save Changes' : 'Create Project'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectModal;
