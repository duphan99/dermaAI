import { GoogleGenAI, Type } from "@google/genai";
import type { PatientInfo, AnalysisResult, ScarInfo, ScarAnalysisResult, AcneInfo, AcneAnalysisResult, MelasmaInfo, MelasmaAnalysisResult, RejuvenationInfo, RejuvenationAnalysisResult } from '../types';

// FIX: Initialize GoogleGenAI with a named apiKey parameter as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_API_KEY! });

/**
 * Parses the JSON response from the Gemini API.
 * Handles cases where the JSON is wrapped in markdown code blocks.
 * @param text The raw text response from the API.
 * @returns The parsed JSON object.
 */
const parseJsonResponse = <T>(text: string): T => {
    try {
        const jsonString = text.replace(/^```json\s*|```\s*$/g, '').trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON response:", text, e);
        throw new Error("AI returned a response that was not in the expected JSON format.");
    }
}

const disclaimerText = "Kết quả chẩn đoán và phác đồ điều trị này được tạo ra bởi trí tuệ nhân tạo (AI) và chỉ mang tính chất tham khảo. Luôn cần có sự tư vấn, xác nhận và giám sát từ bác sĩ da liễu có chuyên môn trước khi áp dụng bất kỳ liệu trình nào.";

// --- Schemas for structured JSON output ---

const analysisResultSchema = {
    type: Type.OBJECT,
    properties: {
        diagnosis: {
            type: Type.OBJECT,
            properties: {
                condition: { type: Type.STRING, description: "Tên tình trạng da chính (ví dụ: Mụn trứng cá viêm, Tăng sắc tố sau viêm, Lão hóa da)." },
                severity: { type: Type.STRING, description: "Mức độ của tình trạng (ví dụ: Nhẹ, Trung bình, Nặng)." },
                analysis: { type: Type.STRING, description: "Phân tích chi tiết về tình trạng da dựa trên hình ảnh và thông tin, bao gồm các dấu hiệu quan sát được." },
            },
            required: ['condition', 'severity', 'analysis']
        },
        treatmentPlan: {
            type: Type.OBJECT,
            properties: {
                morningRoutine: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các bước chăm sóc da buổi sáng, bao gồm các sản phẩm được đề xuất." },
                eveningRoutine: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các bước chăm sóc da buổi tối, bao gồm các sản phẩm được đề xuất." },
                inClinicProcedures: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Tên liệu trình tại phòng khám (ví dụ: Laser CO2 Fractional, Peel da hóa học)." },
                            frequency: { type: Type.STRING, description: "Tần suất thực hiện liệu trình (ví dụ: 1 lần/tháng)." },
                            description: { type: Type.STRING, description: "Mô tả ngắn gọn về mục đích của liệu trình." },
                        },
                         required: ['name', 'frequency', 'description']
                    }
                },
            },
            required: ['morningRoutine', 'eveningRoutine', 'inClinicProcedures']
        },
    },
    required: ['diagnosis', 'treatmentPlan']
};

export const analyzeSkinCondition = async (
    imageParts: { base64: string, mimeType: string }[],
    patientInfo: PatientInfo,
    availableProducts: string[],
    availableMachines: string[]
): Promise<AnalysisResult> => {

    const imageContent = imageParts.map(part => ({
        inlineData: {
            data: part.base64,
            mimeType: part.mimeType
        }
    }));
    
    const prompt = `Bạn là một trợ lý AI chuyên gia da liễu. Dựa vào hình ảnh da và thông tin bệnh nhân sau đây, hãy đưa ra chẩn đoán và phác đồ điều trị.
    
    Thông tin bệnh nhân:
    - Họ tên: ${patientInfo.fullName}
    - Tuổi: ${patientInfo.age}
    - Địa chỉ: ${patientInfo.address}
    - Ghi chú: ${patientInfo.notes || 'Không có'}

    Tài nguyên có sẵn:
    - Các sản phẩm/hoạt chất có thể dùng: ${availableProducts.join(', ')}
    - Các máy móc/công nghệ tại phòng khám: ${availableMachines.join(', ')}

    Yêu cầu:
    1.  Chẩn đoán tình trạng da chính, mức độ và phân tích chi tiết.
    2.  Lập phác đồ điều trị bao gồm quy trình buổi sáng, buổi tối và các liệu trình tại phòng khám.
    3.  Chỉ đề xuất các sản phẩm và máy móc từ danh sách tài nguyên có sẵn.
    4.  Trả về kết quả dưới dạng JSON theo schema đã định nghĩa.`;

    const response = await ai.models.generateContent({
        // FIX: Use 'gemini-2.5-flash' model as per guidelines
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisResultSchema,
        },
    });
    
    const parsedResult = parseJsonResponse<Omit<AnalysisResult, 'disclaimer'>>(response.text);
    return { ...parsedResult, disclaimer: disclaimerText };
};

