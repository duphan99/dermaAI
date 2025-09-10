import React, { useState, useCallback } from 'react';
import type { PatientInfo, RejuvenationInfo, MachineInfo, CosmeticInfo, FaceImages, RejuvenationAnalysisResult, RejuvenationPatientRecord } from '../types';
import { analyzeRejuvenationNeeds } from '../services/geminiService';
import { ImageUploader } from './ImageUploader';
import { TextInput } from './TextInput';
import { TextAreaInput } from './TextAreaInput';
import { Loader } from './Loader';
import { RejuvenationResultDisplay } from './RejuvenationResultDisplay';
import { fileToBase64 } from '../utils/file';

interface RejuvenationTreatmentPlanProps {
    availableMachines: MachineInfo[];
    availableCosmetics: CosmeticInfo[];
}

export const RejuvenationTreatmentPlan: React.FC<RejuvenationTreatmentPlanProps> = ({ availableMachines, availableCosmetics }) => {
    const [patientImageFiles, setPatientImageFiles] = useState<File[]>([]);
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({ fullName: '', age: '', address: '' });
    const [rejuvenationInfo, setRejuvenationInfo] = useState<RejuvenationInfo>({ mainConcerns: 'Nếp nhăn, chảy xệ', targetArea: 'Toàn mặt', pastTreatments: '', notes: '' });
    
    const [analysisResult, setAnalysisResult] = useState<RejuvenationAnalysisResult | null>(null);
    const [editablePlan, setEditablePlan] = useState<RejuvenationAnalysisResult['treatmentPlan'] | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatientInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleRejuvenationInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRejuvenationInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAnalysis = useCallback(async () => {
        if (patientImageFiles.length === 0 || !patientInfo.fullName || !patientInfo.age) {
            setError('Vui lòng điền đầy đủ thông tin bệnh nhân và tải lên ít nhất một hình ảnh.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const imageParts = await Promise.all(patientImageFiles.map(file => fileToBase64(file)));
            const productNames = availableCosmetics.map(p => p.name);
            const machineNames = availableMachines.map(m => m.name);
            
            const result = await analyzeRejuvenationNeeds(imageParts, rejuvenationInfo, patientInfo, productNames, machineNames);
            
            setAnalysisResult(result);
            setEditablePlan(result.treatmentPlan);
        } catch (err) {
            setError(`Phân tích thất bại: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
        }
    }, [patientImageFiles, patientInfo, rejuvenationInfo, availableCosmetics, availableMachines]);

    const canAnalyze = patientImageFiles.length > 0 && patientInfo.fullName && patientInfo.age && !isLoading;

    return (
         <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4">Phân tích & Lên phác đồ Trẻ Hóa Da</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl">
                         <h3 className="text-lg font-semibold text-slate-700">Thông tin Bệnh nhân & Nhu cầu Trẻ hóa</h3>
                         <TextInput name="fullName" label="Họ và tên" value={patientInfo.fullName} onChange={handlePatientInfoChange} required placeholder="Lê Thị D" />
                         <TextInput name="age" label="Tuổi" type="number" value={patientInfo.age} onChange={handlePatientInfoChange} required placeholder="50" />
                         <TextInput name="mainConcerns" label="Mối quan tâm chính" value={rejuvenationInfo.mainConcerns} onChange={handleRejuvenationInfoChange} placeholder="Nếp nhăn, chảy xệ" />
                         <TextInput name="targetArea" label="Vùng cần điều trị" value={rejuvenationInfo.targetArea} onChange={handleRejuvenationInfoChange} placeholder="Toàn mặt, cổ" />
                         <TextAreaInput id="notes" name="notes" label="Ghi chú thêm" value={rejuvenationInfo.notes || ''} onChange={handleRejuvenationInfoChange} rows={2} placeholder="Mong muốn cải thiện rãnh cười..."/>
                    </div>
                    <ImageUploader onFilesSelect={setPatientImageFiles} selectedFiles={patientImageFiles} title="Hình ảnh da của bệnh nhân" />
                </div>
                 <button onClick={handleAnalysis} disabled={!canAnalyze} className="w-full text-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl disabled:from-slate-300 transition-all duration-300">
                    {isLoading ? 'Đang phân tích...' : 'Phân tích Trẻ hóa & Tạo phác đồ'}
                </button>
            </div>
            
            {(isLoading || error || analysisResult) && (
                 <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 min-h-[400px]">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Kết quả & Phác đồ trẻ hóa</h2>
                         {analysisResult && (
                            <div className="flex items-center gap-2">
                                {/* Add PDF/Save buttons here */}
                            </div>
                         )}
                    </div>
                    {isLoading && <Loader />}
                    {error && <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>}
                    {analysisResult && editablePlan && (
                        <RejuvenationResultDisplay
                            result={analysisResult} 
                            editablePlan={editablePlan} 
                            onPlanChange={setEditablePlan}
                            availableMachines={availableMachines}
                            availableCosmetics={availableCosmetics}
                        />
                    )}
                 </div>
            )}
        </div>
    );
};