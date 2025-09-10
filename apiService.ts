import type { PatientRecord, InClinicProcedure, ScarPatientRecord, AcnePatientRecord, CosmeticInfo, RejuvenationPatientRecord } from './types';
import { addPatientRecord, getPatientHistory, addScarRecord, addAcneRecord, addRejuvenationRecord } from './dbService';

export const fetchPatientHistory = async (): Promise<PatientRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  try {
    const records = await getPatientHistory();
    return records;
  } catch (error) {
    console.error("Failed to fetch patient history:", error);
    throw new Error("Không thể tải lịch sử bệnh nhân từ cơ sở dữ liệu cục bộ.");
  }
};

export const saveRecordToDatabase = async (record: Omit<PatientRecord, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
  try {
    await addPatientRecord(record);
    return { success: true, message: "Hồ sơ đã được lưu thành công vào database." };
  } catch(e) {
    console.error("Error saving to database:", e);
    throw new Error("Không thể lưu dữ liệu vào database cục bộ.");
  }
};

export const savePatientRecord = async (record: Omit<PatientRecord, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
  await saveRecordToDatabase(record);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, message: "Hồ sơ đã được lưu thành công." };
};

export const sendEmailToPatient = async (record: Omit<PatientRecord, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
  console.log(`SIMULATING SENDING EMAIL TO ${record.patientInfo.email}:`, record);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, message: `Email đã được gửi thành công tới ${record.patientInfo.email}.` };
};

export const sendZaloMessage = async (record: Omit<PatientRecord, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
  const { patientInfo, diagnosis, treatmentPlan } = record;
  const formatList = (items: string[]) => items.map(item => `- ${item}`).join('\n');
  const message = `
Chào ${patientInfo.fullName},
Phòng khám gửi bạn kết quả chẩn đoán và phác đồ điều trị da của mình:
🔬 *CHẨN ĐOÁN*
- Tình trạng: ${diagnosis.condition}
- Mức độ: ${diagnosis.severity}
- Phân tích chi tiết: ${diagnosis.analysis}
📋 *PHÁC ĐỒ ĐIỀU TRỊ*
**Buổi sáng:**
${formatList(treatmentPlan.morningRoutine)}
**Buổi tối:**
${formatList(treatmentPlan.eveningRoutine)}
**Liệu trình tại phòng khám:**
${formatList(treatmentPlan.inClinicProcedures.map(p => `${p.name} (${p.frequency}): ${p.description}`))}
---
Lưu ý: Đây là phác đồ do AI đề xuất và đã được bác sĩ xem xét. Vui lòng tuân thủ hướng dẫn.`;
  console.log(`SIMULATING SENDING ZALO MESSAGE TO ${patientInfo.phoneNumber}:`, message);
  await new Promise(resolve => setTimeout(resolve, 1800));
  return { success: true, message: `Tin nhắn Zalo đã được gửi thành công tới ${patientInfo.phoneNumber}.` };
};

export const saveScarRecordToDatabase = async (record: Omit<ScarPatientRecord, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
  try {
    await addScarRecord(record);
    return { success: true, message: "Hồ sơ trị sẹo đã được lưu thành công." };
  } catch(e) {
    throw new Error("Không thể lưu dữ liệu trị sẹo vào database.");
  }
};

export const saveAcneRecordToDatabase = async (record: Omit<AcnePatientRecord, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
  try {
    await addAcneRecord(record);
    return { success: true, message: "Hồ sơ trị mụn đã được lưu thành công." };
  } catch (e) {
    throw new Error("Không thể lưu dữ liệu trị mụn vào database.");
  }
};

export const fetchProductsFromGoogleSheet = async (url: string): Promise<CosmeticInfo[]> => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Sheet fetch failed with status ${response.status}`);
        const csvText = await response.text();
        const rows = csvText.split(/\r?\n/).slice(1);
        const products: CosmeticInfo[] = rows
            .map(row => {
                const columns = row.split(',');
                if (columns.length < 6) return null;
                const usageValue = columns[5]?.trim().toLowerCase();
                let usage: 'morning' | 'evening' | 'both' = 'both';
                if (usageValue === 'morning' || usageValue === 'evening') {
                    usage = usageValue;
                }
                return {
                    name: columns[0]?.trim() || '',
                    brand: columns[1]?.trim() || 'N/A',
                    url: columns[2]?.trim() || '#',
                    description: columns[3]?.trim() || '',
                    keywords: columns[4]?.trim().split(';').map(k => k.trim()).filter(Boolean) || [],
                    usage: usage,
                };
            })
            .filter((p): p is CosmeticInfo => p !== null && p.name !== '');
        return products;
    } catch (error) {
        console.error("Error fetching or parsing Google Sheet CSV:", error);
        throw new Error("Không thể tải hoặc xử lý dữ liệu từ Google Sheet.");
    }
};