import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Search,
    Bell,
    Settings,
    ChevronDown,
    X,
    Clock,
    CheckCircle2,
    MessageSquare,
    TrendingUp
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, markAllAsRead } from '../../redux/slices/notificationSlice';

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const { projects } = useSelector((state) => state.projects);
    const { notifications } = useSelector((state) => state.notifications);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const dropdownRef = useRef(null);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const unseenCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Work Dashboard';
        if (path === '/inbox') return 'Message Hub';
        if (path.startsWith('/projects')) return 'Project Center';
        if (path === '/tasks') return 'My Work Tasks';
        if (path === '/team') return 'Team Hub';
        if (path === '/settings') return 'Account Settings';
        return 'TaskMatrix';
    };

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSearchOpen(false);
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredSearch = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    return (
        <header className="flex items-center justify-between w-full shrink-0 mb-4 animate-in fade-in slide-in-from-top-4 duration-1000 relative">

            {/* Left side Buttons */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase italic">{getPageTitle()}</h1>
                    <p className="text-[8px] font-black text-slate-400 tracking-[0.2em] uppercase mt-1.5 opacity-60">Management & Control</p>
                </div>
            </div>

            {/* CENTER: TaskMatrix Title */}
            <div className="hidden lg:flex items-center gap-3 bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50">
                <div className="w-8 h-8 bg-[#121212] rounded-lg flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                    <span className="text-white font-black text-sm">T</span>
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tighter uppercase italic tracking-widest">TaskMatrix</span>
            </div>

            {/* Right side Profile & Icons */}
            <div className="flex items-center gap-3" ref={dropdownRef}>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm relative">

                    {/* Search Trigger */}
                    <button
                        onClick={() => { setIsSearchOpen(!isSearchOpen); setIsNotificationsOpen(false); }}
                        className={`w-9 h-9 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center ${isSearchOpen ? 'text-black bg-slate-50' : 'text-slate-300'}`}
                    >
                        <Search size={16} />
                    </button>

                    {/* Notifications Trigger */}
                    <button
                        onClick={() => {
                            setIsNotificationsOpen(!isNotificationsOpen);
                            setIsSearchOpen(false);
                        }}
                        className={`w-9 h-9 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center relative ${isNotificationsOpen ? 'text-black bg-slate-50' : 'text-slate-300'}`}
                    >
                        <Bell size={16} />
                        {unseenCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 ring-2 ring-white rounded-full"></span>
                        )}
                    </button>

                    {/* Search Panel */}
                    <AnimatePresence>
                        {isSearchOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-[100]"
                            >
                                <div className="relative mb-3">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Quick search projects..."
                                        className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold focus:ring-1 focus:ring-black outline-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    {searchQuery && filteredSearch.map(p => (
                                        <Link
                                            key={p._id}
                                            to={`/projects/${p._id}`}
                                            onClick={() => setIsSearchOpen(false)}
                                            className="block p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{p.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">{p.category}</p>
                                        </Link>
                                    ))}
                                    {searchQuery && filteredSearch.length === 0 && (
                                        <p className="text-[9px] text-slate-400 p-2 font-bold italic">No matching projects found.</p>
                                    )}
                                    {!searchQuery && (
                                        <p className="text-[9px] text-slate-300 p-2 font-bold uppercase tracking-widest text-center">Start typing to search...</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Notifications Panel */}
                    <AnimatePresence>
                        {isNotificationsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]"
                            >
                                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Updates Center</h4>
                                    {unseenCount > 0 && (
                                        <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{unseenCount} NEW</span>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {/* Empty state instead of demo data */}
                                    <div className="p-10 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                            <Bell size={20} className="text-slate-300" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic">System Clean</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">No active alerts detected</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => dispatch(markAllAsRead())}
                                    className="w-full py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-black transition-all"
                                >
                                    Clear All Notifications
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />

                {/* Profile Section */}
                <div
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-3 group cursor-pointer"
                >
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-[11px] font-black text-slate-900 tracking-tight uppercase italic">{user?.name}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-60">{user?.designation || 'Product Manager'}</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-md group-hover:scale-110 transition-all duration-500">
                        <img
                            src={user?.photo && user.photo !== 'default.jpg' ? (user.photo.startsWith('data:') || user.photo.startsWith('http') ? user.photo : `https://task-matrix-backend.vercel.app/img/users/${user.photo}`) : `https://ui-avatars.com/api/?name=${user?.name}&background=121212&color=fff`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
