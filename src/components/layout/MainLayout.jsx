import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <main className="flex-1 flex flex-col h-full lg:ml-24 overflow-hidden px-2 md:px-6 py-2 md:py-4">
                <Navbar />

                <div className="flex-1 overflow-y-auto mt-4 pr-1 scroll-smooth custom-scrollbar pb-24 md:pb-0">
                    <Outlet />
                </div>

                {/* Mobile Navigation (Floating or Bottom) */}
                <div className="lg:hidden fixed bottom-4 left-4 right-4 z-[100]">
                    <Sidebar isMobile />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
