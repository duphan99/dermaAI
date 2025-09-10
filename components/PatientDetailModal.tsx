import React from 'react';
import type { AnyPatientRecord, InClinicProcedure, PatientRecord, CosmeticCheckRecord } from '../types';
import { CosmeticCheckResultDisplay } from './CosmeticCheckResultDisplay';

interface PatientDetailModalProps {
    record: AnyPatientRecord | null;
    onClose: () => void;
}

const DetailSection: React.FC<{ title: string, children: React.ReactNode, icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
            <span className="text-blue-600">{icon}</span>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <div className="pl-9 space-y-2 text-slate-700">
            {children}
        </div>
    </div>
);

const BoldLabelListItem: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/:(.*)/s); // Split on the first colon
    if (parts.length > 1 && parts[0].trim()) {
        return (
            <li>
                <span className="font-bold">{parts[0].trim()}:</span>
                <span className="ml-1">{parts[1].trim()}</span>
            </li>
        );
    }
    return <li>{text}</li>;
};

const RoutineList: React.FC<{ title: string, items: string[] | InClinicProcedure[] }> = ({ title, items }) => (
    <div>
        <h4 className="font-semibold text-md text-slate-600 mb-2">{title}</h4>
        {items.length > 0 ? (
            <ul className="list-disc list-inside space-y-3 text-slate-600">
                {items.map((item, index) => {
                    if (typeof item === 'string') {
                        return <BoldLabelListItem key={index} text={item} />;
                    }
                    return (
                        <li key={index} className="space-y-1">
                            <div className="font-semibold text-slate-800">{item.name} <span className="font-normal text-slate-500">({item.frequency})</span></div>
                            <p className="pl-5 text-slate-600">{item.description}</p>
                        </li>
                    );
                })}
            </ul>
        ) : (
            <p className="text-sm text-slate-400 italic">Không có chỉ định.</p>
        )}
    </div>
);

const GeneralRecordDetails: React.FC<{ record: PatientRecord }> = ({ record }) => (
    <>
        <h2 className="text-xl md:text-2xl font-bold text-blue-600 mb-2">Hồ sơ bệnh nhân</h2>
        <p className="text-slate-500 mb-6 border-b pb-4">
            Ngày khám: {new Date(record.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
        <div className="space-y-6">
            <DetailSection title="Thông tin Bệnh nhân" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
                <p><strong>Họ và tên:</strong> {record.patientInfo.fullName}</p>
                <p><strong>Tuổi:</strong> {record.patientInfo.age}</p>
                <p><strong>Địa chỉ:</strong> {record.patientInfo.address}</p>
                <p><strong>SĐT:</strong> {record.patientInfo.phoneNumber || 'N/A'}</p>
                <p><strong>Email:</strong> {record.patientInfo.email || 'N/A'}</p>
                {record.patientInfo.notes && <p className="mt-2 pt-2 border-t"><strong>Ghi chú:</strong> {record.patientInfo.notes}</p>}
            </DetailSection>
            <DetailSection title="Chẩn đoán" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>}>
                <p><strong>Tình trạng:</strong> {record.diagnosis.condition}</p>
                <p><strong>Mức độ:</strong> {record.diagnosis.severity}</p>
                <blockquote className="mt-2 p-3 bg-slate-50 border-l-4 border-slate-300 text-slate-600">{record.diagnosis.analysis}</blockquote>
            </DetailSection>
            <DetailSection title="Phác đồ Điều trị" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}>
                <div className="space-y-4">
                    <RoutineList title="Buổi sáng" items={record.treatmentPlan.morningRoutine} />
                    <RoutineList title="Buổi tối" items={record.treatmentPlan.eveningRoutine} />
                    <RoutineList title="Tại phòng khám" items={record.treatmentPlan.inClinicProcedures} />
                </div>
            </DetailSection>
             {record.expertAdvice && (
                <DetailSection 
                    title="Lời khuyên từ Chuyên gia" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                >
                    <div className="space-y-4">
                        <RoutineList title="Khuyến nghị chung" items={record.expertAdvice.recommendations} />
                        <RoutineList title="Liệu pháp kết hợp" items={record.expertAdvice.combinedTreatments} />
                    </div>
                </DetailSection>
            )}
        </div>
    </>
);

const CosmeticRecordDetails: React.FC<{ record: CosmeticCheckRecord }> = ({ record }) => (
     <>
        <h2 className="text-xl md:text-2xl font-bold text-teal-600 mb-2">Hồ sơ kiểm tra mỹ phẩm</h2>
        <p className="text-slate-500 mb-6 border-b pb-4">
            <strong>Khách hàng: {record.patientName}</strong> | Ngày kiểm tra: {new Date(record.createdAt).toLocaleDateString('vi-VN')}
        </p>
        <div className="space-y-6">
             <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Hình ảnh đã sử dụng</h3>
                <div className="flex flex-wrap gap-4">
                    <div>
                        <p className="text-sm font-semibold text-center mb-1">Khuôn mặt</p>
                        <img src={`data:${record.faceImage.mimeType};base64,${record.faceImage.base64}`} alt="Face" className="w-32 h-32 object-cover rounded-lg shadow-md" />
                    </div>
                    {record.productImages.map((img, i) => (
                         <div key={i}>
                            <p className="text-sm font-semibold text-center mb-1">Sản phẩm {i + 1}</p>
                            <img src={`data:${img.mimeType};base64,${img.base64}`} alt={`Product ${i+1}`} className="w-32 h-32 object-cover rounded-lg shadow-md" />
                        </div>
                    ))}
                </div>
            </div>
            <CosmeticCheckResultDisplay result={record.result} />
        </div>
    </>
);


export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ record, onClose }) => {
    if (!record) return null;

    const renderContent = () => {
        switch (record.recordType) {
            case 'general':
                return <GeneralRecordDetails record={record} />;
            case 'cosmetic':
                return <CosmeticRecordDetails record={record} />;
            // Add other cases for scar, acne, etc. later
            default:
                return <p>Không thể hiển thị loại hồ sơ này.</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Đóng">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {renderContent()}
            </div>
        </div>
    );
};