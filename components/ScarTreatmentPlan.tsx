

import React, { useState, useCallback } from 'react';
import type { PatientInfo, ScarInfo, MachineInfo, CosmeticInfo, ScarAnalysisResult, ScarPatientRecord } from '../types';
import { analyzeScarCondition } from '../services/geminiService';
import { saveScarRecordToDatabase } from '../services/apiService';
import { generateScarReportPDF } from '../services/pdfService';
import { fileToBase64 } from '../utils/file';
import { ImageUploader } from './ImageUploader';
import { TextInput } from './TextInput';
import { TextAreaInput } from './TextAreaInput';
import { Loader } from './Loader';
import { ScarResultDisplay } from './ScarResultDisplay';

interface ScarTreatmentPlanProps {
    availableMachines: MachineInfo[];
    availableCosmetics: CosmeticInfo[];
}

export const ScarTreatmentPlan: React.FC<ScarTreatmentPlanProps> = ({ availableMachines, availableCosmetics }) => {
    const [patientImageFiles, setPatientImageFiles] = useState<File[]>([]);
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({ fullName: '', age: '', address: '', phoneNumber: '', email: '', notes: '' });
    const [scarInfo, setScarInfo] = useState<ScarInfo>({ scarType: 'Sẹo rỗ đáy nhọn (Ice Pick)', location: 'Má', duration: '', notes: '' });
    
    const [analysisResult, setAnalysisResult] = useState<ScarAnalysisResult | null>(null);
    const [editablePlan, setEditablePlan] = useState<ScarAnalysisResult['treatmentPlan'] | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPatientInfo(prev => ({ ...prev, [name]: value }));
    };
    
    const handleScarInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setScarInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleAnalysis = useCallback(async () => {
        const imageFiles = patientImageFiles;

        if (imageFiles.length === 0 || !patientInfo.fullName || !patientInfo.age || !scarInfo.duration) {
            setError('Vui lòng điền đầy đủ thông tin bệnh nhân, thông tin sẹo và tải lên ít nhất một hình ảnh.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setEditablePlan(null);

        try {
            const imagePromises = imageFiles.map(file => fileToBase64(file));
            const imageParts = await Promise.all(imagePromises);
            const productNames = availableCosmetics.map(p => p.name);
            const machineNames = availableMachines.map(m => m.name);
            
            const result = await analyzeScarCondition(imageParts, scarInfo, patientInfo, productNames, machineNames);
            
            setAnalysisResult(result);
            setEditablePlan(result.treatmentPlan);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            setError(`Không thể phân tích sẹo. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [patientImageFiles, patientInfo, scarInfo, availableCosmetics, availableMachines]);
    
    const getRecord = (): Omit<ScarPatientRecord, 'id' | 'createdAt'> | null => {
        if (!analysisResult || !editablePlan) return null;
        return { recordType: 'scar', patientInfo, scarInfo, analysisResult: { ...analysisResult, treatmentPlan: editablePlan } };
    }

    const handleSave = async () => {
        const record = getRecord();
        if (!record) {
            alert("Không có dữ liệu hợp lệ để lưu.");
            return;
        }
        setIsSaving(true);
        try {
            await saveScarRecordToDatabase(record);
            alert("Đã lưu hồ sơ trị sẹo thành công!");
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
            await generateScarReportPDF(record);
        } catch(e) {
             alert(`Lỗi khi tạo PDF: ${e instanceof Error ? e.message : String(e)}`);
        }
    };

    const canAnalyze = patientImageFiles.length > 0 && patientInfo.fullName && patientInfo.age && scarInfo.duration && !isLoading;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4">Phân tích & Lên phác đồ Trị Sẹo</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Patient and Scar Info */}
                    <div className="space-y-6">
                        <div className="space-y-4 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl">
                             <h3 className="text-lg font-semibold text-slate-700">Thông tin Bệnh nhân</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput name="fullName" label="Họ và tên" placeholder="Nguyễn Văn A" value={patientInfo.fullName} onChange={handlePatientInfoChange} required />
                                <TextInput name="age" label="Tuổi" placeholder="25" type="number" value={patientInfo.age} onChange={handlePatientInfoChange} required />
                             </div>
                        </div>
                        <div className="space-y-4 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl">
                             <h3 className="text-lg font-semibold text-slate-700">Thông tin Sẹo</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="scarType" className="block text-sm font-medium text-slate-700 mb-1">Loại sẹo (chính)</label>
                                    <select id="scarType" name="scarType" value={scarInfo.scarType} onChange={handleScarInfoChange} className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 p-2.5 transition">
                                        <option>Sẹo rỗ đáy nhọn (Ice Pick)</option>
                                        <option>Sẹo rỗ đáy vuông (Boxcar)</option>
                                        <option>Sẹo rỗ lượn sóng (Rolling)</option>
                                        <option>Sẹo lồi (Hypertrophic / Keloid)</option>
                                        <option>Sẹo thâm (Tăng sắc tố sau viêm - PIH)</option>
                                        <option>Sẹo đỏ (Hồng ban sau viêm - PIE)</option>
                                        <option>Sẹo hỗn hợp (Nhiều loại sẹo)</option>
                                    </select>
                                </div>
                                <TextInput name="location" label="Vị trí" placeholder="Hai bên má, trán..." value={scarInfo.location} onChange={handleScarInfoChange} />
                                <TextInput name="duration" label="Thời gian bị sẹo" placeholder="Khoảng 2 năm" value={scarInfo.duration} onChange={handleScarInfoChange} required />
                             </div>
                              <TextAreaInput id="notes" name="notes" label="Ghi chú thêm" placeholder="Ví dụ: Sẹo sâu, đã từng trị liệu laser..." value={scarInfo.notes || ''} onChange={handleScarInfoChange} rows={2} />
                        </div>
                    </div>
                    {/* Image Uploader */}
                    <ImageUploader onFilesSelect={setPatientImageFiles} selectedFiles={patientImageFiles} title="Hình ảnh sẹo của bệnh nhân"/>
                </div>

                <button onClick={handleAnalysis} disabled={!canAnalyze} className="w-full text-lg bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-600 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out">
                    {isLoading ? 'Đang phân tích...' : 'Phân tích Sẹo & Tạo phác đồ'}
                </button>
            </div>
            
            {(isLoading || error || analysisResult) && (
                 <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 min-h-[400px]">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Kết quả & Phác đồ trị sẹo</h2>
                         {analysisResult && (
                            <div className="flex items-center gap-2">
                                <button onClick={handleDownloadPdf} className="bg-red-100 text-red-700 font-bold py-2 px-3 rounded-lg hover:bg-red-200 transition-colors">PDF</button>
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
                        <ScarResultDisplay 
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