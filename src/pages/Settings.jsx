import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMe } from '../redux/slices/userSlice';
import { fetchMe } from '../redux/slices/authSlice';
import { User, LogOut, Globe, Upload, Camera, Shield } from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        designation: user?.designation || '',
        location: user?.location || '',
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = new FormData();
        form.append('name', formData.name);
        form.append('email', formData.email);
        form.append('designation', formData.designation);
        form.append('location', formData.location);
        if (photo) {
            form.append('photo', photo);
        }

        try {
            await dispatch(updateMe(form)).unwrap();
            await dispatch(fetchMe()).unwrap();
            alert('Identity Updated Successfully');
        } catch (err) {
            console.error(err);
            alert('Update Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        Operational Profile <span className="w-1 h-1 bg-slate-200 rounded-full" /> Personal Identity
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-[9px] uppercase tracking-widest border border-rose-100 shadow-sm hover:bg-rose-600 hover:text-white transition-all flex items-center gap-3"
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 gap-10">
                <form className="premium-card p-8 bg-white border border-slate-50 shadow-sm" onSubmit={handleUpdate}>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-8 flex items-center gap-4">
                        <div className="w-1 h-8 bg-[#1e1e1e] rounded-full" />
                        Identity Information
                    </h3>

                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-[2.5rem] p-1 border-4 border-slate-50 shadow-xl overflow-hidden bg-slate-100 relative">
                                    <img
                                        src={photoPreview || (user?.photo && user.photo !== 'default.jpg' ? `https://task-matrix-backend.vercel.app/img/users/${user.photo}` : `https://ui-avatars.com/api/?name=${user?.name}&background=1e1e1e&color=fff`)}
                                        className="w-full h-full object-cover rounded-[2rem]"
                                        alt="avatar"
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#1e1e1e] text-white rounded-xl flex items-center justify-center shadow-2xl border-2 border-white">
                                    <Globe size={14} />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Portrait</h4>
                                <p className="text-slate-500 text-[11px] font-medium max-w-xs leading-relaxed">Update your visual identification within the workspace.</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 rounded-lg bg-slate-50 text-slate-900 font-black text-[8px] uppercase tracking-widest border border-slate-100"
                                >
                                    Upload New Photo
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-50">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    disabled={loading}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-50 focus:ring-1 focus:ring-[#1e1e1e] transition-all outline-none font-bold text-slate-900 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Title</label>
                                <input
                                    type="text"
                                    disabled={loading}
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-50 focus:ring-1 focus:ring-[#1e1e1e] transition-all outline-none font-bold text-slate-900 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identifier</label>
                                <input
                                    type="email"
                                    disabled={loading}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-50 focus:ring-1 focus:ring-[#1e1e1e] transition-all outline-none font-bold text-slate-900 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                                <input
                                    type="text"
                                    disabled={loading}
                                    value={formData.location}
                                    placeholder="City, Country"
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-50 focus:ring-1 focus:ring-[#1e1e1e] transition-all outline-none font-bold text-slate-900 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-50 flex justify-end">
                        <button type="submit" disabled={loading} className="px-8 py-3.5 rounded-[1.2rem] bg-[#1e1e1e] text-white font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50">
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
