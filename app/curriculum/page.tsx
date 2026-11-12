"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ─────────────────────────────
 * 저장 구조
 * ───────────────────────────── */

const SURVEY_KEY = "ohyun-survey-v1";
const PLAN_KEY = "ohyun-curriculum-plan-v1";

type Track = "general" | "science";
type Term = "2-1" | "2-2" | "3-1" | "3-2";

type Criteria = {
  grade: string;
  track: Track;
  career: string;
  targetMajor: string;
  interests: string[];
  favoriteSubjects: string[];
  description: string;
};

type SurveyPayload = {
  version: 1;
  criteria: Criteria;
};

type Course = {
  name: string;
  tags: string[];
};

type Group = {
  id: string;
  term: Term;
  title: string;
  count: number;
  credit: number;
  maxCore?: number;
  courses: Course[];
};

type Plan = Record<string, string[]>;

type SavedPlan = {
  version: 2;
  criteriaKey: string;
  modelKey: string;
  plan: Plan;
};

const CAREERS: Record<string, string[]> = {
  "아직 탐색 중": [],
  "컴퓨터·AI": ["정보", "수학", "공학", "물리"],
  "기계·전기전자": ["물리", "공학", "수학", "정보"],
  "화학·신소재": ["화학", "공학", "수학", "물리"],
  "의약·생명": ["생명", "화학", "연구", "심리"],
  "환경·지구": ["환경", "지구", "생명", "지리"],
  "경영·경제": ["경제", "수학", "사회", "국제"],
  "법·행정·정치": ["행정", "사회", "국제", "윤리"],
  "인문·어문": ["인문", "국어", "영어", "역사", "외국어"],
  "교육·심리": ["교육", "심리", "사회", "인문"],
  "예술·미디어": ["예술", "창작", "미술", "음악", "정보"],
};

const INTERESTS = [
  "수학",
  "정보",
  "물리",
  "화학",
  "생명",
  "지구",
  "환경",
  "사회",
  "경제",
  "역사",
  "윤리",
  "국어",
  "영어",
  "국제",
  "예술",
  "교육",
  "심리",
];

const SUBJECTS = [
  "국어",
  "수학",
  "영어",
  "사회",
  "과학",
  "정보",
  "체육",
  "음악",
  "미술",
  "제2외국어·한문",
];

const GRADES = ["1학년", "2학년", "3학년"];

const STEM_CAREERS = new Set([
  "컴퓨터·AI",
  "기계·전기전자",
  "화학·신소재",
  "의약·생명",
  "환경·지구",
]);

const TERMS: Term[] = ["2-1", "2-2", "3-1", "3-2"];

const TERM_NAMES: Record<Term, string> = {
  "2-1": "2학년 1학기",
  "2-2": "2학년 2학기",
  "3-1": "3학년 1학기",
  "3-2": "3학년 2학기",
};

const TARGET: Record<Term, number> = {
  "2-1": 30,
  "2-2": 30,
  "3-1": 29,
  "3-2": 25,
};

/*
 * 기존 초안의 학기별 배치입니다.
 * 학교 원본의 학기별 배당과 반드시 대조하세요.
 */
const FIXED_CREDITS: Record<Term, number> = {
  "2-1": 12,
  "2-2": 12,
  "3-1": 13,
  "3-2": 13,
};

const YEAR_ONE_CREDITS = 60;
const CREATIVE_CREDITS = 18;
const SUBJECT_TARGET = 174;

/* ─────────────────────────────
 * 과목 데이터
 * ───────────────────────────── */

function courses(text: string): Course[] {
  return text
    .trim()
    .split("\n")
    .map((line) => {
      const [name, tags = ""] = line.trim().split("|");

      return {
        name: name.trim(),
        tags: tags.trim().split(/\s+/).filter(Boolean),
      };
    });
}