// --- SCAR ANALYSIS ---

const scarTreatmentPlanSchema = {
    type: Type.OBJECT,
    properties: {
        assessment: { type: Type.STRING, description: "Đánh giá chi tiết về loại sẹo, đặc điểm và mức độ nghiêm trọng." },
        treatmentPlan: {
            type: Type.OBJECT,
            properties: {
                inClinicProcedures: { type: Type.ARRAY, items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        frequency: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ['name', 'frequency', 'description']
                }},
                homeCareRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: { type: Type.STRING, description: "Lộ trình điều trị dự kiến theo thời gian." },
                expectedOutcome: { type: Type.STRING, description: "Kết quả mong đợi sau khi hoàn thành phác đồ." }
            },
            required: ['inClinicProcedures', 'homeCareRoutine', 'timeline', 'expectedOutcome']
        }
    },
    required: ['assessment', 'treatmentPlan']
};

export const analyzeScarCondition = async (
    imageParts: { base64: string, mimeType: string }[],
    scarInfo: ScarInfo,
    patientInfo: PatientInfo,
    availableProducts: string[],
    availableMachines: string[]
): Promise<ScarAnalysisResult> => {
    const imageContent = imageParts.map(part => ({ inlineData: { data: part.base64, mimeType: part.mimeType } }));
    const prompt = `Phân tích tình trạng sẹo và lập phác đồ điều trị. Thông tin:
    - Bệnh nhân: ${patientInfo.fullName}, ${patientInfo.age} tuổi.
    - Thông tin sẹo: Loại sẹo chính: ${scarInfo.scarType}, Vị trí: ${scarInfo.location}, Thời gian bị sẹo: ${scarInfo.duration}, Ghi chú: ${scarInfo.notes || 'Không'}
    - Tài nguyên: Mỹ phẩm: [${availableProducts.join(', ')}], Máy móc: [${availableMachines.join(', ')}]
    Yêu cầu trả về JSON theo schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: scarTreatmentPlanSchema }
    });
    const parsedResult = parseJsonResponse<Omit<ScarAnalysisResult, 'disclaimer'>>(response.text);
    return { ...parsedResult, disclaimer: disclaimerText };
};


// --- ACNE ANALYSIS ---
const acneTreatmentPlanSchema = {
    type: Type.OBJECT,
    properties: {
        assessment: { type: Type.STRING, description: "Đánh giá chi tiết về loại mụn, tình trạng viêm, và các vấn đề đi kèm." },
        treatmentPlan: {
            type: Type.OBJECT,
            properties: {
                inClinicProcedures: { type: Type.ARRAY, items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        frequency: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ['name', 'frequency', 'description']
                }},
                homeCareRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
                lifestyleAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lời khuyên về lối sống, chế độ ăn." }
            },
            required: ['inClinicProcedures', 'homeCareRoutine', 'lifestyleAdvice']
        }
    },
    required: ['assessment', 'treatmentPlan']
};

export const analyzeAcneCondition = async (
    imageParts: { base64: string, mimeType: string }[],
    acneInfo: AcneInfo,
    patientInfo: PatientInfo,
    availableProducts: string[],
    availableMachines: string[]
): Promise<AcneAnalysisResult> => {
    const imageContent = imageParts.map(part => ({ inlineData: { data: part.base64, mimeType: part.mimeType } }));
    const prompt = `Phân tích tình trạng mụn và lập phác đồ điều trị. Thông tin:
    - Bệnh nhân: ${patientInfo.fullName}, ${patientInfo.age} tuổi.
    - Thông tin mụn: Loại mụn chính: ${acneInfo.acneType}, Thời gian: ${acneInfo.duration}, Yếu tố khởi phát: ${acneInfo.triggers}, Điều trị trước đây: ${acneInfo.pastTreatments}.
    - Tài nguyên: Mỹ phẩm: [${availableProducts.join(', ')}], Máy móc: [${availableMachines.join(', ')}]
    Yêu cầu trả về JSON theo schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: { responseMimeType: "application/json", responseSchema: acneTreatmentPlanSchema }
    });
    const parsedResult = parseJsonResponse<Omit<AcneAnalysisResult, 'disclaimer'>>(response.text);
    return { ...parsedResult, disclaimer: disclaimerText };
};


