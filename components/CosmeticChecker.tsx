import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { Loader } from './Loader';
import { TextInput } from './TextInput';
import { fileToBase64 } from '../utils/file';
import { checkCosmeticSuitability } from '../services/geminiService';
import { saveCosmeticCheckRecordToDatabase } from '../services/apiService';
import type { CosmeticCheckResult } from '../types';
import { CosmeticCheckResultDisplay } from './CosmeticCheckResultDisplay';

export const CosmeticChecker: React.FC = () => {
    const [faceImage, setFaceImage] = useState<File[]>([]);
    const [productImages, setProductImages] = useState<File[]>([]);
    const [patientName, setPatientName] = useState('');
    
    const [faceImagePart, setFaceImagePart] = useState<{ base64: string; mimeType: string } | null>(null);
    const [productImageParts, setProductImageParts] = useState<{ base64: string; mimeType: string }[] | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CosmeticCheckResult | null>(null);

    const handleCheck = useCallback(async () => {
        if (faceImage.length === 0 || productImages.length === 0) {
            setError("Vui lòng tải lên cả ảnh khuôn mặt và ảnh sản phẩm.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const facePart = await fileToBase64(faceImage[0]);
            const productParts = await Promise.all(productImages.map(file => fileToBase64(file)));
            
            setFaceImagePart(facePart);
            setProductImageParts(productParts);

            const analysisResult = await checkCosmeticSuitability(facePart, productParts);
            setResult(analysisResult);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
            setError(`Không thể phân tích: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [faceImage, productImages]);

    const handleSave = async () => {
        if (!result || !faceImagePart || !productImageParts || !patientName.trim()) {
            alert("Thông tin không đầy đủ để lưu. Vui lòng nhập tên khách hàng.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
// FIX: Added missing 'recordType' property to satisfy the type.
            await saveCosmeticCheckRecordToDatabase({
                recordType: 'cosmetic',
                patientName,
                faceImage: faceImagePart,
                productImages: productImageParts,
                result,
            });
            alert("Đã lưu kết quả kiểm tra mỹ phẩm thành công!");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
            setError(`Lỗi khi lưu: ${errorMessage}`);
            alert(`Lỗi khi lưu: ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const canCheck = faceImage.length > 0 && productImages.length > 0 && !isLoading;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 space-y-6">
                 <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4">Kiểm tra & Tư vấn Mỹ phẩm</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ImageUploader onFilesSelect={setFaceImage} selectedFiles={faceImage} title="Ảnh khuôn mặt khách hàng (1 ảnh)"/>
                    <ImageUploader onFilesSelect={setProductImages} selectedFiles={productImages} title="Ảnh sản phẩm (Mặt trước, sau/bảng thành phần)"/>
                 </div>
                 <button onClick={handleCheck} disabled={!canCheck} className="w-full text-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl disabled:from-slate-300 transition-all duration-300">
                    {isLoading ? 'Đang phân tích...' : 'Kiểm tra & Tư vấn'}
                 </button>
            </div>
            
             {(isLoading || error || result) && (
                 <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 min-h-[400px]">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6 flex-wrap gap-4">
                        <h2 className="text-2xl font-bold text-slate-800">Kết quả Phân tích</h2>
                         {result && (
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex-grow">
                                     <TextInput name="patientName" label="Tên khách hàng để lưu" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Nhập tên..." required />
                                </div>
                                <button onClick={handleSave} disabled={isSaving || !patientName.trim()} className="bg-purple-100 text-purple-700 font-bold py-2 px-3 rounded-lg hover:bg-purple-200 disabled:bg-slate-200 disabled:text-slate-500 transition-colors flex items-center self-end h-[42px]">
                                     {isSaving ? 'Đang lưu...' : 'Lưu vào Lịch sử'}
                                </button>
                            </div>
                         )}
                    </div>
                    {isLoading && <Loader />}
                    {error && <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>}
                    {result && <CosmeticCheckResultDisplay result={result} />}
                 </div>
            )}
        </div>
    );
};
