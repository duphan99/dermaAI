import { GoogleGenAI, Type } from "@google/genai";
import type { PatientInfo, AnalysisResult, ScarInfo, ScarAnalysisResult, AcneInfo, AcneAnalysisResult, MelasmaInfo, MelasmaAnalysisResult, RejuvenationInfo, RejuvenationAnalysisResult, CosmeticCheckResult, GroundingSource, ExpertAdvice } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const parseJsonResponse = <T>(text: string): T => {
    try {
        const jsonString = text.replace(/^```json\s*|```\s*$/g, '').trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON response:", text, e);
        throw new Error("AI đã trả về một phản hồi không ở định dạng JSON mong đợi.");
    }
}

const disclaimerText = "Kết quả chẩn đoán và phác đồ điều trị này được tạo ra bởi trí tuệ nhân tạo (AI) và chỉ mang tính chất tham khảo. Luôn cần có sự tư vấn, xác nhận và giám sát từ bác sĩ da liễu có chuyên môn trước khi áp dụng bất kỳ liệu trình nào.";

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
                            name: { type: Type.STRING, description: "Tên liệu trình tại phòng khám (ví dụ: Laser CO2 Fractional, Peel da hóa học, thuốc uống nếu cần)." },
                            frequency: { type: Type.STRING, description: "Tần suất thực hiện liệu trình (ví dụ: 1 lần/tháng)." },
                            description: { type: Type.STRING, description: "Mô tả ngắn gọn về mục đích của liệu trình." },
                        },
                         required: ['name', 'frequency', 'description']
                    }
                },
            },
            required: ['morningRoutine', 'eveningRoutine', 'inClinicProcedures']
        },
        expertAdvice: {
            type: Type.OBJECT,
            properties: {
                recommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Danh sách các lời khuyên từ chuyên gia về lối sống, chế độ ăn uống, và các lưu ý chăm sóc da liên quan đến tình trạng được chẩn đoán."
                },
                combinedTreatments: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Danh sách các phương pháp hoặc liệu pháp bổ sung có thể kết hợp với phác đồ chính để tăng cường hiệu quả điều trị."
                }
            },
            required: ['recommendations', 'combinedTreatments']
        }
    },
    required: ['diagnosis', 'treatmentPlan', 'expertAdvice']
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

    const productResourcePrompt = availableProducts.length > 0
        ? `- Các sản phẩm/hoạt chất có thể dùng: ${availableProducts.join(', ')}\n    - Chỉ đề xuất các sản phẩm từ danh sách này.`
        : `- Không có danh sách sản phẩm cụ thể. Hãy tự do đề xuất các sản phẩm/hoạt chất phổ biến, hiệu quả và uy tín trên thị trường phù hợp với chẩn đoán.`;

    const machineResourcePrompt = availableMachines.length > 0
        ? `- Các máy móc/công nghệ tại phòng khám: ${availableMachines.join(', ')}\n    - Chỉ đề xuất các máy móc từ danh sách này.`
        : `- Không có danh sách máy móc cụ thể. Hãy tự do đề xuất các công nghệ/liệu trình tại phòng khám phổ biến và hiệu quả.`;
    
    const prompt = `Bạn là một trợ lý AI chuyên gia da liễu. Dựa vào hình ảnh da và thông tin bệnh nhân sau đây, hãy đưa ra chẩn đoán và phác đồ điều trị.
    
    Thông tin bệnh nhân:
    - Họ tên: ${patientInfo.fullName}
    - Tuổi: ${patientInfo.age}
    - Địa chỉ: ${patientInfo.address}
    - Ghi chú: ${patientInfo.notes || 'Không có'}

    Tài nguyên có sẵn:
    ${productResourcePrompt}
    ${machineResourcePrompt}

    Yêu cầu:
    1.  Chẩn đoán tình trạng da chính, mức độ và phân tích chi tiết.
    2.  Lập phác đồ điều trị bao gồm quy trình buổi sáng, buổi tối và các liệu trình tại phòng khám.
    3.  Đối với các tình trạng da được đánh giá là 'Nặng', hãy cân nhắc đề xuất các phương pháp điều trị bổ sung như thuốc uống (ví dụ: Isotretinoin, kháng sinh) hoặc các liệu pháp toàn thân khác. Các đề xuất này phải được đưa vào phần 'inClinicProcedures' và phải có ghi chú rõ ràng rằng chúng cần được bác sĩ kê đơn và theo dõi chặt chẽ.
    4.  Cung cấp một phần 'Lời khuyên từ chuyên gia' (expertAdvice) bao gồm:
        - 'recommendations': Các lời khuyên chung về lối sống, chế độ ăn, sản phẩm cần tránh.
        - 'combinedTreatments': Các phương pháp bổ sung có thể kết hợp để tăng hiệu quả (ví dụ: bổ sung kẽm, điều chỉnh chế độ ăn, quản lý stress).
    5.  Trả về kết quả dưới dạng JSON theo schema đã định nghĩa.`;

    const response = await ai.models.generateContent({
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

const inClinicProcedureSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Tên liệu trình (ví dụ: Laser CO2 Fractional, Tiêm Botox, Căng chỉ)." },
        frequency: { type: Type.STRING, description: "Tần suất thực hiện (ví dụ: 1 lần/tháng, 2-3 lần/năm)." },
        description: { type: Type.STRING, description: "Mô tả ngắn gọn về mục đích của liệu trình." },
    },
    required: ['name', 'frequency', 'description']
};

