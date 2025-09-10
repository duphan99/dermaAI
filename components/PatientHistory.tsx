import React, { useState, useEffect } from 'react';
import { fetchPatientHistory } from '../services/apiService';
import type { AnyPatientRecord, CosmeticCheckRecord, PatientRecord } from '../types';
import { Loader } from './Loader';

interface PatientHistoryProps {
  onRecordSelect: (record: AnyPatientRecord) => void;
}

const RecordCard: React.FC<{record: AnyPatientRecord; onSelect: () => void}> = ({ record, onSelect }) => {
    let title = '';
    let description = '';
    let icon: React.ReactNode;

    switch (record.recordType) {
        case 'general':
            title = record.patientInfo.fullName;
            description = record.diagnosis.condition;
            icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
            break;
        case 'cosmetic':
            title = `Kiểm tra mỹ phẩm cho: ${record.patientName}`;
            description = `Kết quả: ${record.result.suitability}`;
            icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.24a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l-2.387-.477a2 2 0 01-.547-1.806zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
            break;
        // Add cases for scar, acne etc. if needed
        default:
            title = 'Hồ sơ không xác định';
            description = 'Không có chi tiết';
            icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }

    return (
         <div className="border border-slate-200 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-50 transition-colors">
            <div className="flex-shrink-0 bg-slate-100 p-3 rounded-full">{icon}</div>
            <div className="flex-grow">
                <p className="font-bold text-slate-800">{title}</p>
                <p className="text-sm text-slate-600 font-semibold mt-1">{description}</p>
                <p className="text-xs text-slate-400 mt-2">
                    Ngày tạo: {new Date(record.createdAt).toLocaleString('vi-VN')}
                </p>
            </div>
            <button
                onClick={onSelect}
                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto flex-shrink-0"
            >
                Xem chi tiết
            </button>
        </div>
    )
}


export const PatientHistory: React.FC<PatientHistoryProps> = ({ onRecordSelect }) => {
  const [history, setHistory] = useState<AnyPatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const records = await fetchPatientHistory();
        setHistory(records);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi không xác định.';
        setError(`Không thể tải lịch sử: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
            <p className="font-bold">Lỗi</p>
            <p>{error}</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6">
                Lịch sử Toàn diện
            </h2>
            {history.length === 0 ? (
                 <div className="text-center py-12 text-slate-500">
                    <p className="font-semibold">Chưa có hồ sơ nào được lưu.</p>
                    <p className="text-sm mt-1">Các hồ sơ đã lưu sẽ xuất hiện tại đây.</p>
                 </div>
            ) : (
                <div className="space-y-4">
                {history.map(record => (
                   <RecordCard key={record.id} record={record} onSelect={() => onRecordSelect(record)} />
                ))}
                </div>
            )}
        </div>
    </div>
  );
};