import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers } from '../redux/slices/userSlice';
import { Users, Mail, Phone, MessageSquare, Plus, Search, Filter, MoreVertical, ShieldCheck, MailCheck, Star } from 'lucide-react';

const Team = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Collaboration Matrix</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        Team Hub <span className="w-1 h-1 bg-slate-200 rounded-full" /> Total Associates: {users.length}
                    </p>
                </div>
                <button className="px-8 py-3.5 bg-[#1e1e1e] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 transition-all flex items-center gap-3">
                    <Plus size={16} />
                    Invite Associate
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[#1e1e1e] rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Grid of Team Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredUsers.slice(0, 4).map((member, i) => (
                            <div key={member._id} className="premium-card bg-white p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-700 border border-slate-50">
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100`}>
                                        Active Associate
                                    </div>
                                    <button className="w-8 h-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-all">
                                        <Star size={14} />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center mb-10 relative z-10">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-[2.5rem] p-1.5 border-4 border-white shadow-xl ring-2 ring-slate-100 mb-6 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                                            <img
                                                src={member.photo && member.photo !== 'default.jpg' ? `http://localhost:5000/img/users/${member.photo}` : `https://ui-avatars.com/api/?name=${member.name}&background=1e1e1e&color=fff`}
                                                className="w-full h-full object-cover rounded-[2rem]"
                                                alt="u"
                                            />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{member.name} {member._id === currentUser?._id && "(You)"}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{member.designation || 'Project Associate'}</p>
                                </div>

                                <div className="flex justify-center gap-3 relative z-10">
                                    {[Mail, Phone, MessageSquare].map((Icon, idx) => (
                                        <button key={idx} className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-50 hover:bg-[#1e1e1e] hover:text-white transition-all shadow-sm flex items-center justify-center text-slate-400">
                                            <Icon size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="premium-card p-10 flex flex-col justify-center items-center text-center border-4 border-dashed border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200 transition-all cursor-pointer group">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center text-slate-300 group-hover:scale-110 transition-all shadow-md mb-6">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Expand Workspace</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-6">Add high-performance talent to your collective</p>
                        </div>
                    </div>

                    {/* Directory Section */}
                    <div className="premium-card overflow-hidden bg-white border border-slate-50">
                        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-white">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Core Directory</h3>
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search directory..."
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-50 text-xs font-bold focus:ring-2 focus:ring-[#1e1e1e] outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <button className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100"><Filter size={18} /></button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        {["Core Associate", "Strategic Role", "Access Level", "Revenue Contribution", ""].map(h => (
                                            <th key={h} className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map((m, i) => (
                                        <tr key={m._id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={m.photo && m.photo !== 'default.jpg' ? `http://localhost:5000/img/users/${m.photo}` : `https://ui-avatars.com/api/?name=${m.name}&background=1e1e1e&color=fff`}
                                                        className="w-10 h-10 rounded-xl"
                                                        alt="u"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{m.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold">{m.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8 text-sm font-black text-slate-600">{m.designation || 'Collaborator'}</td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-2 text-brand-600">
                                                    <ShieldCheck size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Authorized</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-slate-900/10 rounded-full" style={{ width: '40%' }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">₹{m.totalRevenue?.toLocaleString() || 0}</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <MoreVertical size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-pointer" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Team;
