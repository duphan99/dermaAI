// This file defines the core data structures and types used throughout the application.

export type AppView = 'home' | 'main' | 'scar' | 'acne' | 'melasma' | 'rejuvenation' | 'cosmetic-check' | 'history' | 'settings';

export interface PatientInfo {
  fullName: string;
  age: string;
  address: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
}

export interface Diagnosis {
  condition: string;
  severity: string;
  analysis: string;
}

export interface InClinicProcedure {
  name: string;
  frequency: string;
  description: string;
}

export interface TreatmentPlan {
  morningRoutine: string[];
  eveningRoutine: string[];
  inClinicProcedures: InClinicProcedure[];
}

export interface ExpertAdvice {
  recommendations: string[];
  combinedTreatments: string[];
}

export interface AnalysisResult {
  diagnosis: Diagnosis;
  treatmentPlan: TreatmentPlan;
  expertAdvice: ExpertAdvice;
  disclaimer: string;
}

export interface PatientRecord {
  id: string;
  createdAt: string;
  recordType: 'general';
  patientInfo: PatientInfo;
  diagnosis: Diagnosis;
  treatmentPlan: TreatmentPlan;
  expertAdvice: ExpertAdvice;
}

export interface MachineInfo {
  name: string;
  url: string;
  description: string;
  keywords: string[];
}

export interface CosmeticInfo {
  name: string;
  brand: string;
  url: string;
  description: string;
  keywords: string[];
  usage: 'morning' | 'evening' | 'both';
}

export interface FaceImages {
    front: File | null;
    left?: File | null;
    right?: File | null;
    wood?: File | null;
}

// For Scar Treatment
export interface ScarInfo {
    scarType: string;
    location: string;
    duration: string;
    notes?: string;
}

export interface ScarTreatmentPlan {
    inClinicProcedures: InClinicProcedure[];
    homeCareRoutine: string[];
    timeline: string;
    expectedOutcome: string;
    expertAdvice: ExpertAdvice;
}

export interface ScarAnalysisResult {
    assessment: string;
    treatmentPlan: ScarTreatmentPlan;
    disclaimer: string;
}

export interface ScarPatientRecord {
    id: string;
    createdAt: string;
    recordType: 'scar';
    patientInfo: PatientInfo;
    scarInfo: ScarInfo;
    analysisResult: ScarAnalysisResult;
}


// For Acne Treatment
export interface AcneInfo {
    acneType: string;
    duration: string;
    triggers: string;
    pastTreatments: string;
    notes?: string;
}

export interface AcneTreatmentPlan {
    inClinicProcedures: InClinicProcedure[];
    homeCareRoutine: string[];
    expertAdvice: ExpertAdvice;
}

export interface AcneAnalysisResult {
    assessment: string;
    treatmentPlan: AcneTreatmentPlan;
    disclaimer: string;
}

export interface AcnePatientRecord {
    id: string;
    createdAt: string;
    recordType: 'acne';
    patientInfo: PatientInfo;
    acneInfo: AcneInfo;
    analysisResult: AcneAnalysisResult;
}

// For Melasma Treatment
export interface MelasmaInfo {
    melasmaType: string;
    location: string;
    duration: string;
    triggers: string;
    pastTreatments: string;
    notes?: string;
}

export interface MelasmaTreatmentPlan {
    inClinicProcedures: InClinicProcedure[];
    homeCareRoutine: string[];
    sunProtectionAdvice: string[];
    expertAdvice: ExpertAdvice;
}

export interface MelasmaAnalysisResult {
    assessment: string;
    treatmentPlan: MelasmaTreatmentPlan;
    disclaimer: string;
}

export interface MelasmaPatientRecord {
    id: string;
    createdAt: string;
    recordType: 'melasma';
    patientInfo: PatientInfo;
    melasmaInfo: MelasmaInfo;
    analysisResult: MelasmaAnalysisResult;
}


// For Rejuvenation Treatment
export interface RejuvenationInfo {
    mainConcerns: string;
    targetArea: string;
    pastTreatments: string;
    notes?: string;
}

export interface RejuvenationTreatmentPlan {
    treatmentSchedule: string[];
    highTechProcedures: InClinicProcedure[];
    injectionTherapies: InClinicProcedure[];
    homeCareRoutine: string[];
}

export interface RejuvenationAnalysisResult {
    assessment: string;
    treatmentPlan: RejuvenationTreatmentPlan;
    disclaimer: string;
}

export interface RejuvenationPatientRecord {
    id: string;
    createdAt: string;
    recordType: 'rejuvenation';
    patientInfo: PatientInfo;
    rejuvenationInfo: RejuvenationInfo;
    analysisResult: RejuvenationAnalysisResult;
}

// For Cosmetic Checker
export interface GroundingSource {
    uri: string;
    title: string;
}

export interface CosmeticCheckResult {
    suitability: 'Phù hợp' | 'Cần cẩn trọng' | 'Không phù hợp';
    analysis: string;
    pros: string[];
    cons: string[];
    usageAdvice: string;
    similarProducts: {
        name: string;
        reason: string;
    }[];
    originInfo: {
        brandOrigin: string;
        distributor: string;
        sources: GroundingSource[];
    };
    disclaimer: string;
}

export interface CosmeticCheckRecord {
  id: string;
  createdAt: string;
  recordType: 'cosmetic';
  patientName: string;
  faceImage: { base64: string; mimeType: string };
  productImages: { base64: string; mimeType: string }[];
  result: CosmeticCheckResult;
}

export type AnyPatientRecord = PatientRecord | ScarPatientRecord | AcnePatientRecord | MelasmaPatientRecord | RejuvenationPatientRecord | CosmeticCheckRecord;