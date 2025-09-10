import React from 'react';
import type { AppView } from '../types';

interface HomeProps {
    onNavigate: (view: AppView) => void;
}

const ServiceCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}> = ({ title, description, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200/80 hover:shadow-xl hover:border-blue-300 transform hover:-translate-y-1 transition-all duration-300 text-left w-full flex flex-col items-start"
        >
            <div className="bg-blue-100/70 p-3 rounded-full mb-4">
                {icon}
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 flex-grow">{description}</p>
        </button>
    );
};

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800">Trợ lý Da liễu AI</h1>
                <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                    Chọn một chức năng bên dưới để bắt đầu chẩn đoán và tạo phác đồ điều trị chuyên sâu, được cá nhân hóa cho từng bệnh nhân.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ServiceCard 
                    title="Chẩn đoán Chung" 
                    description="Phân tích tổng quát tình trạng da, chẩn đoán và tạo phác đồ toàn diện." 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    onClick={() => onNavigate('main')}
                />
                 <ServiceCard 
                    title="Phác đồ Trị Sẹo" 
                    description="Tập trung phân tích và đưa ra liệu trình chuyên biệt cho các loại sẹo." 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>}
                    onClick={() => onNavigate('scar')}
                />
                 <ServiceCard 
                    title="Phác đồ Trị Mụn" 
                    description="Xây dựng phác đồ điều trị cho các tình trạng mụn khác nhau." 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                    onClick={() => onNavigate('acne')}
                />
                 <ServiceCard 
                    title="Phác đồ Trị Nám" 
                    description="Phân tích chuyên sâu và tạo liệu trình cho nám, tàn nhang và tăng sắc tố." 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.5" /></svg>}
                    onClick={() => onNavigate('melasma')}
                />
                <ServiceCard 
                    title="Phác đồ Trẻ Hóa" 
                    description="Tạo phác đồ toàn diện để cải thiện lão hóa, nếp nhăn và độ săn chắc." 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                    onClick={() => onNavigate('rejuvenation')}
                />
                 <ServiceCard 
                    title="Kiểm tra Mỹ phẩm" 
                    description="Phân tích thành phần, nguồn gốc và độ phù hợp của mỹ phẩm với da." 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.24a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l-2.387-.477a2 2 0 01-.547-1.806zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    onClick={() => onNavigate('cosmetic-check')}
                />
            </div>
        </div>
    );
};