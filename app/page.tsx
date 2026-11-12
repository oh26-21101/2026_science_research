'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, BarChart3, Users } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  const handleBackgroundClick = () => {
    if (adminClickCount >= 19) {
      setShowPasswordPrompt(true);
      setAdminClickCount(0);
    } else {
      setAdminClickCount((prev) => prev + 1);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
      onClick={handleBackgroundClick}
    >
      {/* 네비게이션 */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />

            <h1 className="text-2xl font-bold text-indigo-600">
              오현고 선택과목
            </h1>
          </div>

          <span className="text-sm text-gray-600">
            관리자 접근: {adminClickCount}/20
          </span>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold leading-tight text-gray-800 md:text-5xl">
            나에게 맞는 선택과목,
            <br />
            진로에서 시작하다
          </h2>

          <p className="mb-8 text-lg text-gray-600 md:text-xl">
            나의 관심과 진학 목표, 교육과정 정보를 바탕으로 선택과목을
            탐색해 보세요.
          </p>

          <div className="flex justify-center">
            <Link
              href="/survey"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-indigo-700"
            >
              선택과목 추천 시작하기
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* 서비스 소개 */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-8 shadow-lg transition hover:shadow-xl">
            <BookOpen className="mb-4 h-12 w-12 text-indigo-600" />

            <h3 className="mb-2 text-xl font-bold text-gray-800">
              2022 개정 교육과정
            </h3>

            <p className="text-gray-600">
              최신 교육과정 기반 정확한 추천
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-lg transition hover:shadow-xl">
            <BarChart3 className="mb-4 h-12 w-12 text-indigo-600" />

            <h3 className="mb-2 text-xl font-bold text-gray-800">
              세 가지 추천 방식
            </h3>

            <p className="text-gray-600">
              KNN, SBERT, 하이브리드 비교 분석
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-lg transition hover:shadow-xl">
            <Users className="mb-4 h-12 w-12 text-indigo-600" />

            <h3 className="mb-2 text-xl font-bold text-gray-800">
              선배 데이터 활용
            </h3>

            <p className="text-gray-600">
              실제 입시 사례와의 비교 분석
            </p>
          </div>
        </div>
      </main>

      {/* 20번 클릭 시 표시되는 안내창 */}
      {showPasswordPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(event) => {
            event.stopPropagation();
            setShowPasswordPrompt(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-dialog-title"
            aria-describedby="admin-dialog-description"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="admin-dialog-title"
              className="mb-3 text-xl font-bold text-gray-800"
            >
              관리자 접근 안내
            </h2>

            <p
              id="admin-dialog-description"
              className="mb-6 text-sm leading-relaxed text-gray-600"
            >
              관리자 비밀번호 인증 기능은 아직 구현되지 않았습니다.
              현재는 안내창만 표시됩니다.
            </p>

            <button
              type="button"
              autoFocus
              onClick={() => setShowPasswordPrompt(false)}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}