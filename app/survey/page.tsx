"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

const SURVEY_KEY = "ohyun-survey-v1";
const PLAN_KEY = "ohyun-curriculum-plan-v1";

type Track = "general" | "science";

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

const CAREERS = [
  "아직 탐색 중",
  "컴퓨터·AI",
  "기계·전기전자",
  "화학·신소재",
  "의약·생명",
  "환경·지구",
  "경영·경제",
  "법·행정·정치",
  "인문·어문",
  "교육·심리",
  "예술·미디어",
];

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

const INITIAL: Criteria = {
  grade: "",
  track: "general",
  career: "",
  targetMajor: "",
  interests: [],
  favoriteSubjects: [],
  description: "",
};

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 " +
  "text-slate-900 outline-none focus:border-indigo-500 " +
  "focus:ring-2 focus:ring-indigo-100";

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
    CAREERS.includes(c.career) &&
    typeof c.targetMajor === "string" &&
    c.targetMajor.length <= 100 &&
    validList(c.interests, INTERESTS) &&
    validList(c.favoriteSubjects, SUBJECTS) &&
    c.favoriteSubjects.length > 0 &&
    typeof c.description === "string" &&
    c.description.length <= 1000
  );
}

function normalizeCriteria(form: Criteria): Criteria {
  return {
    grade: form.grade,
    track: form.track,
    career: form.career,
    targetMajor: form.targetMajor.trim(),
    interests: INTERESTS.filter((tag) =>
      form.interests.includes(tag)
    ),
    favoriteSubjects: SUBJECTS.filter((subject) =>
      form.favoriteSubjects.includes(subject)
    ),
    description: form.description.trim(),
  };
}