const GROUPS: Group[] = [
  {
    id: "g21-main",
    term: "2-1",
    title: "국어·수학·영어·사회·과학",
    count: 4,
    credit: 3,
    maxCore: 1,
    courses: courses(`
주제 탐구 독서|국어 인문
경제 수학|수학 경제
미디어 영어|영어 국제 미디어
세계사|사회 역사 인문
사회와 문화|사회 행정 심리
경제|사회 경제
세계시민과 지리|사회 지리 국제
현대사회와 윤리|사회 윤리 인문
물리학|과학 물리 공학
화학|과학 화학
생명과학|과학 생명
지구과학|과학 지구 환경
`),
  },
  {
    id: "g21-art",
    term: "2-1",
    title: "예술",
    count: 1,
    credit: 3,
    courses: courses(`
음악 연주와 창작|예술 음악 창작
미술 창작|예술 미술 창작
`),
  },
  {
    id: "g21-language",
    term: "2-1",
    title: "제2외국어·한문·정보",
    count: 1,
    credit: 3,
    courses: courses(`
언어생활과 한자|인문 국어 외국어
독일어(온)|외국어 국제
프랑스어(온)|외국어 국제
중국어(온)|외국어 국제
일본어|외국어 국제
스페인어|외국어 국제
데이터 과학|정보 수학
`),
  },
  {
    id: "g22-core",
    term: "2-2",
    title: "국어·수학·영어",
    count: 1,
    credit: 3,
    courses: courses(`
독서 토론과 글쓰기|국어 인문 행정
기하|수학 공학
영어 발표와 토론|영어 국제
`),
  },
  {
    id: "g22-inquiry",
    term: "2-2",
    title: "사회·과학 탐구",
    count: 3,
    credit: 3,
    courses: courses(`
법과 사회|사회 행정
도시의 미래 탐구|사회 지리 환경
인문학과 윤리|사회 인문 윤리
동아시아 역사 기행|사회 역사 국제
정치|사회 행정 국제
역학과 에너지|과학 물리 공학
물질과 에너지|과학 화학
세포와 물질대사|과학 생명
지구시스템과학|과학 지구 환경
과학과제 연구|과학 연구
`),
  },
  {
    id: "g22-art",
    term: "2-2",
    title: "예술",
    count: 1,
    credit: 3,
    courses: courses(`
음악 감상과 비평|예술 음악 인문
미술과 매체|예술 미술 정보 미디어
`),
  },
  {
    id: "g22-language",
    term: "2-2",
    title: "제2외국어·한문·정보",
    count: 1,
    credit: 3,
    courses: courses(`
한문|인문 국어 외국어
일본 문화|외국어 국제 인문
스페인어권 문화|외국어 국제 인문
소프트웨어와 생활|정보 공학
`),
  },
  {
    id: "g31-core",
    term: "3-1",
    title: "학기 선택",
    count: 1,
    credit: 3,
    courses: courses(`
문학 감상과 비평|국어 인문 예술
미적분Ⅱ|수학 공학
심화 영어|영어 국제
`),
  },
  {
    id: "g31-inquiry",
    term: "3-1",
    title: "사회·과학·정보 탐구",
    count: 3,
    credit: 3,
    courses: courses(`
국제 관계의 이해|사회 국제 행정
윤리와 사상|사회 윤리 인문
한국지리 탐구|사회 지리 환경
사회문제 탐구|사회 행정 연구
역사로 탐구하는 현대 세계|사회 역사 국제
전자기와 양자|과학 물리 공학
화학 반응의 세계|과학 화학
생물의 유전|과학 생명
행성우주과학|과학 지구
융합과학 탐구|과학 연구
프로그래밍|정보 공학
`),
  },
  {
    id: "g31-liberal",
    term: "3-1",
    title: "교양",
    count: 2,
    credit: 2,
    courses: courses(`
생태와 환경|환경 생명
논리와 사고|인문 수학 정보
인간과 경제활동|경제 사회
인간과 철학|인문 윤리
교육의 이해|교육 사회
인간과 심리|심리 생명 사회
`),
  },
  {
    id: "g32-core",
    term: "3-2",
    title: "학기 선택",
    count: 1,
    credit: 3,
    courses: courses(`
문학과 영상|국어 인문 예술 미디어
실용 통계|수학 정보 경제
세계 문화와 영어|영어 국제
`),
  },
  {
    id: "g32-inquiry",
    term: "3-2",
    title: "사회·과학 탐구 및 실험",
    count: 3,
    credit: 3,
    courses: courses(`
여행지리|사회 지리 국제
윤리문제 탐구|사회 윤리 인문
금융과 경제생활|사회 경제
기후변화와 지속가능한 세계|사회 환경 지리
물리학 실험|과학 물리 공학 실험
화학 실험|과학 화학 실험
생명과학 실험|과학 생명 실험
지구과학 실험|과학 지구 실험
과학의 역사와 문화|과학 역사 인문
기후변화와 환경생태|과학 환경 생명
`),
  },
];

/*
 * 공식 선수과목이 아닌 학습 연계 참고 관계입니다.
 */
const CONNECTIONS: Record<string, string[]> = {
  "역학과 에너지": ["물리학"],
  "물질과 에너지": ["화학"],
  "세포와 물질대사": ["생명과학"],
  "지구시스템과학": ["지구과학"],
  "전자기와 양자": ["물리학", "역학과 에너지"],
  "화학 반응의 세계": ["화학", "물질과 에너지"],
  "생물의 유전": ["생명과학", "세포와 물질대사"],
  "행성우주과학": ["지구과학", "지구시스템과학"],
  "물리학 실험": ["물리학"],
  "화학 실험": ["화학"],
  "생명과학 실험": ["생명과학"],
  "지구과학 실험": ["지구과학"],
  "프로그래밍": ["데이터 과학", "소프트웨어와 생활"],
  "일본 문화": ["일본어"],
  "스페인어권 문화": ["스페인어"],
};

/* ─────────────────────────────
 * 추천 가중치
 * ───────────────────────────── */

const MAJOR_WEIGHTS: Record<string, Record<string, number>> = {
  "컴퓨터·AI": {
    정보: 120,
    수학: 100,
    물리: 80,
    공학: 60,
    연구: 25,
    과학: 10,
  },
  "기계·전기전자": {
    물리: 120,
    공학: 100,
    수학: 90,
    정보: 70,
    연구: 25,
    과학: 10,
  },
  "화학·신소재": {
    화학: 120,
    수학: 80,
    물리: 70,
    공학: 60,
    연구: 25,
    과학: 10,
  },
  "의약·생명": {
    생명: 120,
    화학: 100,
    연구: 50,
    수학: 35,
    심리: 25,
    과학: 10,
  },
  "환경·지구": {
    환경: 120,
    지구: 110,
    생명: 70,
    화학: 50,
    지리: 40,
    연구: 25,
    과학: 10,
  },
};

const SUBJECT_TAGS: Record<string, string[]> = {
  국어: ["국어", "인문"],
  수학: ["수학"],
  영어: ["영어", "국제"],
  사회: ["사회"],
  과학: ["과학"],
  정보: ["정보"],
  체육: ["체육"],
  음악: ["음악"],
  미술: ["미술"],
  "제2외국어·한문": ["외국어"],
};