const expertAdviceSchema = {
    type: Type.OBJECT,
    properties: {
        recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Các lời khuyên chung về lối sống, chế độ ăn, chăm sóc da."
        },
        combinedTreatments: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Các liệu pháp kết hợp hoặc thuốc uống cần bác sĩ kê đơn để tăng hiệu quả."
        }
    },
    required: ['recommendations', 'combinedTreatments']
};

const scarTreatmentPlanSchema = {
    type: Type.OBJECT,
    properties: {
        assessment: { type: Type.STRING, description: "Đánh giá chi tiết về loại sẹo (rỗ, lồi, thâm, đỏ), đặc điểm (đáy nhọn, vuông, lượn sóng), vị trí và mức độ nghiêm trọng." },
        treatmentPlan: {
            type: Type.OBJECT,
            properties: {
                inClinicProcedures: { type: Type.ARRAY, items: inClinicProcedureSchema },
                homeCareRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: { type: Type.STRING, description: "Lộ trình điều trị dự kiến theo thời gian (ví dụ: '3-6 tháng, mỗi tháng 1 lần laser')." },
                expectedOutcome: { type: Type.STRING, description: "Kết quả mong đợi sau khi hoàn thành phác đồ (ví dụ: 'Cải thiện 60-80% độ sâu của sẹo, da đều màu hơn')." },
                expertAdvice: expertAdviceSchema
            },
            required: ['inClinicProcedures', 'homeCareRoutine', 'timeline', 'expectedOutcome', 'expertAdvice']
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
    const prompt = `Bạn là một trợ lý AI chuyên gia da liễu. Dựa vào hình ảnh và thông tin sau, hãy phân tích tình trạng sẹo và lập phác đồ điều trị.
    - Bệnh nhân: ${patientInfo.fullName}, ${patientInfo.age} tuổi.
    - Thông tin sẹo: Loại sẹo chính: ${scarInfo.scarType}, Vị trí: ${scarInfo.location}, Thời gian bị sẹo: ${scarInfo.duration}, Ghi chú: ${scarInfo.notes || 'Không'}
    - Tài nguyên có sẵn: Mỹ phẩm [${availableProducts.join(', ')}], Máy móc [${availableMachines.join(', ')}].
    Yêu cầu:
    1.  **Assessment:** Đánh giá chi tiết loại sẹo, đặc điểm và mức độ (Nhẹ, Trung bình, Nặng).
    2.  **Treatment Plan:** Lập kế hoạch điều trị sẹo toàn diện bao gồm liệu trình tại phòng khám, chăm sóc tại nhà, lộ trình thời gian và kết quả dự kiến.
    3.  **Expert Advice:** Cung cấp 'lời khuyên từ chuyên gia' bao gồm:
        - 'recommendations': Lời khuyên về chống nắng, chế độ ăn, chăm sóc da để hỗ trợ điều trị sẹo.
        - 'combinedTreatments': Nếu đánh giá sẹo ở mức độ 'Nặng', hãy cân nhắc đề xuất các loại thuốc uống (ví dụ: Isotretinoin cho sẹo mụn nặng, corticoid tiêm trong sẹo cho sẹo lồi) và ghi chú rõ ràng rằng chúng cần được bác sĩ kê đơn và theo dõi. Nếu không nặng, đề xuất các liệu pháp bổ trợ khác.
    4.  Chỉ sử dụng tài nguyên có sẵn cho các liệu trình và sản phẩm thoa tại nhà.
    5.  Trả về kết quả dưới dạng JSON theo schema đã định nghĩa.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: { 
            responseMimeType: "application/json", 
            responseSchema: scarTreatmentPlanSchema 
        }
    });
    const parsedResult = parseJsonResponse<Omit<ScarAnalysisResult, 'disclaimer'>>(response.text);
    return { ...parsedResult, disclaimer: disclaimerText };
};


const acneTreatmentPlanSchema = {
    type: Type.OBJECT,
    properties: {
        assessment: { type: Type.STRING, description: "Phân tích chi tiết về tình trạng mụn, dự đoán nguyên nhân chính (ví dụ: nội tiết, vi khuẩn, lối sống), đánh giá mức độ (Nhẹ, Trung bình, Nặng), và các vấn đề đi kèm (thâm, sẹo)." },
        treatmentPlan: {
            type: Type.OBJECT,
            properties: {
                inClinicProcedures: { type: Type.ARRAY, items: inClinicProcedureSchema },
                homeCareRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
                expertAdvice: expertAdviceSchema
            },
            required: ['inClinicProcedures', 'homeCareRoutine', 'expertAdvice']
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
    const prompt = `Bạn là một trợ lý AI chuyên gia da liễu. Dựa vào hình ảnh và thông tin sau, hãy phân tích tình trạng mụn, dự đoán nguyên nhân và lập phác đồ điều trị phù hợp.
    - Bệnh nhân: ${patientInfo.fullName}, ${patientInfo.age} tuổi.
    - Thông tin mụn: Loại mụn chính được cung cấp: ${acneInfo.acneType}. Nếu là 'Chưa xác định', hãy tự chẩn đoán loại mụn. Thời gian: ${acneInfo.duration}, Yếu tố khởi phát: ${acneInfo.triggers}, Điều trị trước đây: ${acneInfo.pastTreatments}, Ghi chú: ${acneInfo.notes || 'Không'}.
    - Tài nguyên có sẵn: Mỹ phẩm [${availableProducts.join(', ')}], Máy móc [${availableMachines.join(', ')}].
    Yêu cầu:
    1.  **Assessment:**
        -   Phân tích hình ảnh và dữ liệu để xác định các loại mụn hiện có (viêm, ẩn, nang, v.v.).
        -   **Phân tích và dự đoán nguyên nhân gây mụn chính** (ví dụ: nội tiết tố, vi khuẩn P. acnes, stress, chế độ ăn uống, dị ứng mỹ phẩm).
        -   Đánh giá mức độ tổng thể của tình trạng (Nhẹ, Trung bình, Nặng).
        -   Ghi nhận các vấn đề đi kèm như thâm mụn (PIE, PIH) hoặc sẹo.
    2.  **Treatment Plan:**
        -   Lập kế hoạch điều trị toàn diện, trong đó các liệu trình và sản phẩm phải **giải quyết trực tiếp nguyên nhân đã dự đoán**.
        -   Ví dụ: Nếu do nội tiết, nhấn mạnh vào việc tư vấn chuyên khoa; nếu do vi khuẩn, ưu tiên các hoạt chất kháng khuẩn; nếu do lối sống, tập trung vào lời khuyên thay đổi thói quen.
    3.  **Expert Advice:**
        -   'recommendations': Đưa ra các lời khuyên chung về chăm sóc da.
        -   'combinedTreatments': Nếu mụn ở mức độ 'Nặng', hãy cân nhắc đề xuất thuốc uống (Isotretinoin, Kháng sinh) và ghi chú rõ ràng về việc cần bác sĩ kê đơn.
    4.  Chỉ sử dụng tài nguyên có sẵn.
    5.  Trả về kết quả dưới dạng JSON theo schema đã định nghĩa.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: { 
            responseMimeType: "application/json", 
            responseSchema: acneTreatmentPlanSchema 
        }
    });
    const parsedResult = parseJsonResponse<Omit<AcneAnalysisResult, 'disclaimer'>>(response.text);
    return { ...parsedResult, disclaimer: disclaimerText };
};


