import React from 'react';
import type { CosmeticCheckResult } from '../types';

interface CosmeticCheckResultDisplayProps {
    result: CosmeticCheckResult;
}

const getSuitabilityClass = (suitability: CosmeticCheckResult['suitability']) => {
    switch (suitability) {
        case 'Phù hợp': return 'bg-green-100 text-green-800 border-green-400';
        case 'Cần cẩn trọng': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
        case 'Không phù hợp': return 'bg-red-100 text-red-800 border-red-400';
        default: return 'bg-slate-100 text-slate-800 border-slate-400';
    }
};
const Section: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-600">{icon}</span>
            <h3 className="text-lg md:text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <div className="pl-10">
            {children}
        </div>
    </div>
);


export const CosmeticCheckResultDisplay: React.FC<CosmeticCheckResultDisplayProps> = ({ result }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Suitability Badge */}
            <div className={`p-4 rounded-xl border-l-4 ${getSuitabilityClass(result.suitability)}`}>
                <h4 className="text-xl font-bold">Đánh giá: {result.suitability}</h4>
            </div>

            {/* Analysis Section */}
            <Section title="Phân tích chi tiết" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">{result.analysis}</p>
            </Section>

             {/* Pros and Cons Section */}
            {(result.pros?.length > 0 || result.cons?.length > 0) && (
                <Section title="Ưu & Nhược điểm" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pros */}
                        <div>
                            <h4 className="font-semibold text-lg text-green-600 mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                Ưu điểm
                            </h4>
                            {result.pros && result.pros.length > 0 ? (
                                <ul className="list-disc list-inside space-y-2 text-slate-600">
                                    {result.pros.map((pro, index) => <li key={`pro-${index}`}>{pro}</li>)}
                                </ul>
                            ) : <p className="text-sm text-slate-400 italic">Không có ưu điểm đáng chú ý.</p>}
                        </div>
                        {/* Cons */}
                        <div>
                            <h4 className="font-semibold text-lg text-red-600 mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                Nhược điểm / Cần lưu ý
                            </h4>
                            {result.cons && result.cons.length > 0 ? (
                                <ul className="list-disc list-inside space-y-2 text-slate-600">
                                    {result.cons.map((con, index) => <li key={`con-${index}`}>{con}</li>)}
                                </ul>
                            ) : <p className="text-sm text-slate-400 italic">Không có nhược điểm đáng chú ý.</p>}
                        </div>
                    </div>
                </Section>
            )}

            {/* Usage Advice Section */}
            {result.usageAdvice && (
                <Section title="Tư vấn sử dụng" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                    <p className="text-slate-600 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-200">{result.usageAdvice}</p>
                </Section>
            )}


            {/* Similar Products */}
            {result.similarProducts && result.similarProducts.length > 0 && (
                <Section title="Gợi ý sản phẩm tương tự" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.24a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l-2.387-.477a2 2 0 01-.547-1.806zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
                    <div className="space-y-3">
                        {result.similarProducts.map((product, index) => (
                            <div key={index} className="p-3 bg-white rounded-lg border border-slate-200">
                                <p className="font-semibold text-slate-800">{product.name}</p>
                                <p className="text-sm text-slate-500 mt-1">{product.reason}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

             {/* Origin Info */}
            <Section title="Thông tin Nguồn gốc" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.536.536M16.293 4.293l-.536.536M7.707 19.707l.536-.536M16.293 19.707l-.536-.536M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>}>
                <div className="space-y-2 text-slate-700">
                    <p><strong>Xuất xứ thương hiệu:</strong> {result.originInfo.brandOrigin}</p>
                    <p><strong>Nhà phân phối tại Việt Nam:</strong> {result.originInfo.distributor || 'Không tìm thấy thông tin'}</p>
                    {result.originInfo.sources && result.originInfo.sources.length > 0 && (
                        <div className="pt-3 mt-3 border-t">
                            <h5 className="font-semibold text-sm mb-2 text-slate-500">Nguồn tham khảo:</h5>
                            <ul className="list-disc list-inside space-y-1">
                                {result.originInfo.sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </Section>

            {/* Disclaimer */}
             <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
                <h4 className="font-bold">Miễn trừ trách nhiệm</h4>
                <p className="mt-1">{result.disclaimer}</p>
            </div>
        </div>
    );
};