const KEYWORDS: Record<string, string[]> = {
  정보: [
    "컴퓨터",
    "코딩",
    "프로그래밍",
    "인공지능",
    "데이터",
    "소프트웨어",
    "알고리즘",
  ],
  수학: ["수학", "통계", "미적분", "기하"],
  물리: ["물리", "기계", "전기", "전자", "로봇"],
  화학: ["화학", "신소재", "화공"],
  생명: ["생명", "생물", "의학", "간호", "보건", "유전"],
  지구: ["지구", "우주", "천문"],
  환경: ["환경", "기후", "생태"],
  경제: ["경제", "경영", "금융", "회계", "무역"],
  행정: ["법학", "법률", "행정", "정치", "정책"],
  역사: ["역사", "세계사"],
  윤리: ["윤리", "철학"],
  국어: ["국어", "문학", "글쓰기", "작가"],
  영어: ["영어", "통역", "번역"],
  국제: ["국제", "외교"],
  예술: ["예술", "디자인", "영상", "미디어"],
  음악: ["음악", "작곡", "연주"],
  미술: ["미술", "그림", "디자인"],
  교육: ["교육", "교사"],
  심리: ["심리", "상담"],
};

/*
 * 점수 계산 또는 제한 로직을 변경하면 버전을 올리세요.
 * 아래에 포함된 데이터 변경은 MODEL_KEY에 자동 반영됩니다.
 */
const RECOMMENDATION_RULE_VERSION = 2;

const MODEL_KEY = JSON.stringify({
  ruleVersion: RECOMMENDATION_RULE_VERSION,
  groups: GROUPS,
  targets: TARGET,
  fixedCredits: FIXED_CREDITS,
  yearOneCredits: YEAR_ONE_CREDITS,
  creativeCredits: CREATIVE_CREDITS,
  subjectTarget: SUBJECT_TARGET,
  careers: CAREERS,
  stemCareers: Array.from(STEM_CAREERS).sort(),
  connections: CONNECTIONS,
  majorWeights: MAJOR_WEIGHTS,
  subjectTags: SUBJECT_TAGS,
  keywords: KEYWORDS,
});

/* ─────────────────────────────
 * 저장 데이터 검증·정규화
 * ───────────────────────────── */

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validList(
  value: unknown,
  allowed: string[]
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "string" && allowed.includes(item)
    ) &&
    new Set(value).size === value.length
  );
}

function isPayload(value: unknown): value is SurveyPayload {
  if (!isRecord(value) || value.version !== 1) return false;

  const c = value.criteria;

  if (!isRecord(c)) return false;

  return (
    typeof c.grade === "string" &&
    GRADES.includes(c.grade) &&
    (c.track === "general" || c.track === "science") &&
    typeof c.career === "string" &&
    Object.keys(CAREERS).includes(c.career) &&
    typeof c.targetMajor === "string" &&
    c.targetMajor.length <= 100 &&
    validList(c.interests, INTERESTS) &&
    validList(c.favoriteSubjects, SUBJECTS) &&
    c.favoriteSubjects.length > 0 &&
    typeof c.description === "string" &&
    c.description.length <= 1000
  );
}

function normalizeCriteria(criteria: Criteria): Criteria {
  return {
    grade: criteria.grade,
    track: criteria.track,
    career: criteria.career,
    targetMajor: criteria.targetMajor.trim(),
    interests: INTERESTS.filter((tag) =>
      criteria.interests.includes(tag)
    ),
    favoriteSubjects: SUBJECTS.filter((subject) =>
      criteria.favoriteSubjects.includes(subject)
    ),
    description: criteria.description.trim(),
  };
}

function getCriteriaKey(criteria: Criteria): string {
  return JSON.stringify(normalizeCriteria(criteria));
}

function isPlan(value: unknown): value is Plan {
  if (!isRecord(value) || Array.isArray(value)) return false;

  return Object.entries(value).every(
    ([id, names]) =>
      GROUPS.some((group) => group.id === id) &&
      Array.isArray(names) &&
      names.every((name) => typeof name === "string")
  );
}

function isSavedPlan(value: unknown): value is SavedPlan {
  return (
    isRecord(value) &&
    value.version === 2 &&
    typeof value.criteriaKey === "string" &&
    typeof value.modelKey === "string" &&
    isPlan(value.plan)
  );
}

/* ─────────────────────────────
 * 선택 제한
 * 자동 추천·수동 선택·검증에 공통 적용
 * ───────────────────────────── */

function usesSciencePolicy(criteria: Criteria) {
  return (
    criteria.track === "science" ||
    STEM_CAREERS.has(criteria.career)
  );
}

function isMixedInquiryGroup(group: Group) {
  return (
    group.courses.some((course) =>
      course.tags.includes("과학")
    ) &&
    group.courses.some((course) =>
      course.tags.includes("사회")
    )
  );
}

function policyBlockReason(
  group: Group,
  course: Course,
  criteria: Criteria
): string | null {
  if (
    !usesSciencePolicy(criteria) ||
    !isMixedInquiryGroup(group)
  ) {
    return null;
  }

  if (
    course.tags.includes("과학") ||
    course.tags.includes("정보")
  ) {
    return null;
  }

  return (
    "자연·공학 집중 설계에서는 이 선택군의 " +
    "과학·정보만 선택할 수 있습니다."
  );
}

function isCore(course: Course) {
  return course.tags.some((tag) =>
    ["국어", "수학", "영어"].includes(tag)
  );
}

function selectionBlockReason(
  group: Group,
  course: Course,
  current: string[],
  criteria: Criteria
): string | null {
  // 이미 선택된 과목은 항상 해제할 수 있습니다.
  if (current.includes(course.name)) return null;

  const policy = policyBlockReason(group, course, criteria);
  if (policy) return policy;

  if (current.length >= group.count) {
    return (
      `${group.count}과목까지 선택합니다. ` +
      "기존 과목을 먼저 해제해 주세요."
    );
  }

  if (
    group.maxCore !== undefined &&
    isCore(course) &&
    group.courses.filter(
      (item) => current.includes(item.name) && isCore(item)
    ).length >= group.maxCore
  ) {
    return (
      "국어·수학·영어는 합계 최대 " +
      `${group.maxCore}과목 선택합니다.`
    );
  }

  return null;
}

/* ─────────────────────────────
 * 학점·계획 검증
 * ───────────────────────────── */