const melasmaTreatmentPlanSchema = {
    type: Type.OBJECT,
    properties: {
        assessment: { type: Type.STRING, description: "Đánh giá chi tiết về loại nám (mảng, chân sâu, hỗn hợp), vị trí, độ sâu, dự đoán nguyên nhân chính (nội tiết, ánh nắng, v.v.) và các yếu tố nguy cơ." },
        treatmentPlan: {
            type: Type.OBJECT,
            properties: {
                inClinicProcedures: { type: Type.ARRAY, items: inClinicProcedureSchema },
                homeCareRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
                sunProtectionAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các lời khuyên chi tiết và bắt buộc về việc chống nắng để điều trị và ngăn ngừa nám." },
                expertAdvice: expertAdviceSchema
            },
            required: ['inClinicProcedures', 'homeCareRoutine', 'sunProtectionAdvice', 'expertAdvice']
        }
    },
    required: ['assessment', 'treatmentPlan']
};

export const analyzeMelasmaCondition = async (
    imageParts: { base64: string, mimeType: string }[],
    melasmaInfo: MelasmaInfo,
    patientInfo: PatientInfo,
    availableProducts: string[],
    availableMachines: string[]
): Promise<MelasmaAnalysisResult> => {
     const imageContent = imageParts.map(part => ({ inlineData: { data: part.base64, mimeType: part.mimeType } }));
    const prompt = `Bạn là một trợ lý AI chuyên gia da liễu. Dựa vào hình ảnh (có thể bao gồm ảnh dưới đèn Wood) và thông tin sau, hãy phân tích tình trạng nám và lập phác đồ điều trị kết hợp toàn diện.
    - Bệnh nhân: ${patientInfo.fullName}, ${patientInfo.age} tuổi.
    - Thông tin nám: Loại nám được cung cấp: ${melasmaInfo.melasmaType}. Nếu là 'Chưa xác định', hãy tự chẩn đoán loại nám dựa trên hình ảnh. Vị trí: ${melasmaInfo.location}, Thời gian: ${melasmaInfo.duration}, Yếu tố khởi phát: ${melasmaInfo.triggers}, Ghi chú: ${melasmaInfo.notes || 'Không'}.
    - Tài nguyên có sẵn: Mỹ phẩm [${availableProducts.join(', ')}], Máy móc [${availableMachines.join(', ')}].
    Yêu cầu:
    1.  **Assessment:** 
        - Đánh giá chi tiết loại nám (mảng, chân sâu, hỗn hợp), độ sâu (dựa vào đèn Wood nếu có thể suy đoán), và mức độ.
        - **Phân tích và dự đoán nguyên nhân gây nám chính** (ví dụ: do ánh nắng mặt trời, thay đổi nội tiết tố, di truyền, v.v.).
    2.  **Treatment Plan:** 
        - Lập kế hoạch điều trị **kết hợp nhiều liệu pháp** để tối ưu hiệu quả và rút ngắn thời gian.
        - **inClinicProcedures:** Đề xuất sự kết hợp giữa các công nghệ cao (laser, peel) và các liệu pháp khác.
        - **homeCareRoutine:** Kê các sản phẩm thoa tại nhà để ức chế và loại bỏ sắc tố.
        - **sunProtectionAdvice:** Đưa ra các tư vấn chống nắng chuyên sâu và bắt buộc.
        - **expertAdvice:** Cung cấp 'lời khuyên từ chuyên gia' bao gồm:
            - 'recommendations': Lời khuyên về lối sống, chế độ ăn, cách chăm sóc da.
            - 'combinedTreatments': Đề xuất các liệu pháp bổ sung như viên uống chống nắng, Tranexamic acid đường uống (ghi chú rõ cần kê đơn), hoặc các phương pháp hỗ trợ khác.
    3.  Chỉ sử dụng tài nguyên có sẵn cho các liệu trình và sản phẩm.
    4.  Trả về kết quả dưới dạng JSON theo schema đã định nghĩa.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: { 
            responseMimeType: "application/json",
            responseSchema: melasmaTreatmentPlanSchema
        }
    });
    const parsedResult = parseJsonResponse<Omit<MelasmaAnalysisResult, 'disclaimer'>>(response.text);
    return { ...parsedResult, disclaimer: disclaimerText };
};


const rejuvenationTreatmentPlanSchema = {
    type: Type.OBJECT,
    properties: {
        assessment: { 
            type: Type.STRING, 
            description: "Đánh giá chi tiết về tình trạng lão hóa da dựa trên hình ảnh và thông tin, bao gồm các vấn đề như nếp nhăn, độ đàn hồi, chảy xệ và các dấu hiệu khác." 
        },
        treatmentPlan: {
            type: Type.OBJECT,
            properties: {
                treatmentSchedule: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lịch trình điều trị gợi ý, sắp xếp các liệu trình theo từng giai đoạn hoặc tháng." },
                highTechProcedures: { type: Type.ARRAY, items: inClinicProcedureSchema, description: "Danh sách các liệu trình trẻ hóa sử dụng công nghệ cao (ví dụ: HIFU, Thermage, Laser)." },
                injectionTherapies: { type: Type.ARRAY, items: inClinicProcedureSchema, description: "Danh sách các liệu pháp tiêm thẩm mỹ (ví dụ: Botox, Filler, Mesotherapy, PRP)." },
                homeCareRoutine: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các bước và sản phẩm chăm sóc da tại nhà để duy trì và tăng cường kết quả." },
            },
            required: ['treatmentSchedule', 'highTechProcedures', 'injectionTherapies', 'homeCareRoutine']
        }
    },
    required: ['assessment', 'treatmentPlan']
};

export const analyzeRejuvenationNeeds = async (
    imageParts: { base64: string, mimeType: string }[],
    rejuvenationInfo: RejuvenationInfo,
    patientInfo: PatientInfo,
    availableProducts: string[],
    availableMachines: string[]
): Promise<RejuvenationAnalysisResult> => {
    const imageContent = imageParts.map(part => ({
        inlineData: {
            data: part.base64,
            mimeType: part.mimeType
        }
    }));

    const productResourcePrompt = availableProducts.length > 0
        ? `- Các sản phẩm/hoạt chất có thể dùng: ${availableProducts.join(', ')}`
        : `- Không có danh sách sản phẩm cụ thể, hãy đề xuất các sản phẩm phổ biến và hiệu quả.`;

    const machineResourcePrompt = availableMachines.length > 0
        ? `- Các máy móc/công nghệ tại phòng khám: ${availableMachines.join(', ')}`
        : `- Không có danh sách máy móc cụ thể, hãy đề xuất các công nghệ phổ biến và hiệu quả.`;

    const prompt = `Bạn là một trợ lý AI chuyên gia da liễu thẩm mỹ. Dựa vào hình ảnh da và thông tin sau đây, hãy phân tích nhu cầu trẻ hóa và lập một phác đồ điều trị toàn diện.

    Thông tin bệnh nhân:
    - Họ tên: ${patientInfo.fullName}
    - Tuổi: ${patientInfo.age}
    - Mối quan tâm chính: ${rejuvenationInfo.mainConcerns}
    - Vùng điều trị: ${rejuvenationInfo.targetArea}
    - Các điều trị trước đây: ${rejuvenationInfo.pastTreatments || 'Chưa có'}
    - Ghi chú: ${rejuvenationInfo.notes || 'Không có'}

    Tài nguyên có sẵn:
    ${productResourcePrompt}
    ${machineResourcePrompt}

    Yêu cầu:
    1.  **Assessment:** Đánh giá chi tiết tình trạng lão hóa của da (nếp nhăn, chảy xệ, mất thể tích, chất lượng bề mặt da).
    2.  **Treatment Plan:** Lập kế hoạch điều trị trẻ hóa, bao gồm:
        -   **treatmentSchedule:** Lịch trình điều trị tổng thể, chia theo giai đoạn hoặc thời gian.
        -   **highTechProcedures:** Các liệu trình công nghệ cao phù hợp (như HIFU, Laser, RF).
        -   **injectionTherapies:** Các liệu pháp tiêm (Botox, Filler, Mesotherapy).
        -   **homeCareRoutine:** Các sản phẩm và quy trình chăm sóc da tại nhà để hỗ trợ.
    3.  Chỉ đề xuất các sản phẩm và máy móc từ danh sách tài nguyên có sẵn.
    4.  Trả về kết quả dưới dạng JSON theo schema đã định nghĩa.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: rejuvenationTreatmentPlanSchema,
        },
    });

    const parsedResult = parseJsonResponse<Omit<RejuvenationAnalysisResult, 'disclaimer'>>(response.text);
    return { ...parsedResult, disclaimer: disclaimerText };
};


