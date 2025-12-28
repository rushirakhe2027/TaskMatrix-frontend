import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsers } from '../redux/slices/userSlice';
import { fetchMessages, sendMessageAsync, addMessage, fetchConversations } from '../redux/slices/messageSlice';
import {
    Search,
    Send,
    Plus,
    X,
    MessageSquare,
    Check,
    CheckCheck,
    Paperclip,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Inbox = () => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { users, loading: usersLoading } = useSelector((state) => state.users);
    const { currentMessages, loading } = useSelector((state) => state.messages);

    const [activePartnerId, setActivePartnerId] = useState(null);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [searchParams] = useSearchParams();
    const urlPartnerId = searchParams.get('partnerId');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (urlPartnerId) {
            setActivePartnerId(urlPartnerId);
        }
    }, [urlPartnerId]);

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    useEffect(() => {
        if (searchQuery && !usersLoading) { // Lazy load all users only when searching
            if (users.length === 0) dispatch(fetchAllUsers());
        }
    }, [searchQuery, dispatch, users.length, usersLoading]);

    useEffect(() => {
        if (activePartnerId) {
            dispatch(fetchMessages(activePartnerId));
        }
    }, [activePartnerId, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    const { conversations } = useSelector((state) => state.messages);

    // Derive partners from populated conversations (Fast, no 'users' dependency)
    const conversationPartners = React.useMemo(() => conversations.map(msg => {
        const sender = msg.sender || {};
        const recipient = msg.recipient || {};
        const senderId = sender._id || sender;
        const recipientId = recipient._id || recipient;
        const isMeSender = senderId === currentUser._id;
        const partnerObj = isMeSender ? recipient : sender;
        if (partnerObj && typeof partnerObj === 'object' && partnerObj._id) return partnerObj;
        return users.find(u => u._id === (isMeSender ? recipientId : senderId));
    }).filter(p => p !== undefined), [conversations, currentUser._id, users]);

    // Ensure unique partners
    const uniquePartners = React.useMemo(() => Array.from(new Set(conversationPartners.map(p => (p?._id || p))))
        .map(id => conversationPartners.find(p => p._id === id))
        .filter(p => p), [conversationPartners]);

    // Resolve Active Partner (Prioritize Conversations, then Users)
    const activePartner = React.useMemo(() =>
        uniquePartners.find(p => p._id === activePartnerId) || users.find(u => u._id === activePartnerId),
        [uniquePartners, users, activePartnerId]);

    // Lazy Fetch if Active Partner is missing (e.g. New Chat from Team Page)
    useEffect(() => {
        if (activePartnerId && !activePartner && users.length === 0 && !usersLoading) {
            dispatch(fetchAllUsers());
        }
    }, [activePartnerId, activePartner, users.length, usersLoading, dispatch]);

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!inputText.trim() && !selectedImage) || !activePartnerId) return;

        try {
            const formData = new FormData();
            formData.append('recipient', activePartnerId);
            if (inputText.trim()) formData.append('text', inputText);
            if (selectedImage) formData.append('image', selectedImage);

            await dispatch(sendMessageAsync(formData)).unwrap();
            setInputText('');
            removeImage();
        } catch (err) {
            console.error(err);
        }
    };


    const filteredUsers = React.useMemo(() => uniquePartners.filter(u =>
        u._id !== currentUser._id &&
        (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [uniquePartners, currentUser._id, searchQuery]);

    return (
        <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-white md:rounded-2xl md:shadow-xl overflow-hidden md:border border-slate-100 animate-in fade-in duration-700">

            {/* Contacts Sidebar - WhatsApp style */}
            <div className={`flex flex-col border-r border-slate-100 bg-white z-20 ${activePartnerId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96`}>
                <div className="p-4 border-b border-slate-50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase italic">Messaging</h2>
                        <button className="text-slate-400 hover:text-black transition-colors">
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Locate contact..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-[10px] font-bold focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredUsers.map((partner) => (
                        <div
                            key={partner._id}
                            onClick={() => setActivePartnerId(partner._id)}
                            className={`px-4 py-4 cursor-pointer transition-all flex items-center gap-3 border-b border-slate-50/50 ${activePartnerId === partner._id ? 'bg-slate-50 border-l-4 border-l-black' : 'hover:bg-slate-50/50'}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <img
                                        src={partner.photo && partner.photo !== 'default.jpg' ? (partner.photo.startsWith('data:') || partner.photo.startsWith('http') ? partner.photo : `https://task-matrix-backend.vercel.app/img/users/${partner.photo}`) : `https://ui-avatars.com/api/?name=${partner.name}&background=121212&color=fff`}
                                        className="w-full h-full object-cover"
                                        alt="avatar"
                                    />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="font-black text-[11px] tracking-tight truncate uppercase italic">{partner.name}</h3>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase">Status</span>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 truncate opacity-80 uppercase tracking-widest">
                                    {partner.designation || 'Active Node'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window - WhatsApp style */}
            <div className={`flex flex-col flex-1 bg-white relative ${!activePartnerId ? 'hidden md:flex items-center justify-center bg-slate-50/30' : 'flex h-full'}`}>
                {activePartnerId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white z-10 sticky top-0 shadow-sm shadow-slate-50/50">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setActivePartnerId(null)}
                                    className="md:hidden text-slate-400 mr-1"
                                >
                                    <X size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm ring-1 ring-slate-100 border border-slate-200">
                                    <img
                                        src={activePartner?.photo && activePartner.photo !== 'default.jpg' ? (activePartner.photo.startsWith('data:') || activePartner.photo.startsWith('http') ? activePartner.photo : `https://task-matrix-backend.vercel.app/img/users/${activePartner.photo}`) : `https://ui-avatars.com/api/?name=${activePartner?.name}&background=121212&color=fff`}
                                        className="w-full h-full object-cover"
                                        alt="active-avatar"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xs font-black text-slate-900 tracking-tight uppercase italic leading-none">{activePartner?.name}</h2>
                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Active Now</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-300 hover:text-black transition-colors rounded-lg hover:bg-slate-50">
                                    <Search size={16} />
                                </button>
                                <button className="p-2 text-slate-300 hover:text-black transition-colors rounded-lg hover:bg-slate-50">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area - WhatsApp styling with smaller images */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[#fcfcfc] custom-scrollbar flex flex-col">
                            {currentMessages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 mt-20">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                        <MessageSquare size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Session Initialized</p>
                                    <p className="text-[9px] font-bold mt-1 uppercase text-slate-400 tracking-widest">End-to-end encryption active</p>
                                </div>
                            ) : (
                                currentMessages.map((msg, i) => {
                                    const isMine = msg.sender._id === currentUser._id || msg.sender === currentUser._id;
                                    return (
                                        <div
                                            key={msg._id || i}
                                            className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {/* Avatar only for partner */}
                                            {!isMine && (
                                                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border border-slate-200">
                                                    <img
                                                        src={activePartner?.photo && activePartner.photo !== 'default.jpg' ? (activePartner.photo.startsWith('data:') || activePartner.photo.startsWith('http') ? activePartner.photo : `https://task-matrix-backend.vercel.app/img/users/${activePartner.photo}`) : `https://ui-avatars.com/api/?name=${activePartner?.name}&background=121212&color=fff`}
                                                        className="w-full h-full object-cover"
                                                        alt="avatar"
                                                    />
                                                </div>
                                            )}

                                            <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] lg:max-w-[60%] ${isMine ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-2.5 rounded-2xl text-[11px] font-bold leading-relaxed shadow-sm relative ${isMine ? 'bg-[#121212] text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="mb-2 rounded-xl overflow-hidden border border-slate-100 shadow-sm max-w-[280px]">
                                                            <img
                                                                src={msg.attachments[0].url.startsWith('data:') ? msg.attachments[0].url : `https://task-matrix-backend.vercel.app/img/messages/${msg.attachments[0].url}`}
                                                                alt="attachment"
                                                                className="w-full h-auto object-contain bg-slate-50"
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="break-words">{msg.text}</p>
                                                    <div className={`flex items-center justify-end gap-1 mt-1 opacity-40`}>
                                                        <span className="text-[7px] font-black uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isMine && <CheckCheck size={10} />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer - Input */}
                        <div className="p-3 md:p-4 border-t border-slate-50 bg-white">
                            <form onSubmit={handleSend} className="flex items-center gap-2 md:gap-3 bg-slate-50 p-1.5 md:p-2 rounded-2xl border border-slate-100 max-w-4xl mx-auto w-full">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-black transition-colors rounded-xl hover:bg-white shrink-0">
                                    <Paperclip size={18} />
                                </button>
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageSelect} />

                                <input
                                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-slate-800 font-bold placeholder:text-slate-300 py-1.5 md:py-2 text-[11px] min-w-0"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />

                                {inputText.trim() || selectedImage ? (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-9 h-9 md:w-10 md:h-10 bg-[#121212] text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={15} />
                                    </button>
                                ) : (
                                    <button type="button" className="p-2 text-slate-400 hover:text-black transition-colors shrink-0">
                                        <Plus size={18} />
                                    </button>
                                )}
                            </form>
                            {imagePreview && (
                                <div className="mt-2 relative w-14 h-14 animate-in zoom-in-95 mx-auto md:ml-12">
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-xl border border-slate-100 shadow-md" />
                                    <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#121212] text-white rounded-full flex items-center justify-center shadow-md border border-white/10">
                                        <X size={10} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-40">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-8 rotate-12 transition-transform hover:rotate-0 border border-slate-50">
                            <MessageSquare size={48} className="text-slate-100" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter italic uppercase">Comms Center</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50">Secure end-to-end messaging active</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inbox;
