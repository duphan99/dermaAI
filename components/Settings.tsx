import React, { useState, useMemo } from 'react';
import type { MachineInfo, CosmeticInfo } from '../types';
import { TagInput } from './TagInput';

interface SettingsProps {
    availableCosmetics: CosmeticInfo[];
    availableMachines: MachineInfo[];
    onCosmeticAdd: (newTag: string) => void;
    onCosmeticRemove: (index: number) => void;
    onCosmeticUpdate: (index: number, newTag: string) => void;
    onCosmeticsClear: () => void;
    onMachineAdd: (newTag: string) => void;
    onMachineRemove: (index: number) => void;
    onMachineUpdate: (index: number, newTag: string) => void;
    onMachinesClear: () => void;
    googleSheetUrl: string;
    onGoogleSheetUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFetchProducts: () => void;
    isFetchingProducts: boolean;
    fetchError: string | null;
}

export const Settings: React.FC<SettingsProps> = ({
    availableCosmetics,
    availableMachines,
    onCosmeticAdd,
    onCosmeticRemove,
    onCosmeticUpdate,
    onCosmeticsClear,
    onMachineAdd,
    onMachineRemove,
    onMachineUpdate,
    onMachinesClear,
    googleSheetUrl,
    onGoogleSheetUrlChange,
    onFetchProducts,
    isFetchingProducts,
    fetchError,
}) => {
    const [cosmeticFilter, setCosmeticFilter] = useState('');

    const filteredCosmetics = useMemo(() => {
        if (!cosmeticFilter.trim()) {
            return availableCosmetics;
        }
        const lowercasedFilter = cosmeticFilter.toLowerCase();
        return availableCosmetics.filter(cosmetic => {
            return (
                cosmetic.name.toLowerCase().includes(lowercasedFilter) ||
                cosmetic.brand.toLowerCase().includes(lowercasedFilter) ||
                cosmetic.description.toLowerCase().includes(lowercasedFilter) ||
                cosmetic.keywords.some(k => k.toLowerCase().includes(lowercasedFilter))
            );
        });
    }, [availableCosmetics, cosmeticFilter]);

    const handleFilteredCosmeticRemove = (filteredIndex: number) => {
        const cosmeticToRemove = filteredCosmetics[filteredIndex];
        if (!cosmeticToRemove) return;
        const originalIndex = availableCosmetics.findIndex(c => c.name === cosmeticToRemove.name);
        if (originalIndex !== -1) {
            onCosmeticRemove(originalIndex);
        }
    };

    const handleFilteredCosmeticUpdate = (filteredIndex: number, newTag: string) => {
        const cosmeticToUpdate = filteredCosmetics[filteredIndex];
        if (!cosmeticToUpdate) return;
        const originalIndex = availableCosmetics.findIndex(c => c.name === cosmeticToUpdate.name);
        if (originalIndex !== -1) {
            onCosmeticUpdate(originalIndex, newTag);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 animate-fade-in">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6">
                    Cài đặt & Tài nguyên Phòng khám
                </h2>
                <div className="space-y-10">
                    {/* Cosmetics Section */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-lg font-bold text-slate-700">Mỹ phẩm & Hoạt chất</h3>
                            {availableCosmetics.length > 0 && (
                                <button
                                    onClick={onCosmeticsClear}
                                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                                    aria-label="Xóa tất cả mỹ phẩm"
                                >
                                    Xóa tất cả
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Quản lý danh sách sản phẩm và hoạt chất mà AI có thể sử dụng. Thêm thủ công bên dưới hoặc tải hàng loạt từ Google Sheet.
                        </p>

                        {/* Google Sheet Loader */}
                        <div className="space-y-2 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <label htmlFor="google-sheet-url" className="block text-sm font-semibold text-gray-700">
                                Tải sản phẩm từ Google Sheet
                            </label>
                            <p className="text-xs text-slate-500 mb-2">Dán URL của file Google Sheet đã được xuất bản dưới dạng CSV.</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="url"
                                    id="google-sheet-url"
                                    placeholder="https://docs.google.com/spreadsheets/.../export?format=csv"
                                    value={googleSheetUrl}
                                    onChange={onGoogleSheetUrlChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 transition"
                                />
                                <button
                                    onClick={onFetchProducts}
                                    disabled={isFetchingProducts}
                                    className="bg-teal-600 text-white font-bold py-2 px-3 rounded-lg shadow-md hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex-shrink-0"
                                >
                                    {isFetchingProducts ? 'Đang tải...' : 'Tải'}
                                </button>
                            </div>
                            {fetchError && <p className="mt-2 text-sm text-red-600">{fetchError}</p>}
                        </div>

                        {/* Cosmetic Search Filter */}
                        <div className="relative mb-4">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="search"
                                placeholder="Tìm kiếm mỹ phẩm (theo tên, hoạt chất, tình trạng da...)"
                                value={cosmeticFilter}
                                onChange={(e) => setCosmeticFilter(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 transition"
                                aria-label="Tìm kiếm mỹ phẩm"
                            />
                        </div>
                        
                        {cosmeticFilter && filteredCosmetics.length === 0 && (
                            <div className="text-center py-4 text-slate-500 bg-slate-50 rounded-lg">
                                <p>Không tìm thấy sản phẩm nào khớp với "{cosmeticFilter}".</p>
                            </div>
                        )}

                        <TagInput
                            label="Danh sách sản phẩm (Thêm/Sửa thủ công)"
                            tags={filteredCosmetics.map(c => c.name)}
                            onTagAdd={onCosmeticAdd}
                            onTagRemove={handleFilteredCosmeticRemove}
                            onTagUpdate={handleFilteredCosmeticUpdate}
                            placeholder="Nhập tên sản phẩm rồi nhấn Enter..."
                        />
                    </div>

                    {/* Machines Section */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <h3 className="text-lg font-bold text-slate-700">Máy móc & Công nghệ</h3>
                              {availableMachines.length > 0 && (
                                <button
                                    onClick={onMachinesClear}
                                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                                    aria-label="Xóa tất cả máy móc"
                                >
                                    Xóa tất cả
                                </button>
                            )}
                        </div>
                         <p className="text-sm text-slate-500 mb-4">
                            Quản lý danh sách các máy thẩm mỹ và công nghệ có sẵn tại phòng khám.
                        </p>
                        <TagInput
                            tags={availableMachines.map(m => m.name)}
                            onTagAdd={onMachineAdd}
                            onTagRemove={onMachineRemove}
                            onTagUpdate={onMachineUpdate}
                            placeholder="Nhập tên máy rồi nhấn Enter..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};