export const checkCosmeticSuitability = async (
    faceImage: { base64: string, mimeType: string },
    productImages: { base64: string, mimeType: string }[]
): Promise<CosmeticCheckResult> => {
    
    const imageContent = [
        { inlineData: { data: faceImage.base64, mimeType: faceImage.mimeType } },
        ...productImages.map(p => ({ inlineData: { data: p.base64, mimeType: p.mimeType } }))
    ];

    const prompt = `Bạn là một chuyên gia phân tích mỹ phẩm với kiến thức sâu rộng về da liễu. Dựa vào hình ảnh da mặt và hình ảnh sản phẩm được cung cấp, hãy thực hiện một phân tích chi tiết và chuyên sâu.

**PHÂN TÍCH HÌNH ẢNH:**
1.  **Da mặt:** Phân tích kỹ tình trạng da, xác định loại da (ví dụ: da dầu, khô, hỗn hợp), và các vấn đề chính đang gặp phải (ví dụ: mụn viêm, mụn ẩn, thâm sau mụn, lỗ chân lông to, da nhạy cảm, dấu hiệu lão hóa).
2.  **Sản phẩm:** Xác định chính xác tên sản phẩm, thương hiệu. Phân tích bảng thành phần, nêu bật các thành phần chủ chốt và công dụng của chúng, cũng như các thành phần có thể gây kích ứng (nếu có).

**YÊU CẦU ĐÁNH GIÁ VÀ TƯ VẤN:**
1.  **Đánh giá tổng quan (suitability):** Đưa ra kết luận mức độ phù hợp của sản phẩm với tình trạng da đã phân tích: 'Phù hợp', 'Cần cẩn trọng', hoặc 'Không phù hợp'.
2.  **Phân tích chi tiết (analysis):** Viết một đoạn văn tổng hợp, giải thích lý do cho kết luận trên.
3.  **Ưu điểm (pros):** Liệt kê các ưu điểm chính của sản phẩm đối với làn da này dưới dạng một mảng chuỗi.
4.  **Nhược điểm/Lưu ý (cons):** Liệt kê các nhược điểm, rủi ro tiềm ẩn hoặc những điều cần lưu ý khi sử dụng dưới dạng một mảng chuỗi.
5.  **Tư vấn sử dụng (usageAdvice):** Đưa ra hướng dẫn sử dụng sản phẩm một cách hiệu quả và an toàn (ví dụ: tần suất, cách kết hợp với sản phẩm khác, những điều cần tránh).
6.  **Gợi ý sản phẩm tương tự (similarProducts):** Nếu sản phẩm không hoàn toàn phù hợp, gợi ý 1-2 sản phẩm thay thế cùng lý do.
7.  **Thông tin nguồn gốc (originInfo):** Sử dụng Google Search để tìm nguồn gốc thương hiệu và nhà phân phối chính thức tại Việt Nam.

**QUAN TRỌNG:** Trả về kết quả dưới dạng một đối tượng JSON duy nhất, không có bất kỳ văn bản nào khác ngoài JSON. JSON phải tuân thủ cấu trúc sau:
{
  "suitability": "...",
  "analysis": "...",
  "pros": ["Ưu điểm 1", "Ưu điểm 2"],
  "cons": ["Nhược điểm 1", "Lưu ý 2"],
  "usageAdvice": "...",
  "similarProducts": [{"name": "...", "reason": "..."}],
  "originInfo": {"brandOrigin": "...", "distributor": "..."}
}`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [...imageContent, { text: prompt }] },
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const parsedResult = parseJsonResponse<Omit<CosmeticCheckResult, 'disclaimer' | 'originInfo' > & { originInfo: Omit<CosmeticCheckResult['originInfo'], 'sources'> }>(response.text);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || '',
    })).filter((s: GroundingSource) => s.uri) || [];

    return {
        ...parsedResult,
        originInfo: {
            ...parsedResult.originInfo,
            sources: sources,
        },
        disclaimer: disclaimerText
    };
};