import React from 'react';
import { SKIN_CONDITION_IMAGES } from '../services/skinConditionData';

interface IllustrativeImagesProps {
    condition: string;
}

export const IllustrativeImages: React.FC<IllustrativeImagesProps> = ({ condition }) => {
    // So khớp tình trạng không phân biệt chữ hoa/thường
    const images = SKIN_CONDITION_IMAGES[condition.toLowerCase()];

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">Hình ảnh minh họa cho: {condition}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg overflow-hidden group shadow-sm flex flex-col">
                         <div className="overflow-hidden">
                            <img 
                                src={image.url} 
                                alt={image.description} 
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                        </div>
                        <p className="p-3 text-sm text-slate-600 bg-slate-50/70 flex-grow">{image.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