// --- MELASMA ANALYSIS ---
const melasmaTreatmentPlanSchema = { /* ... */ }; // Define schema similarly

export const analyzeMelasmaCondition = async (
    imageParts: { base64: string, mimeType: string }[],
    melasmaInfo: MelasmaInfo,
    patientInfo: PatientInfo,
    availableProducts: string[],
    availableMachines: string[]
): Promise<MelasmaAnalysisResult> => {
     const imageContent = imageParts.map(part => ({ inlineData: { data: part.base64, mimeType: part.mimeType } }));
    const prompt = `Phân tích tình trạng nám và lập phác đồ điều trị. Thông tin:
    - Bệnh nhân: ${patientInfo.fullName}, ${patientInfo.age} tuổi.
    - Thông tin nám: Loại nám: ${melasmaInfo.melasmaType}, Thời gian: ${melasmaInfo.duration}.
    - Tài nguyên: Mỹ phẩm: [${availableProducts.join(', ')}], Máy móc: [${availableMachines.join(', ')}]
    Yêu cầu trả về JSON.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: { responseMimeType: "application/json" }
    });
    const parsedResult = parseJsonResponse<Omit<MelasmaAnalysisResult, 'disclaimer'>>(response.text);
    return { ...parsedResult, disclaimer: disclaimerText };
};


// --- REJUVENATION ANALYSIS ---
const rejuvenationTreatmentPlanSchema = { /* ... */ }; // Define schema similarly

export const analyzeRejuvenationNeeds = async (
    imageParts: { base64: string, mimeType: string }[],
    rejuvenationInfo: RejuvenationInfo,
    patientInfo: PatientInfo,
    availableProducts: string[],
    availableMachines: string[]
): Promise<RejuvenationAnalysisResult> => {
    const imageContent = imageParts.map(part => ({ inlineData: { data: part.base64, mimeType: part.mimeType } }));
    const prompt = `Phân tích nhu cầu trẻ hóa da và lập phác đồ. Thông tin:
    - Bệnh nhân: ${patientInfo.fullName}, ${patientInfo.age} tuổi.
    - Nhu cầu: Mối quan tâm chính: ${rejuvenationInfo.mainConcerns}, Vùng điều trị: ${rejuvenationInfo.targetArea}.
    - Tài nguyên: Mỹ phẩm: [${availableProducts.join(', ')}], Máy móc: [${availableMachines.join(', ')}]
    Yêu cầu trả về JSON.`;
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: { responseMimeType: "application/json" }
    });
    const parsedResult = parseJsonResponse<Omit<RejuvenationAnalysisResult, 'disclaimer'>>(response.text);
    return { ...parsedResult, disclaimer: disclaimerText };
};
