import React from 'react';
import type { AppView } from '../types';

interface HeaderProps {
    activeView: AppView;
    onNavigate: (view: AppView) => void;
}

const NavButton: React.FC<{ label: string; view: AppView; activeView: AppView; onNavigate: (view: AppView) => void;}> = 
({ label, view, activeView, onNavigate }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => onNavigate(view)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200/70'
            }`}
        >
            {label}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
    return (
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <button onClick={() => onNavigate('home')} className="flex items-center gap-3 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                        <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                    </svg>
                    <h1 className="text-xl font-bold text-slate-800">DermaAI Assistant</h1>
                </button>
                <div className="hidden md:flex items-center gap-2 flex-wrap">
                    <NavButton label="Trang chủ" view="home" activeView={activeView} onNavigate={onNavigate} />
                    <NavButton label="Lịch sử" view="history" activeView={activeView} onNavigate={onNavigate} />
                    <NavButton label="Cài đặt" view="settings" activeView={activeView} onNavigate={onNavigate} />
                </div>
            </nav>
        </header>
    );
};