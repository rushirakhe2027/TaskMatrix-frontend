import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home,
    FolderOpen,
    CheckCircle,
    Users,
    Settings,
    LogOut,
    MessageSquare
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const Sidebar = ({ isMobile }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        { icon: <Home size={18} />, path: '/', label: 'Home' },
        { icon: <MessageSquare size={18} />, path: '/inbox', label: 'Inbox' },
        { icon: <FolderOpen size={18} />, path: '/projects', label: 'Projects' },
        { icon: <CheckCircle size={18} />, path: '/tasks', label: 'Tasks' },
        { icon: <Users size={18} />, path: '/team', label: 'Team' },
    ];

    if (isMobile) {
        return (
            <div className="bg-[#121212] rounded-2xl flex items-center justify-around py-3 px-6 text-white shadow-2xl border border-white/10">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center justify-center transition-all duration-300
                            ${isActive ? 'text-white scale-110' : 'text-white/40'}
                        `}
                    >
                        {item.icon}
                    </NavLink>
                ))}
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `flex items-center justify-center transition-all ${isActive ? 'text-white' : 'text-white/40'}`}
                >
                    <Settings size={18} />
                </NavLink>
            </div>
        );
    }

    return (
        <aside className="fixed left-6 top-1/2 -translate-y-1/2 h-[calc(100vh-4rem)] w-16 bg-[#121212] rounded-[2rem] flex flex-col items-center py-8 justify-between text-white shadow-2xl z-50">
            {/* Top Icons */}
            <div className="flex flex-col items-center gap-8 w-full">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            relative group w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                            ${isActive ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/40 hover:text-white hover:bg-white/5'}
                        `}
                        title={item.label}
                    >
                        {item.icon}
                        <span className="absolute left-14 bg-black text-white px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl uppercase tracking-widest z-[100]">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </div>

            {/* Bottom Icons */}
            <div className="flex flex-col items-center gap-6">
                <button
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    title="Settings"
                    onClick={() => navigate('/settings')}
                >
                    <Settings size={18} />
                </button>
                <button
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-all group"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
