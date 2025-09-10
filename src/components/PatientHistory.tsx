import React, { useState, useEffect } from 'react';
import { fetchPatientHistory } from '../services/apiService';
// FIX: Corrected import path to be relative
import type { PatientRecord } from '../types';
import { Loader } from './Loader';

interface PatientHistoryProps {
  onRecordSelect: (record: PatientRecord) => void;
}

export const PatientHistory: React.FC<PatientHistoryProps> = ({ onRecordSelect }) => {
  const [history, setHistory] = useState<PatientRecord[]>([]);
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
                Lịch sử Khám bệnh
            </h2>
            {history.length === 0 ? (
                 <div className="text-center py-12 text-slate-500">
                    <p className="font-semibold">Chưa có hồ sơ nào được lưu.</p>
                    <p className="text-sm mt-1">Các hồ sơ đã lưu sẽ xuất hiện tại đây.</p>
                 </div>
            ) : (
                <div className="space-y-4">
                {history.map(record => (
                    <div key={record.id} className="border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="flex-grow">
                            <p className="font-bold text-slate-800">{record.patientInfo.fullName} - {record.patientInfo.age} tuổi</p>
                            <p className="text-sm text-blue-600 font-semibold mt-1">{record.diagnosis.condition}</p>
                            <p className="text-xs text-slate-400 mt-2">
                            Ngày tạo: {new Date(record.createdAt).toLocaleString('vi-VN')}
                            </p>
                        </div>
                        <button
                            onClick={() => onRecordSelect(record)}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
                        >
                            Xem chi tiết
                        </button>
                    </div>
                ))}
                </div>
            )}
        </div>
    </div>
  );
};