function selectedCredits(plan: Plan, term: Term) {
  return GROUPS.filter((group) => group.term === term).reduce(
    (sum, group) =>
      sum + (plan[group.id]?.length ?? 0) * group.credit,
    0
  );
}

function termCredits(plan: Plan, term: Term) {
  return FIXED_CREDITS[term] + selectedCredits(plan, term);
}

function earlierCourses(plan: Plan, term: Term) {
  const index = TERMS.indexOf(term);

  return GROUPS.filter(
    (group) => TERMS.indexOf(group.term) < index
  ).flatMap((group) => plan[group.id] ?? []);
}

/*
 * 미완성 계획과 사용자가 초기화한 빈 계획은 허용합니다.
 * 중복·초과·금지 과목 등 잘못된 상태만 검출합니다.
 */
function structuralErrors(
  plan: Plan,
  criteria: Criteria
): string[] {
  const errors: string[] = [];

  for (const id of Object.keys(plan)) {
    if (!GROUPS.some((group) => group.id === id)) {
      errors.push(`알 수 없는 선택군: ${id}`);
    }
  }

  for (const group of GROUPS) {
    const names = plan[group.id] ?? [];
    const label = `${TERM_NAMES[group.term]} ${group.title}`;

    if (names.length > group.count) {
      errors.push(`${label}: 선택 개수 초과`);
    }

    if (new Set(names).size !== names.length) {
      errors.push(`${label}: 중복 과목`);
    }

    for (const name of names) {
      const course = group.courses.find(
        (item) => item.name === name
      );

      if (!course) {
        errors.push(`${label}: 선택군에 없는 과목`);
        continue;
      }

      const reason = policyBlockReason(
        group,
        course,
        criteria
      );

      if (reason) {
        errors.push(`${name}: ${reason}`);
      }
    }

    if (group.maxCore !== undefined) {
      const coreCount = group.courses.filter(
        (course) =>
          names.includes(course.name) && isCore(course)
      ).length;

      if (coreCount > group.maxCore) {
        errors.push(`${label}: 국수영 선택 제한 위반`);
      }
    }
  }

  return errors;
}

function validatePlan(
  plan: Plan,
  criteria: Criteria
): string[] {
  const errors = structuralErrors(plan, criteria);

  for (const group of GROUPS) {
    const count = plan[group.id]?.length ?? 0;

    if (count !== group.count) {
      errors.push(
        `${TERM_NAMES[group.term]} ${group.title}: ` +
          `${count}/${group.count}과목 선택`
      );
    }
  }

  for (const term of TERMS) {
    const total = termCredits(plan, term);

    if (total !== TARGET[term]) {
      errors.push(
        `${TERM_NAMES[term]}: ${total}/${TARGET[term]}학점`
      );
    }
  }

  const totalSubjectCredits =
    YEAR_ONE_CREDITS +
    TERMS.reduce(
      (sum, term) => sum + termCredits(plan, term),
      0
    );

  if (totalSubjectCredits !== SUBJECT_TARGET) {
    errors.push(
      `전체 교과: ${totalSubjectCredits}/${SUBJECT_TARGET}학점`
    );
  }

  return errors;
}

/* ─────────────────────────────
 * 추천 점수
 * ───────────────────────────── */

function majorScore(course: Course, career: string) {
  const weights = MAJOR_WEIGHTS[career];

  if (weights) {
    return course.tags.reduce(
      (sum, tag) => sum + (weights[tag] ?? 0),
      0
    );
  }

  const priorities = CAREERS[career] ?? [];

  return priorities.reduce(
    (sum, tag, index) =>
      sum +
      (course.tags.includes(tag)
        ? (priorities.length - index) * 25
        : 0),
    0
  );
}

function matchedSubjects(
  course: Course,
  criteria: Criteria
) {
  return criteria.favoriteSubjects.filter((subject) =>
    (SUBJECT_TAGS[subject] ?? []).some((tag) =>
      course.tags.includes(tag)
    )
  );
}

function normalizeKeywordText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function matchedKeywords(
  course: Course,
  criteria: Criteria
) {
  const rawText =
    `${criteria.targetMajor} ${criteria.description}`
      .normalize("NFKC")
      .toLowerCase();

  const normalizedText = normalizeKeywordText(rawText);

  const matches = course.tags.flatMap((tag) =>
    (KEYWORDS[tag] ?? []).filter((keyword) =>
      normalizedText.includes(
        normalizeKeywordText(keyword)
      )
    )
  );

  /*
   * AI, AI개발 등을 인식합니다.
   * 영문 단어 내부의 ai 문자열은 제외합니다.
   */
  if (
    course.tags.includes("정보") &&
    /(^|[^a-z0-9])ai(?=$|[^a-z0-9])/i.test(rawText)
  ) {
    matches.push("AI");
  }

  return Array.from(new Set(matches));
}

function scoreCourse(
  course: Course,
  criteria: Criteria,
  previous: string[]
) {
  const major = majorScore(course, criteria.career);

  // 진로 연계를 개인 취향보다 우선합니다.
  const majorPriority = major > 0 ? 1000 : 0;

  const interest = Math.min(
    course.tags.filter((tag) =>
      criteria.interests.includes(tag)
    ).length * 4,
    12
  );

  const favorite = Math.min(
    matchedSubjects(course, criteria).length * 3,
    9
  );

  const keyword = Math.min(
    matchedKeywords(course, criteria).length * 2,
    6
  );

  const links = CONNECTIONS[course.name] ?? [];
  const learned = links.filter((name) =>
    previous.includes(name)
  ).length;

  const continuity =
    links.length === 0
      ? 0
      : learned > 0
        ? learned * 20
        : -15;

  const science =
    criteria.track === "science" &&
    course.tags.includes("과학")
      ? 10
      : 0;

  return (
    majorPriority +
    major +
    interest +
    favorite +
    keyword +
    continuity +
    science
  );
}

