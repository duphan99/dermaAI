import React from 'react';

export type AppView = 'main' | 'scar' | 'acne' | 'melasma' | 'rejuvenation' | 'history' | 'settings';

interface HeaderProps {
    activeView: AppView;
    onNavigate: (view: AppView) => void;
}

const NavButton: React.FC<{
    label: string;
    view: AppView;
    activeView: AppView;
    onNavigate: (view: AppView) => void;
    icon: React.ReactNode;
}> = ({ label, view, activeView, onNavigate, icon }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => onNavigate(view)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200'
            }`}
        >
            {icon}
            {label}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
    return (
        <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <h1 className="text-xl font-bold text-slate-800">Da liễu A.I.</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <NavButton label="Tổng quát" view="main" activeView={activeView} onNavigate={onNavigate} icon={<></>} />
                    <NavButton label="Trị Sẹo" view="scar" activeView={activeView} onNavigate={onNavigate} icon={<></>} />
                    <NavButton label="Lịch sử" view="history" activeView={activeView} onNavigate={onNavigate} icon={<></>} />
                    <NavButton label="Cài đặt" view="settings" activeView={activeView} onNavigate={onNavigate} icon={<></>} />
                </div>
            </nav>
        </header>
    );
};
