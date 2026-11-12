// lib/utils/types.ts

export interface StudentResponse {
  grade: "1학년" | "2학년";
  hopefulCareer: string;
  hopefulMajor: string;
  preferredField: string;
  preferredAdmissionType: string[];
  mockTestScores: MockTestScore[];
  interestedUniversities: string[];
  interestedSubfields: string[];
  interestedSubjects: string[];
  learningPreference: string;
  selectionGoal: string;
}

export interface MockTestScore {
  subject: string;
  grade: number;
  percentile?: number;
}

export interface Subject {
  id: string;
  name: string;
  category: "일반선택" | "진로선택";
  description: string;
  mainContent: string[];
  relatedFields: string[];
  prerequisites?: string[];
  followupSubjects?: string[];
  availableGrades: ("1학년" | "2학년")[];
  universityRecommendations: {
    universityName: string;
    major: string;
    level: "권장" | "관련" | "참고";
    source: string;
    verifiedDate: string;
  }[];
}

export interface SeniorAdmissionData {
  id: string;
  field: string;
  university: string;
  major: string;
  admissionType: string;
  admissionTiming: string;
  admissionResult: "합격" | "불합격" | "충원합격";
  scores?: {
    subject: string;
    grade: number;
  }[];
}

export interface KNNResult {
  recommendedSubjects: {
    subject: Subject;
    rank: number;
    similarityScore: number;
    usedFeatures: string[];
  }[];
  comparableCasesCount: number;
  similarCases: {
    caseId: string;
    similarity: number;
    similarFeatures: string[];
  }[];
  limitations: string;
  reliability: "높음" | "중간" | "낮음";
}

export interface SBERTResult {
  recommendedSubjects: {
    subject: Subject;
    rank: number;
    semanticSimilarity: number;
    relatedResponses: string[];
    connectionReason: string;
  }[];
  textReliability: "높음" | "중간" | "낮음";
  limitations: string;
}

export interface HybridResult {
  recommendedSubjects: {
    subject: Subject;
    rank: number;
    hybridScore: number;
    knnContribution: number;
    sbertContribution: number;
  }[];
  limitations: string;
}

export interface RecommendationResult {
  studentResponse: StudentResponse;
  knnResult: KNNResult;
  sbertResult: SBERTResult;
  hybridResult: HybridResult;
  generatedAt: string;
}