function buildPlan(criteria: Criteria) {
  const next: Plan = {};

  /*
   * GROUPS의 물리적 선언 순서와 무관하게
   * 학기 순서대로 구성합니다.
   */
  for (const term of TERMS) {
    const previous = earlierCourses(next, term);

    for (const group of GROUPS.filter(
      (item) => item.term === term
    )) {
      const ranked = group.courses
        .filter(
          (course) =>
            policyBlockReason(
              group,
              course,
              criteria
            ) === null
        )
        .map((course, index) => ({
          course,
          index,
          score: scoreCourse(
            course,
            criteria,
            previous
          ),
        }))
        .sort(
          (a, b) =>
            b.score - a.score || a.index - b.index
        );

      const selected: string[] = [];

      for (const item of ranked) {
        if (selected.length === group.count) break;

        const blocked = selectionBlockReason(
          group,
          item.course,
          selected,
          criteria
        );

        if (!blocked) {
          selected.push(item.course.name);
        }
      }

      next[group.id] = selected;
    }
  }

  return {
    plan: next,
    errors: validatePlan(next, criteria),
  };
}

/* ─────────────────────────────
 * 추천 이유
 * ───────────────────────────── */

function reasonsFor(
  course: Course,
  criteria: Criteria,
  previous: string[]
) {
  const reasons: string[] = [];

  if (majorScore(course, criteria.career) > 0) {
    reasons.push(
      `${criteria.career} 분야의 내부 추천 태그와 연결됩니다.`
    );
  }

  const interests = course.tags.filter((tag) =>
    criteria.interests.includes(tag)
  );

  if (interests.length > 0) {
    reasons.push(`관심 분야: ${interests.join(", ")}`);
  }

  const subjects = matchedSubjects(course, criteria);

  if (subjects.length > 0) {
    reasons.push(
      `좋아하는 교과 연결: ${subjects.join(", ")}`
    );
  }

  const keywords = matchedKeywords(course, criteria);

  if (keywords.length > 0) {
    reasons.push(
      `입력 키워드 참고: ${keywords.slice(0, 3).join(", ")}`
    );
  }

  const learned = (
    CONNECTIONS[course.name] ?? []
  ).filter((name) => previous.includes(name));

  if (learned.length > 0) {
    reasons.push(
      `앞 학기 선택과 연계: ${learned.join(", ")}`
    );
  }

  if (
    criteria.track === "science" &&
    course.tags.includes("과학")
  ) {
    reasons.push("과학중점반 추천 가점이 적용됩니다.");
  }

  if (reasons.length === 0) {
    reasons.push(
      "현재 규칙에서 직접 연결되는 근거가 적은 후보입니다. " +
        "선택군 조건과 개인 선호를 확인하세요."
    );
  }

  return reasons;
}

/* ─────────────────────────────
 * 페이지
 * ───────────────────────────── */