export default function SurveyPage() {
  const [form, setForm] = useState<Criteria>(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const [hasSavedSurvey, setHasSavedSurvey] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 빠른 중복 제출도 방지합니다.
  const submittingRef = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SURVEY_KEY);

      if (raw) {
        const parsed: unknown = JSON.parse(raw);

        if (isPayload(parsed)) {
          setForm(normalizeCriteria(parsed.criteria));
          setHasSavedSurvey(true);
          setNotice("이전에 작성한 설문을 불러왔습니다.");
        } else {
          setNotice(
            "이전 설문 형식이 현재 버전과 달라 다시 작성해야 합니다."
          );
        }
      }
    } catch {
      setNotice(
        "이전 설문을 읽지 못했습니다. 설문을 다시 작성해 주세요."
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  const sciencePolicy =
    form.track === "science" || STEM_CAREERS.has(form.career);

  function update<K extends keyof Criteria>(
    key: K,
    value: Criteria[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError("");
  }

  function toggle(
    key: "interests" | "favoriteSubjects",
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((item) => item !== value)
        : [...previous[key], value],
    }));
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    if (!form.grade) {
      setError("현재 학년을 선택해 주세요.");
      return;
    }

    if (!form.career) {
      setError(
        "희망 진로 분야를 선택해 주세요. " +
          "미정이면 ‘아직 탐색 중’을 선택하세요."
      );
      return;
    }

    if (form.favoriteSubjects.length === 0) {
      setError("좋아하거나 자신 있는 교과를 선택해 주세요.");
      return;
    }

    const payload: SurveyPayload = {
      version: 1,
      criteria: normalizeCriteria(form),
    };

    if (!isPayload(payload)) {
      setError("설문 입력값을 다시 확인해 주세요.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      /*
       * 기존 계획을 먼저 삭제하지 않습니다.
       * curriculum에서 정규화된 기준을 비교한 뒤
       * 새 추천이 성공했을 때 저장된 계획을 교체합니다.
       */
      sessionStorage.setItem(
        SURVEY_KEY,
        JSON.stringify(payload)
      );
    } catch {
      submittingRef.current = false;
      setSubmitting(false);
      setError(
        "설문을 저장하지 못했습니다. " +
          "브라우저 저장소 설정을 확인해 주세요. " +
          "기존 커리큘럼은 삭제하지 않았습니다."
      );
      return;
    }

    window.location.assign("/curriculum");
  }

  function clearSavedData() {
    if (submittingRef.current) return;

    const confirmed = window.confirm(
      "저장된 설문과 커리큘럼 선택을 모두 삭제할까요?"
    );

    if (!confirmed) return;

    try {
      sessionStorage.removeItem(SURVEY_KEY);
      sessionStorage.removeItem(PLAN_KEY);

      setForm(INITIAL);
      setHasSavedSurvey(false);
      setError("");
      setNotice("저장된 설문과 커리큘럼을 삭제했습니다.");
    } catch {
      setError(
        "데이터를 모두 삭제하지 못했습니다. " +
          "브라우저의 사이트 데이터 설정을 확인해 주세요."
      );
    }
  }

  if (!loaded) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        설문을 불러오는 중입니다…
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b border-indigo-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-indigo-600"
          >
            오현고 선택과목
          </Link>

          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-indigo-600"
          >
            홈으로
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div>
          <p className="font-semibold text-indigo-600">
            1단계 · 나의 추천 기준
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            진로 맞춤 선택과목 설문
          </h1>

          <p className="mt-3 leading-relaxed text-slate-600">
            추천 기준을 입력하면 다음 화면에서 학기별 추천과
            과목 조정을 진행할 수 있습니다.
          </p>
        </div>

        {notice && (
          <p
            role="status"
            className="rounded-xl bg-white p-4 text-sm text-slate-700"
          >
            {notice}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          <p className="text-sm text-slate-500">
            <span className="text-red-600">*</span> 필수 항목
          </p>

          <div>
            <label
              htmlFor="grade"
              className="mb-3 block text-lg font-bold"
            >
              1. 현재 학년 <span className="text-red-600">*</span>
            </label>

            <select
              id="grade"
              required
              value={form.grade}
              onChange={(event) =>
                update("grade", event.target.value)
              }
              className={INPUT_CLASS}
            >
              <option value="">학년 선택</option>
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              2026학년도 입학생의 2·3학년 전체 설계 초안을
              보여줍니다. 현재 학년은 참고 정보이며 실제 이수
              이력은 자동 반영하지 않습니다.
            </p>
          </div>

          <div>
            <label
              htmlFor="track"
              className="mb-3 block text-lg font-bold"
            >
              2. 반 구분 <span className="text-red-600">*</span>
            </label>

            <select
              id="track"
              value={form.track}
              onChange={(event) =>
                update("track", event.target.value as Track)
              }
              className={INPUT_CLASS}
            >
              <option value="general">일반반</option>
              <option value="science">과학중점반</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="career"
              className="mb-3 block text-lg font-bold"
            >
              3. 희망 진로 분야{" "}
              <span className="text-red-600">*</span>
            </label>

            <select
              id="career"
              required
              value={form.career}
              onChange={(event) =>
                update("career", event.target.value)
              }
              className={INPUT_CLASS}
            >
              <option value="">진로 분야 선택</option>
              {CAREERS.map((career) => (
                <option key={career} value={career}>
                  {career}
                </option>
              ))}
            </select>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              추천과 선택 제한의 기준입니다.
              컴퓨터공학과 지망이면 ‘컴퓨터·AI’를 선택하세요.
            </p>
          </div>

          <div>
            <label
              htmlFor="targetMajor"
              className="mb-3 block text-lg font-bold"
            >
              4. 희망 학과 또는 직업
            </label>

            <input
              id="targetMajor"
              type="text"
              maxLength={100}
              value={form.targetMajor}
              onChange={(event) =>
                update("targetMajor", event.target.value)
              }
              placeholder="예: 컴퓨터공학과, 간호사, 디자이너"
              className={INPUT_CLASS}
            />

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              선택 사항입니다. 키워드는 보조 추천에만 사용하며
              선택한 진로 분야를 자동 변경하지 않습니다.
            </p>
          </div>

          <fieldset>
            <legend className="text-lg font-bold">
              5. 관심 분야
            </legend>

            <p className="mb-3 mt-2 text-sm text-slate-500">
              여러 개 선택할 수 있습니다. 아직 모르겠다면
              선택하지 않아도 됩니다.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {INTERESTS.map((interest) => {
                const checked = form.interests.includes(interest);

                return (
                  <label
                    key={interest}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                      checked
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggle("interests", interest)
                      }
                      className="h-4 w-4 accent-indigo-600"
                    />
                    {interest}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold">
              6. 좋아하거나 자신 있는 교과{" "}
              <span className="text-red-600">*</span>
            </legend>

            <p className="mb-3 mt-2 text-sm text-slate-500">
              하나 이상 선택해 주세요.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SUBJECTS.map((subject) => {
                const checked =
                  form.favoriteSubjects.includes(subject);

                return (
                  <label
                    key={subject}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                      checked
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                        : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggle("favoriteSubjects", subject)
                      }
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="description"
              className="mb-3 block text-lg font-bold"
            >
              7. 관심 활동이나 탐구 주제
            </label>

            <p
              id="description-help"
              className="mb-3 text-sm leading-relaxed text-slate-500"
            >
              관심 있는 내용을 긍정문으로 적어 주세요.
              단순 키워드 방식이므로 부정 표현은 정확히 해석하지
              못할 수 있습니다. 이름·연락처 등 개인정보는
              입력하지 마세요.
            </p>

            <textarea
              id="description"
              rows={5}
              maxLength={1000}
              value={form.description}
              onChange={(event) =>
                update("description", event.target.value)
              }
              aria-describedby="description-help"
              placeholder="예: 코딩과 데이터 분석이 재미있고 인공지능을 배워보고 싶어요."
              className={`${INPUT_CLASS} resize-y`}
            />

            <p className="mt-2 text-right text-xs text-slate-500">
              {form.description.length} / 1,000자
            </p>
          </div>

          <div
            className={`rounded-xl p-4 text-sm leading-relaxed ${
              sciencePolicy
                ? "bg-blue-50 text-blue-900"
                : "bg-slate-50 text-slate-700"
            }`}
          >
            <p className="font-bold">
              {sciencePolicy
                ? "자연·공학 집중 설계가 적용됩니다."
                : "일반 탐색 설계가 적용됩니다."}
            </p>

            <p className="mt-2">
              {sciencePolicy
                ? "사회·과학 혼합 탐구 선택군에서는 과학·정보만 선택합니다. 예술·외국어·교양 선택군은 유지합니다."
                : "진로에 따른 과목 제한 없이 선택군 조건 안에서 추천합니다."}
            </p>

            <p className="mt-2">
              서비스 내부 정책이며 대학의 공통 필수 이수
              조건은 아닙니다.
            </p>
          </div>

          {hasSavedSurvey && (
            <p className="rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              설문 기준을 변경해 제출하면 새 추천이 생성되며,
              정상 생성된 뒤 기존 계획을 교체합니다.
              기준이 같으면 기존 선택을 유지합니다.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <p className="text-xs leading-relaxed text-slate-500">
              이 코드에서는 설문과 계획을 서버에 전송하지 않고
              현재 탭의 sessionStorage에 저장합니다.
              같은 탭에서 이동하거나 새로고침해도 유지됩니다.
              탭을 닫으면 일반적으로 삭제되지만 브라우저의 세션
              복원에 따라 남을 수 있습니다. 공용 기기에서는
              사용 후 저장 데이터를 삭제하세요.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting
                ? "커리큘럼으로 이동 중…"
                : "학기별 커리큘럼 추천받기"}
            </button>

            {hasSavedSurvey && (
              <button
                type="button"
                onClick={clearSavedData}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                저장된 설문·커리큘럼 삭제
              </button>
            )}
          </div>
        </form>

        <footer className="text-center text-xs leading-relaxed text-slate-500">
          규칙 기반 추천 시범 버전 · 실제 개설 과목과 대학별
          권장 과목은 별도 확인이 필요합니다.
        </footer>
      </main>
    </div>
  );
}