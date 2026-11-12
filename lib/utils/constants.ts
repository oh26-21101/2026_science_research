// lib/utils/constants.ts

export const SUBJECTS_2022 = [
  {
    id: "math-integral",
    name: "미적분",
    category: "일반선택" as const,
    description: "미분과 적분의 기본 개념과 응용을 학습합니다.",
    mainContent: [
      "미분의 개념",
      "적분의 개념",
      "함수의 극값",
      "정적분의 응용"
    ],
    relatedFields: ["공학", "자연과학", "의약보건"],
    prerequisites: [],
    followupSubjects: [],
    availableGrades: ["1학년", "2학년"],
    universityRecommendations: [
      {
        universityName: "서울대학교",
        major: "공과대학",
        level: "권장" as const,
        source: "서울대 2024 모집요강",
        verifiedDate: "2024-01-15"
      }
    ]
  },
  {
    id: "math-probability",
    name: "확률과 통계",
    category: "일반선택" as const,
    description: "확률 이론과 통계적 추론을 학습합니다.",
    mainContent: [
      "확률의 개념",
      "확률변수",
      "통계적 추론",
      "데이터 분석"
    ],
    relatedFields: ["상경", "자연과학", "정보통신"],
    prerequisites: [],
    followupSubjects: [],
    availableGrades: ["1학년", "2학년"],
    universityRecommendations: []
  },
  {
    id: "info-foundation",
    name: "정보",
    category: "일반선택" as const,
    description: "정보 처리와 프로그래밍의 기초를 학습합니다.",
    mainContent: [
      "정보 처리의 개념",
      "알고리즘",
      "프로그래밍 기초",
      "데이터 표현"
    ],
    relatedFields: ["공학", "정보통신"],
    prerequisites: [],
    followupSubjects: [],
    availableGrades: ["1학년", "2학년"],
    universityRecommendations: []
  }
];

export const ADMISSION_TYPES = [
  "학생부종합",
  "학생부교과",
  "논술",
  "수능",
  "실기"
];

export const ADMISSION_TIMINGS = ["수시", "정시"];

export const PREFERRED_FIELDS = [
  "자연과학",
  "공학",
  "인문사회",
  "상경",
  "의약보건",
  "교육",
  "예체능"
];

export const LEARNING_PREFERENCES = [
  "개념 이해 중심",
  "탐구 및 실험 중심",
  "자료 분석 중심",
  "글쓰기 및 토론 중심",
  "창작 및 실습 중심"
];