export default function CurriculumPage() {
  const [loaded, setLoaded] = useState(false);
  const [persistReady, setPersistReady] = useState(false);

  const [criteria, setCriteria] =
    useState<Criteria | null>(null);

  const [criteriaKey, setCriteriaKey] = useState("");
  const [plan, setPlan] = useState<Plan>({});

  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const [mode, setMode] = useState("선택 전");

  // 설문 및 커리큘럼 초기 복원
  useEffect(() => {
    setPersistReady(false);

    try {
      const raw = sessionStorage.getItem(SURVEY_KEY);

      if (!raw) {
        setMessage("설문을 먼저 작성해 주세요.");
        return;
      }

      const payload: unknown = JSON.parse(raw);

      if (!isPayload(payload)) {
        setMessage(
          "설문 형식이 올바르지 않습니다. " +
            "설문을 다시 작성해 주세요."
        );
        return;
      }

      const current = normalizeCriteria(payload.criteria);
      const key = getCriteriaKey(current);

      setCriteria(current);
      setCriteriaKey(key);

      let restoredPlan: Plan | null = null;
      let restoreReason = "";

      try {
        const savedRaw = sessionStorage.getItem(PLAN_KEY);

        if (savedRaw) {
          const saved: unknown = JSON.parse(savedRaw);

          if (!isSavedPlan(saved)) {
            restoreReason = "저장 형식이 변경되었습니다.";
          } else if (saved.criteriaKey !== key) {
            restoreReason = "설문 기준이 변경되었습니다.";
          } else if (saved.modelKey !== MODEL_KEY) {
            restoreReason =
              "교육과정 또는 추천 규칙이 변경되었습니다.";
          } else if (
            structuralErrors(
              saved.plan,
              current
            ).length > 0
          ) {
            restoreReason =
              "저장된 선택에 유효하지 않은 항목이 있습니다.";
          } else {
            /*
             * 미완성 계획 및 의도적으로 초기화한
             * 빈 계획도 정상적으로 복원합니다.
             */
            restoredPlan = saved.plan;
          }
        }
      } catch {
        restoreReason =
          "저장된 과목 선택을 읽지 못했습니다.";
      }

      if (restoredPlan !== null) {
        setPlan(restoredPlan);
        setMode("저장된 선택");
        setMessage(
          "같은 설문 기준으로 저장된 선택을 불러왔습니다."
        );
        setPersistReady(true);
        return;
      }

      const result = buildPlan(current);

      if (result.errors.length > 0) {
        /*
         * 추천 실패로 생긴 빈 계획은 자동 저장하지 않습니다.
         * 기존 저장 데이터도 유지합니다.
         */
        setPlan({});
        setMode("추천 확인 필요");
        setMessage(
          [
            restoreReason,
            "현재 조건으로 전체 추천을 만들지 못했습니다.",
            "기존 저장 데이터는 덮어쓰지 않았습니다.",
            result.errors.join(" / "),
          ]
            .filter(Boolean)
            .join(" ")
        );
        return;
      }

      setPlan(result.plan);
      setMode("자동 추천");
      setMessage(
        [
          restoreReason,
          "설문 기준으로 전체 커리큘럼을 추천했습니다.",
          "허용 범위 안에서 직접 조정할 수 있습니다.",
        ]
          .filter(Boolean)
          .join(" ")
      );

      setPersistReady(true);
    } catch {
      setMessage(
        "설문을 읽지 못했습니다. " +
          "저장소 설정을 확인하고 설문을 다시 작성해 주세요."
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  // 복원 또는 추천 성공 이후에만 자동 저장
  useEffect(() => {
    if (
      !loaded ||
      !persistReady ||
      !criteria ||
      !criteriaKey
    ) {
      return;
    }

    if (structuralErrors(plan, criteria).length > 0) {
      return;
    }

    try {
      const currentRaw =
        sessionStorage.getItem(SURVEY_KEY);

      if (!currentRaw) {
        setWarning(
          "저장된 설문이 없어 자동 저장을 중단했습니다. " +
            "설문을 다시 작성해 주세요."
        );
        return;
      }

      const currentPayload: unknown =
        JSON.parse(currentRaw);

      if (
        !isPayload(currentPayload) ||
        getCriteriaKey(currentPayload.criteria) !==
          criteriaKey
      ) {
        setWarning(
          "저장된 설문 기준이 변경되었습니다. " +
            "현재 선택의 자동 저장을 중단했습니다. " +
            "페이지를 새로고침해 주세요."
        );
        return;
      }

      const saved: SavedPlan = {
        version: 2,
        criteriaKey,
        modelKey: MODEL_KEY,
        plan,
      };

      sessionStorage.setItem(
        PLAN_KEY,
        JSON.stringify(saved)
      );

      setWarning("");
    } catch {
      setWarning(
        "현재 과목 선택을 저장하지 못했습니다. " +
          "새로고침하면 변경 내용이 사라질 수 있습니다."
      );
    }
  }, [
    loaded,
    persistReady,
    criteria,
    criteriaKey,
    plan,
  ]);

  function recommendAgain() {
    if (!criteria) return;

    const confirmed = window.confirm(
      "현재 수동 선택을 설문 기준의 자동 추천으로 교체할까요?"
    );

    if (!confirmed) return;

    const result = buildPlan(criteria);

    if (result.errors.length > 0) {
      setMessage(
        "추천 조건을 충족하지 못했습니다. " +
          "현재 선택은 유지했습니다. " +
          result.errors.join(" / ")
      );
      return;
    }

    setPlan(result.plan);
    setPersistReady(true);
    setMode("자동 추천");
    setMessage(
      "설문 기준으로 전체 과목을 다시 추천했습니다."
    );
  }

  function toggleCourse(group: Group, course: Course) {
    if (!criteria) return;

    const current = plan[group.id] ?? [];

    if (current.includes(course.name)) {
      setPlan({
        ...plan,
        [group.id]: current.filter(
          (name) => name !== course.name
        ),
      });

      setPersistReady(true);
      setMode("수동 조정");
      setMessage(
        `${course.name} 선택을 해제했습니다.`
      );
      return;
    }

    /*
     * 화면의 disabled 처리와 별도로
     * 실제 상태 변경 전에도 동일한 제한을 검사합니다.
     */
    const blocked = selectionBlockReason(
      group,
      course,
      current,
      criteria
    );

    if (blocked) {
      setMessage(`${course.name}: ${blocked}`);
      return;
    }

    setPlan({
      ...plan,
      [group.id]: [...current, course.name],
    });

    setPersistReady(true);
    setMode("수동 조정");
    setMessage(
      `${course.name}을(를) 선택했습니다.`
    );
  }

  function clearPlan() {
    const confirmed = window.confirm(
      "설문은 유지하고 과목 선택만 모두 해제할까요?"
    );

    if (!confirmed) return;

    setPlan({});
    setPersistReady(true);
    setMode("선택 초기화");
    setMessage(
      "선택을 초기화했습니다. " +
        "직접 선택하거나 전체 다시 추천을 눌러 주세요."
    );
  }

  if (!loaded) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        설문과 커리큘럼을 불러오는 중입니다…
      </main>
    );
  }

  if (!criteria) {
    return (
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-16">
        <h1 className="text-3xl font-bold">
          설문을 먼저 작성해 주세요
        </h1>

        <p className="leading-relaxed text-slate-600">
          {message}
        </p>

        <Link
          href="/survey"
          className="inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          설문 작성하기
        </Link>
      </main>
    );
  }

  const sciencePolicy = usesSciencePolicy(criteria);
  const errors = validatePlan(plan, criteria);

  const totalSubjectCredits =
    YEAR_ONE_CREDITS +
    TERMS.reduce(
      (sum, term) => sum + termCredits(plan, term),
      0
    );

  const hasPlan = Object.values(plan).some(
    (names) => names.length > 0
  );

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 text-slate-900">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-indigo-600">
            오현고 · 2026학년도 입학생
          </p>

          <nav className="flex gap-4 text-sm">
            <Link
              href="/survey"
              className="text-indigo-600 hover:underline"
            >
              설문 수정
            </Link>

            <Link
              href="/"
              className="text-slate-600 hover:underline"
            >
              홈으로
            </Link>
          </nav>
        </div>

        <p className="text-sm font-semibold text-indigo-600">
          2단계 · 추천 확인과 과목 조정
        </p>

        <h1 className="text-3xl font-bold">
          나의 학기별 커리큘럼
        </h1>

        <p className="leading-relaxed text-slate-600">
          설문 기준으로 구성한 초안입니다.
          과목을 바꾸려면 기존 선택을 먼저 해제하세요.
          앞 학기 변경 후 뒤 학기 추천은 자동 교체하지 않으므로
          학습 연계 안내를 확인해 주세요.
        </p>
      </header>

      {/* 읽기 전용 추천 기준 */}
      <section className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            1. 나의 추천 기준
          </h2>

          <Link
            href="/survey"
            className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700"
          >
            설문 수정하기
          </Link>
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-slate-500">현재 학년</dt>
            <dd className="mt-1 font-semibold">
              {criteria.grade}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">반 구분</dt>
            <dd className="mt-1 font-semibold">
              {criteria.track === "science"
                ? "과학중점반"
                : "일반반"}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">
              희망 진로 분야
            </dt>
            <dd className="mt-1 font-semibold">
              {criteria.career}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">
              희망 학과·직업
            </dt>
            <dd className="mt-1 break-words font-semibold">
              {criteria.targetMajor || "미입력"}
            </dd>
          </div>
        </dl>

        <p className="text-sm leading-relaxed text-slate-700">
          <strong>관심 분야:</strong>{" "}
          {criteria.interests.join(", ") || "미선택"}
          <br />
          <strong>좋아하는 교과:</strong>{" "}
          {criteria.favoriteSubjects.join(", ")}
        </p>

        <details className="rounded-xl bg-white p-4 text-sm">
          <summary className="cursor-pointer font-semibold">
            관심 활동·탐구 주제 확인
          </summary>

          <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed text-slate-600">
            {criteria.description || "작성하지 않음"}
          </p>
        </details>

        <div className="rounded-xl bg-white p-4 text-sm leading-relaxed">
          <p className="font-bold">
            {sciencePolicy
              ? "자연·공학 집중 설계 적용 중"
              : "일반 탐색 설계 적용 중"}
          </p>

          <p className="mt-2 text-slate-600">
            {sciencePolicy
              ? "사회·과학 혼합 탐구 선택군에서는 과학·정보만 허용합니다. 예술·외국어·교양 선택군은 유지합니다."
              : "계열 제한 없이 선택군 조건 안에서 진로와 관심을 반영합니다."}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            서비스 내부 정책이며 대학 공통 필수 조건이
            아닙니다. 추천 기준은 설문에서 변경합니다.
          </p>
        </div>

        <p className="text-xs leading-relaxed text-slate-600">
          기준을 바꾸면 새 추천이 정상 생성된 뒤 저장된
          계획을 교체합니다. 같은 기준이면 기존 선택을
          복원합니다. 현재 학년과 관계없이 2·3학년 전체
          초안을 표시하며 실제 이수 이력은 자동 반영하지
          않습니다.
        </p>
      </section>

      <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
        <p className="font-bold">
          학교 확인이 필요한 초안입니다.
        </p>

        <p className="mt-2">
          학기별 과목 배치·학교지정 학점·개설 여부·정원·시간표와
          과학중점반 추가 이수 요건은 학교 원본으로 확인하세요.
          이 도구는 해당 조건 전체를 검증하지 않습니다.
        </p>
      </aside>

      {warning && (
        <p
          role="alert"
          className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
        >
          {warning}
        </p>
      )}

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-900"
        >
          {message}
        </p>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={recommendAgain}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            설문 기준으로 전체 다시 추천
          </button>

          <button
            type="button"
            onClick={clearPlan}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50"
          >
            과목 선택만 초기화
          </button>
        </div>

        <p className="text-xs leading-relaxed text-slate-500">
          다시 추천하면 수동 선택이 교체됩니다.
          동점은 목록 순서로 결정합니다. 선택 개수를 채우기
          위한 후보도 포함되며, 내부 점수나 태그는
          적합도 확률·대학 필수 과목·합격 가능성을
          뜻하지 않습니다.
        </p>

        <p className="text-xs leading-relaxed text-slate-500">
          자유 입력은 단순 키워드로 참고합니다.
          ‘화학은 싫어요’와 같은 부정 표현도 일치로
          처리될 수 있습니다.
        </p>
      </section>

      {/* 학점 현황 */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            2. 학기별 학점 현황
          </h2>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
            {mode}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TERMS.map((term) => {
            const total = termCredits(plan, term);

            const complete =
              total === TARGET[term] &&
              GROUPS.filter(
                (group) => group.term === term
              ).every(
                (group) =>
                  (plan[group.id]?.length ?? 0) ===
                  group.count
              );

            return (
              <div
                key={term}
                className={`rounded-2xl border p-5 ${
                  complete
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <h3 className="font-semibold">
                  {TERM_NAMES[term]}
                </h3>

                <p className="my-3 text-2xl font-bold">
                  {total}
                  <span className="text-base font-normal text-slate-500">
                    {" "}/ {TARGET[term]}학점
                  </span>
                </p>

                <p className="text-sm text-slate-600">
                  학교지정 {FIXED_CREDITS[term]} + 선택{" "}
                  {selectedCredits(plan, term)}
                </p>

                <p className="mt-2 text-sm">
                  {complete
                    ? "✓ 초안 기준 선택 완료"
                    : "선택 진행 중"}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-slate-600">
          1학년 교과 {YEAR_ONE_CREDITS}학점 포함:{" "}
          <strong>
            {totalSubjectCredits} / {SUBJECT_TARGET}학점
          </strong>
          {" · "}창의적 체험활동 {CREATIVE_CREDITS}학점 별도
        </p>
      </section>

      {/* 학기별 선택 */}
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-bold">
            3. 학기별 과목 선택
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            선택된 과목을 누르면 해제됩니다.
            제한 사유는 각 과목 아래 표시됩니다.
          </p>
        </div>

        {TERMS.map((term) => {
          const previous = earlierCourses(plan, term);

          return (
            <section key={term} className="space-y-5">
              <h3 className="border-b border-slate-200 pb-3 text-2xl font-bold">
                {TERM_NAMES[term]}
              </h3>

              {GROUPS.filter(
                (group) => group.term === term
              ).map((group) => {
                const selected =
                  plan[group.id] ?? [];

                return (
                  <div
                    key={group.id}
                    className="space-y-4 rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold">
                          {group.title}
                        </h4>

                        <p className="mt-1 text-sm text-slate-600">
                          {group.count}과목 선택 · 과목당{" "}
                          {group.credit}학점
                          {group.maxCore !== undefined &&
                            ` · 국수영 합계 최대 ${group.maxCore}과목`}
                        </p>

                        {sciencePolicy &&
                          isMixedInquiryGroup(group) && (
                            <p className="mt-2 text-xs font-semibold text-blue-700">
                              자연·공학 집중: 과학·정보만 허용
                            </p>
                          )}
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
                        {selected.length}/{group.count}과목
                        {" · "}
                        {selected.length * group.credit}/
                        {group.count * group.credit}학점
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {group.courses.map((course) => {
                        const active =
                          selected.includes(course.name);

                        const blocked =
                          selectionBlockReason(
                            group,
                            course,
                            selected,
                            criteria
                          );

                        const policyBlocked =
                          policyBlockReason(
                            group,
                            course,
                            criteria
                          ) !== null;

                        const majorRelated =
                          majorScore(
                            course,
                            criteria.career
                          ) > 0;

                        return (
                          <button
                            key={course.name}
                            type="button"
                            aria-pressed={active}
                            disabled={blocked !== null}
                            title={
                              blocked ??
                              `${course.name} ${
                                active
                                  ? "선택 해제"
                                  : "선택"
                              }`
                            }
                            onClick={() =>
                              toggleCourse(
                                group,
                                course
                              )
                            }
                            className={`rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                              active
                                ? "border-indigo-500 bg-indigo-50"
                                : blocked
                                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                                  : "border-slate-300 bg-white hover:border-indigo-400"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold">
                                {course.name}
                              </span>

                              <span aria-hidden="true">
                                {active
                                  ? "✓"
                                  : blocked
                                    ? "—"
                                    : "+"}
                              </span>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                              {group.credit}학점 ·{" "}
                              {course.tags.join(" / ")}
                            </p>

                            {!policyBlocked &&
                              majorRelated && (
                                <span className="mt-3 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                  내부 진로 태그 연계
                                </span>
                              )}

                            {blocked && (
                              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                                {blocked}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selected.length > 0 && (
                      <div className="space-y-4 rounded-xl bg-slate-50 p-4">
                        <p className="font-semibold">
                          현재 선택 과목의 연결 근거
                        </p>

                        <p className="text-xs text-slate-500">
                          수동 선택 과목도 같은 규칙으로
                          설명합니다. 자동 추천 여부를
                          뜻하지는 않습니다.
                        </p>

                        {selected.map((name) => {
                          const course =
                            group.courses.find(
                              (item) =>
                                item.name === name
                            );

                          if (!course) return null;

                          const reasons = reasonsFor(
                            course,
                            criteria,
                            previous
                          );

                          const links =
                            CONNECTIONS[name] ?? [];

                          const missingConnection =
                            links.length > 0 &&
                            !links.some((item) =>
                              previous.includes(item)
                            );

                          return (
                            <div
                              key={name}
                              className="text-sm"
                            >
                              <p className="font-semibold">
                                {name}
                              </p>

                              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                                {reasons.map((reason) => (
                                  <li key={reason}>
                                    {reason}
                                  </li>
                                ))}
                              </ul>

                              {missingConnection && (
                                <p className="mt-2 leading-relaxed text-amber-800">
                                  학습 연계 확인:{" "}
                                  {links.join(" / ")}
                                  의 앞 학기 선택 이력이
                                  없습니다. 공식 선수과목
                                  제한은 아니며 기초 학습
                                  여부를 확인하세요.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </section>

      {/* 최종 검증 */}
      <section className="rounded-2xl border border-slate-200 p-5">
        <h2 className="text-xl font-bold">
          4. 전체 초안 점검
        </h2>

        {!hasPlan ? (
          <p className="mt-3 text-sm text-slate-600">
            과목을 직접 선택하거나 전체 다시 추천을
            눌러 주세요.
          </p>
        ) : errors.length > 0 ? (
          <div className="mt-4 rounded-xl bg-amber-50 p-4">
            <p className="font-semibold text-amber-900">
              조정이 필요한 항목이 있습니다.
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900">
              {errors.map((error, index) => (
                <li key={`${index}-${error}`}>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-900">
            <p className="font-bold">
              ✓ 설정된 선택 개수·진로 제한·학점 조건을
              충족했습니다.
            </p>

            <p className="mt-2 text-sm">
              교과 {totalSubjectCredits}학점 +
              창의적 체험활동 {CREATIVE_CREDITS}학점 =
              총{" "}
              {totalSubjectCredits + CREATIVE_CREDITS}학점
            </p>

            <p className="mt-2 text-sm leading-relaxed">
              이 도구에 입력된 초안 기준 결과입니다.
              실제 졸업 요건 충족이나 수강 가능 여부를
              확정하지 않으므로 학교 확인이 필요합니다.
            </p>
          </div>
        )}
      </section>

      <footer className="space-y-2 border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-500">
        <p>
          설문과 선택은 현재 탭의 sessionStorage에 저장합니다.
          미완성 선택과 직접 초기화한 빈 계획도 복원합니다.
          저장 실패 시 화면에 경고를 표시합니다.
        </p>

        <p>
          교육과정 데이터 또는 추천 규칙 버전이 변경되면
          새 추천을 생성합니다. 추천 실패만으로 기존
          저장 계획을 덮어쓰지는 않습니다.
        </p>

        <p>
          규칙 기반 추천 시범 버전입니다.
          대학별 공식 권장 과목이나 합격 가능성을
          의미하지 않습니다.
        </p>
      </footer>
    </main>
  );
}