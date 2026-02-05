import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Play,
    CheckCircle2,
    Users,
    MessageSquare,
    Layout,
    Mail,
    Lock,
    User as UserIcon,
    Eye,
    EyeOff,
    Camera,
    X,
    ArrowRight
} from 'lucide-react';
import { login, signup } from '../redux/slices/authSlice';

const Landing = () => {
    const [view, setView] = useState('landing'); // 'landing' or 'auth'
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const { loading, error, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        if (authMode === 'login') {
            const result = await dispatch(login({ email: formData.email, password: formData.password }));
            if (login.fulfilled.match(result)) navigate('/');
        } else {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('password', formData.password);
            if (avatar) data.append('avatar', avatar);

            const result = await dispatch(signup(data));
            if (signup.fulfilled.match(result)) navigate('/');
        }
    };

    const toggleAuth = (mode) => {
        setAuthMode(mode);
        setView('auth');
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-6 md:px-12 border-b border-slate-100">
                <div className="text-xl font-black tracking-tighter uppercase italic">
                    TaskMatrix
                </div>
                <div className="hidden md:flex items-center gap-10">
                    {/* No links */}
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => toggleAuth('login')}
                        className="px-6 py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => toggleAuth('signup')}
                        className="px-6 py-2 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            <AnimatePresence mode="wait">
                {view === 'landing' ? (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative"
                    >
                        {/* Hero Section */}
                        <section className="pt-20 pb-12 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] uppercase italic mb-6">
                                        Orchestrate <br />
                                        Your Team's <br />
                                        <span className="inline-block px-4 py-2 bg-black text-white italic">Success</span>
                                    </h1>
                                    <p className="text-lg text-slate-500 max-w-xl font-medium leading-relaxed">
                                        The definitive workspace for group projects. Stop managing tools and start managing work. Strictly business.
                                    </p>
                                </motion.div>

                                <motion.div
                                    className="flex flex-wrap gap-4"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <button
                                        onClick={() => toggleAuth('signup')}
                                        className="px-8 py-5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
                                    >
                                        Start for Free
                                    </button>
                                </motion.div>

                                <div className="flex items-center gap-2 pt-4">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <CheckCircle2 size={12} className="text-white" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tight text-slate-400">No credit card required</span>
                                </div>
                            </div>

                            <motion.div
                                className="flex-1 relative"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="relative z-10 bg-white border-[3px] border-black rounded-xl shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden aspect-[4/3] group">
                                    {/* Simulated Dashboard UI */}
                                    <div className="p-6 h-full flex flex-col gap-6 bg-slate-50">
                                        <div className="flex justify-between items-center">
                                            <div className="h-4 w-32 bg-slate-200 rounded-lg" />
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-slate-200" />
                                                <div className="w-6 h-6 rounded-lg bg-slate-200" />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex gap-4">
                                            <div className="flex-1 h-full bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                                                <div className="h-2 w-16 bg-slate-100 rounded" />
                                                <div className="h-32 bg-slate-50 rounded-lg border border-slate-100" />
                                                <div className="h-20 bg-slate-50 rounded-lg border border-slate-100" />
                                            </div>
                                            <div className="flex-1 h-full bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                                                <div className="h-2 w-16 bg-slate-100 rounded" />
                                                <div className="h-20 bg-slate-50 rounded-lg border border-slate-100" />
                                                <div className="h-32 bg-emerald-50 rounded-lg border border-emerald-100" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Overlay for "Premium" feel */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                </div>
                            </motion.div>
                        </section>

                        {/* Social Proof */}

                        {/* Features Section */}
                        <section id="features" className="pt-0 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight mb-4">Monochrome Efficiency</h2>
                                <p className="text-slate-400 font-bold">Everything you need to streamline your workflow. Nothing you don't.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { icon: Users, title: 'Collaborate', desc: 'Real-time updates for group projects. See changes as they happen and keep everyone on the same page.' },
                                    { icon: CheckCircle2, title: 'Assign Tasks', desc: 'Drag-and-drop task management. Intuitive interfaces make assigning tasks to team members simple.' },
                                    { icon: MessageSquare, title: 'Connect', desc: 'Built-in chat and comment threads. Discuss details directly within tasks so context is never lost.' }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -10 }}
                                        className="bg-white border-[3px] border-black rounded-xl p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        <div className="w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center mb-8">
                                            <feature.icon size={28} />
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic italic mb-4">{feature.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Workflow Visualization Section */}
                        <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-16">
                                <div className="max-w-xl">
                                    <h2 className="text-4xl font-black uppercase italic tracking-tight mb-4">Workflow Visualization</h2>
                                    <p className="text-slate-400 font-bold">Switch views to manage projects your way.</p>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button className="px-6 py-2 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Board</button>
                                    <button className="px-6 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-black">List</button>
                                    <button className="px-6 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-black">Calendar</button>
                                </div>
                            </div>

                            <div className="bg-white border-[3px] border-black rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                                    {['To Do', 'In Progress', 'Done'].map((status, i) => (
                                        <div key={status} className="space-y-4">
                                            <div className="flex justify-between items-center px-2">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest italic">{status}</h4>
                                                <span className="bg-slate-100 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-200">{(3 - i) || 1}</span>
                                            </div>
                                            <div className={`p-4 bg-white border-2 rounded-2xl ${i === 1 ? 'border-black' : 'border-slate-100'}`}>
                                                <div className="h-1 w-8 bg-slate-400 mb-4 rounded" />
                                                <p className="text-xs font-black uppercase italic">Research competitors</p>
                                                <div className="mt-4 flex -space-x-2">
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white" />
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white" />
                                                </div>
                                            </div>
                                            {i === 1 && (
                                                <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-lg transform rotate-1">
                                                    <div className="h-1 w-8 bg-black mb-4 rounded" />
                                                    <p className="text-xs font-black uppercase italic">Design system update</p>
                                                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-black w-[70%]" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50" />
                            </div>
                        </section>

                        {/* CTA Section */}
                        <section className="bg-black py-32 px-6 flex flex-col items-center text-center">
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none">
                                Ready to get <br /> Organized?
                            </h2>
                            <p className="text-slate-400 font-bold mb-12">Join 10,000+ teams who have switched to TaskMatrix.</p>

                            <div className="flex flex-col md:flex-row gap-4 w-full max-w-lg">
                                <input
                                    type="email"
                                    placeholder="Enter your work email"
                                    className="flex-1 bg-transparent border-2 border-slate-700 rounded-xl px-6 py-4 text-white text-xs font-bold focus:border-white transition-all outline-none"
                                />
                                <button className="bg-white text-black px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
                                    Get Started
                                </button>
                            </div>
                            <p className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">14-day free trial. No credit card.</p>
                        </section>

                        <footer className="py-12 border-t border-slate-100 px-6 md:px-12 flex justify-center">
                            <div className="text-xs font-black uppercase italic">TaskMatrix</div>
                        </footer>
                    </motion.div>
                ) : (
                    <motion.div
                        key="auth"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/40 backdrop-blur-3xl"
                    >
                        <div className="w-full max-w-md bg-white border-[3px] border-black rounded-[2.5rem] p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                            <button
                                onClick={() => setView('landing')}
                                className="absolute top-6 right-6 w-10 h-10 border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-black hover:border-black transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-black uppercase italic italic tracking-tight mb-2">
                                    {authMode === 'login' ? 'Sync Back In' : 'Join the Matrix'}
                                </h3>
                                <p className="text-slate-400 font-bold text-sm italic">
                                    {authMode === 'login' ? 'Continue your orchestration flow' : 'Initialize your project environment'}
                                </p>
                            </div>

                            <form onSubmit={handleAuthSubmit} className="space-y-6">
                                {authMode === 'signup' && (
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full border-4 border-black p-1 flex items-center justify-center bg-slate-50 overflow-hidden shadow-xl transition-transform group-hover:scale-105">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} className="w-full h-full object-cover rounded-full" alt="Preview" />
                                                ) : (
                                                    <Camera size={32} className="text-slate-300" />
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg border-2 border-white">
                                                <Plus size={16} />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                            </label>
                                        </div>
                                        <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Portrait Identity</p>
                                    </div>
                                )}

                                {authMode === 'signup' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Identity Name</label>
                                        <div className="relative">
                                            <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="John Wick"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black transition-all outline-none text-xs font-bold"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Node Email</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            placeholder="node@taskmatrix.io"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black transition-all outline-none text-xs font-bold"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Secure Passcode</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-black transition-all outline-none text-xs font-bold"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-black transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-[10px] font-black uppercase italic text-center bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>}

                                <button
                                    className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${loading ? 'bg-slate-100 text-slate-400' : 'bg-black text-white hover:scale-105 shadow-2xl active:scale-95'}`}
                                    disabled={loading}
                                >
                                    {loading ? 'Initializing...' : (authMode === 'login' ? 'Resume Session' : 'Create Node')}
                                    {!loading && <ArrowRight size={14} />}
                                </button>
                            </form>

                            <div className="mt-8 text-center pt-8 border-t border-slate-50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {authMode === 'login' ? "Don't have a node yet?" : "Already part of the matrix?"}
                                    <button
                                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                        className="text-black ml-2 hover:underline decoration-2 underline-offset-4"
                                    >
                                        {authMode === 'login' ? 'Initialize Node' : 'Initialize Session'}
                                    </button>
                                </p>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-slate-50 rounded-full opacity-50 -z-10" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Landing;
