

import React, { useState, useCallback } from 'react';
import type { PatientInfo, AcneInfo, MachineInfo, CosmeticInfo, FaceImages, AcneAnalysisResult, AcnePatientRecord } from '../types';
import { analyzeAcneCondition } from '../services/geminiService';
import { saveAcneRecordToDatabase } from '../services/apiService';
import { generateAcneReportPDF } from '../services/pdfService';
import { fileToBase64 } from '../utils/file';
import { ImageUploader } from './ImageUploader';
import { TextInput } from './TextInput';
import { TextAreaInput } from './TextAreaInput';
import { Loader } from './Loader';
import { AcneResultDisplay } from './AcneResultDisplay';

interface AcneTreatmentPlanProps {
    availableMachines: MachineInfo[];
    availableCosmetics: CosmeticInfo[];
}

export const AcneTreatmentPlan: React.FC<AcneTreatmentPlanProps> = ({ availableMachines, availableCosmetics }) => {
    const [patientImageFiles, setPatientImageFiles] = useState<File[]>([]);
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({ fullName: '', age: '', address: '' });
    const [acneInfo, setAcneInfo] = useState<AcneInfo>({ acneType: 'Chưa xác định', duration: '', triggers: '', pastTreatments: '', notes: '' });
    
    const [analysisResult, setAnalysisResult] = useState<AcneAnalysisResult | null>(null);
    const [editablePlan, setEditablePlan] = useState<AcneAnalysisResult['treatmentPlan'] | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatientInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleAcneInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setAcneInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
            
            const result = await analyzeAcneCondition(imageParts, acneInfo, patientInfo, productNames, machineNames);
            
            setAnalysisResult(result);
            setEditablePlan(result.treatmentPlan);
        } catch (err) {
            setError(`Phân tích thất bại: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
        } finally {
            setIsLoading(false);
        }
    }, [patientImageFiles, patientInfo, acneInfo, availableCosmetics, availableMachines]);

    const getRecord = (): Omit<AcnePatientRecord, 'id' | 'createdAt'> | null => {
        if (!analysisResult || !editablePlan) return null;
        return { patientInfo, acneInfo, analysisResult: { ...analysisResult, treatmentPlan: editablePlan }, recordType: 'acne' };
    }

    const handleSave = async () => {
        const record = getRecord();
        if (!record) return alert("Không có dữ liệu hợp lệ để lưu.");
        setIsSaving(true);
        try {
            await saveAcneRecordToDatabase(record);
            alert("Đã lưu hồ sơ trị mụn thành công!");
        } catch (e) {
            alert(`Lỗi khi lưu: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDownloadPdf = async () => {
        const record = getRecord();
        if (!record) return alert("Không có dữ liệu hợp lệ để tạo PDF.");
        try {
            await generateAcneReportPDF(record);
        } catch(e) {
             alert(`Lỗi khi tạo PDF: ${e instanceof Error ? e.message : String(e)}`);
        }
    };
    
    const canAnalyze = patientImageFiles.length > 0 && patientInfo.fullName && patientInfo.age && !isLoading;

    return (
         <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4">Phân tích & Lên phác đồ Trị Mụn</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl">
                         <h3 className="text-lg font-semibold text-slate-700">Thông tin Bệnh nhân & Mụn</h3>
                         <TextInput name="fullName" label="Họ và tên" value={patientInfo.fullName} onChange={handlePatientInfoChange} required placeholder="Nguyễn Văn A" />
                         <TextInput name="age" label="Tuổi" type="number" value={patientInfo.age} onChange={handlePatientInfoChange} required placeholder="19" />
                         <label htmlFor="acneType" className="block text-sm font-medium text-slate-700 mb-1">Loại mụn (Nếu rõ)</label>
                         <select id="acneType" name="acneType" value={acneInfo.acneType} onChange={handleAcneInfoChange} className="block w-full rounded-lg border-slate-300 shadow-sm p-2.5">
                             <option>Chưa xác định</option>
                             <option>Mụn viêm (Papules/Pustules)</option>
                             <option>Mụn ẩn/đầu đen (Comedonal)</option>
                             <option>Mụn nang/nặng (Nodulocystic)</option>
                             <option>Mụn nội tiết (Hormonal)</option>
                         </select>
                         <TextInput name="duration" label="Thời gian bị mụn" value={acneInfo.duration} onChange={handleAcneInfoChange} placeholder="Khoảng 1 năm" />
                         <TextAreaInput id="pastTreatments" name="pastTreatments" label="Các phương pháp đã điều trị" value={acneInfo.pastTreatments} onChange={handleAcneInfoChange} rows={2} placeholder="Từng dùng BHA, Tretinoin..."/>
                    </div>
                    <ImageUploader onFilesSelect={setPatientImageFiles} selectedFiles={patientImageFiles} title="Hình ảnh da của bệnh nhân"/>
                </div>
                 <button onClick={handleAnalysis} disabled={!canAnalyze} className="w-full text-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl disabled:from-slate-300 transition-all duration-300">
                    {isLoading ? 'Đang phân tích...' : 'Phân tích Mụn & Tạo phác đồ'}
                </button>
            </div>
            
            {(isLoading || error || analysisResult) && (
                 <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 min-h-[400px]">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Kết quả & Phác đồ trị mụn</h2>
                         {analysisResult && (
                            <div className="flex items-center gap-2">
                                <button onClick={handleDownloadPdf} className="bg-red-100 text-red-700 font-bold py-2 px-3 rounded-lg hover:bg-red-200">PDF</button>
                                <button onClick={handleSave} disabled={isSaving} className="bg-purple-100 text-purple-700 font-bold py-2 px-3 rounded-lg hover:bg-purple-200 disabled:bg-slate-200 disabled:text-slate-500 transition-colors flex items-center" title="Lưu hồ sơ vào cơ sở dữ liệu">
                                  {isSaving ? <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7l8-4 8 4m0 10c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
                                  <span>{isSaving ? 'Đang lưu...' : 'Lưu trữ'}</span>
                                </button>
                            </div>
                         )}
                    </div>
                    {isLoading && <Loader />}
                    {error && <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>}
                    {analysisResult && editablePlan && (
                        <AcneResultDisplay
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