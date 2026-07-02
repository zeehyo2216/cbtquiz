"use client"

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerExam, QuestionInput } from "@/app/actions/questions";
import { sampleQuestions } from "@/lib/sampleQuestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Database, Eye, Lock, RefreshCw, Save } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const [examDate, setExamDate] = useState("20170305");
  const [questions, setQuestions] = useState<QuestionInput[]>(
    Array.from({ length: 60 }, (_, i) => ({
      number: i + 1,
      content: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: 1,
    }))
  );

  const [activeIdx, setActiveIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  const activeQuestion = questions[activeIdx];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === "admin1234") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("비밀번호가 올바르지 않습니다.");
    }
  };

  const updateActiveQuestion = (field: keyof QuestionInput, value: any) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === activeIdx ? { ...q, [field]: value } : q))
    );
  };

  const loadSamples = () => {
    setQuestions(
      sampleQuestions.map((q) => ({
        number: q.number,
        content: q.content,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        answer: q.answer,
      }))
    );
    setSubmitMessage({ type: "info", text: "60개 샘플 기출문제가 로드되었습니다. 날짜를 확인하고 등록하세요." });
  };

  const handleRegister = async () => {
    setIsSubmitting(true);
    setSubmitMessage({ type: "", text: "" });

    // Validate that some questions have contents
    const emptyQuestionsCount = questions.filter(q => !q.content.trim()).length;
    if (emptyQuestionsCount > 0) {
      if (!confirm(`아직 내용이 빈 문항이 ${emptyQuestionsCount}개 존재합니다. 이대로 등록할까요?`)) {
        setIsSubmitting(false);
        return;
      }
    }

    const res = await registerExam(examDate, adminPass, questions);
    setIsSubmitting(false);

    if (res.success) {
      setSubmitMessage({ type: "success", text: "기출문제가 성공적으로 등록되었습니다!" });
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      setSubmitMessage({ type: "error", text: res.error || "등록 도중 오류가 발생했습니다." });
    }
  };

  // Check if a question is filled
  const isQFilled = (q: QuestionInput) => {
    return q.content.trim() !== "" && q.option1.trim() !== "" && q.option2.trim() !== "";
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-[#0f172a]">
        <Link href="/" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center space-x-1.5 text-xs">
          <ArrowLeft className="h-4 w-4" />
          <span>홈으로 돌아가기</span>
        </Link>

        <Card className="w-full max-w-sm bg-[#1e293b]/40 border-[#1e293b] shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold text-white">관리자 패널 접속</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              기출문제를 등록하기 위해 비밀번호를 입력하세요.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="space-y-2">
                <Label htmlFor="password-field" className="text-slate-300 text-xs font-semibold">관리자 비밀번호</Label>
                <Input
                  id="password-field"
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="bg-[#0f172a]/60 border-[#1e293b] text-white focus-visible:ring-indigo-500 text-sm h-11"
                  autoFocus
                />
                {loginError && <p className="text-rose-500 text-[11px] font-medium mt-1">{loginError}</p>}
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-8">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl h-11 shadow-lg shadow-indigo-600/20">
                접속하기
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a]">
      {/* Admin Header */}
      <header className="px-5 py-4 border-b border-[#1e293b]/50 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white flex items-center space-x-1 text-xs">
          <ArrowLeft className="h-4 w-4" />
          <span>홈</span>
        </button>
        <h1 className="text-sm font-bold text-slate-100">기출문제 등록 및 관리</h1>
        <div className="w-8"></div>
      </header>

      {/* Admin Layout */}
      <div className="flex-1 overflow-y-auto px-5 py-6 pb-24 space-y-6">
        {/* Step 1: Exam Info */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Step 1. 시험 정보 설정
          </h3>
          <Card className="bg-[#1e293b]/20 border-[#1e293b]/80 rounded-xl">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="exam-date" className="text-slate-300 text-xs font-medium">시험 날짜 입력</Label>
                <div className="flex gap-2">
                  <Input
                    id="exam-date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    placeholder="예: 20170305 (YYYYMMDD)"
                    className="bg-[#0f172a]/60 border-[#1e293b] text-white focus-visible:ring-indigo-500 text-sm flex-1 h-10"
                  />
                  <Button
                    type="button"
                    onClick={loadSamples}
                    variant="outline"
                    className="border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 text-xs flex items-center gap-1.5 h-10 rounded-xl px-3"
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>샘플 문항 불러오기</span>
                  </Button>
                </div>
                <p className="text-slate-500 text-[10px]">
                  * YYYYMMDD 8자리로 입력 시 &apos;YYYY년 MM월 DD일 실시 기출문제&apos;로 자동 이름이 지정됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Step 2: Questions Editor */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Step 2. 문항 상세 입력 ({questions.filter(isQFilled).length}/60개 작성됨)
            </h3>
          </div>

          {/* Active Question Editor Card */}
          <Card className="bg-[#1e293b]/30 border-[#1e293b]/80 shadow-lg rounded-xl overflow-hidden">
            <div className="bg-[#1e293b]/60 px-4 py-3 border-b border-[#1e293b]/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="h-6 w-6 rounded-md bg-indigo-500 text-white font-bold text-[11px] flex items-center justify-center">
                  Q{activeQuestion.number}
                </span>
                <span className="text-slate-300 text-xs font-semibold">문항 작성기</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  onClick={() => setActiveIdx(prev => Math.max(0, prev - 1))}
                  disabled={activeIdx === 0}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md text-slate-400 hover:bg-[#1e293b]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setActiveIdx(prev => Math.min(59, prev + 1))}
                  disabled={activeIdx === 59}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md text-slate-400 hover:bg-[#1e293b]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={`q-${activeQuestion.number}-desc`} className="text-slate-300 text-xs font-medium">문제 내용</Label>
                <Textarea
                  id={`q-${activeQuestion.number}-desc`}
                  value={activeQuestion.content}
                  onChange={(e) => updateActiveQuestion("content", e.target.value)}
                  placeholder={`Q${activeQuestion.number}의 질문 내용을 작성해 주세요.`}
                  className="bg-[#0f172a]/60 border-[#1e293b] text-white focus-visible:ring-indigo-500 text-xs h-20"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {[1, 2, 3, 4].map((optNum) => {
                  const field = `option${optNum}` as keyof QuestionInput;
                  return (
                    <div key={optNum} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Label htmlFor={`q-${activeQuestion.number}-opt${optNum}`} className="text-slate-400 text-[11px] font-medium">선택지 {optNum}번</Label>
                        <button
                          type="button"
                          onClick={() => updateActiveQuestion("answer", optNum)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${activeQuestion.answer === optNum
                              ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"
                              : "bg-[#0f172a]/50 text-slate-500 hover:text-slate-300 border border-[#1e293b]/40"
                            }`}
                        >
                          {activeQuestion.answer === optNum ? "정답 선택됨" : "정답으로 지정"}
                        </button>
                      </div>
                      <Input
                        id={`q-${activeQuestion.number}-opt${optNum}`}
                        value={activeQuestion[field] as string}
                        onChange={(e) => updateActiveQuestion(field, e.target.value)}
                        placeholder={`${optNum}번 선택지 내용`}
                        className={`bg-[#0f172a]/60 border-[#1e293b] text-white focus-visible:ring-indigo-500 text-xs h-9 ${activeQuestion.answer === optNum ? "border-emerald-500/40 ring-1 ring-emerald-500/20" : ""
                          }`}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Questions Grid Map */}
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs font-semibold">문항 탐색 맵 (1 ~ 60)</Label>
            <div className="grid grid-cols-10 gap-1.5 p-3.5 bg-[#1e293b]/10 border border-[#1e293b]/50 rounded-xl">
              {questions.map((q, idx) => {
                const isFilled = isQFilled(q);
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={q.number}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`h-7 rounded text-[10px] font-bold transition-all duration-150 flex items-center justify-center ${isActive
                        ? "bg-indigo-500 text-white ring-2 ring-indigo-500/45 scale-105"
                        : isFilled
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-[#1e293b]/30 text-slate-500 border border-[#1e293b]/50"
                      }`}
                  >
                    {q.number}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Submit Alerts */}
        {submitMessage.text && (
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${submitMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : submitMessage.type === "error"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
              }`}
          >
            {submitMessage.text}
          </div>
        )}
      </div>

      {/* Floating Save Actions Bar */}
      <div className="max-w-md w-full border-t border-[#1e293b]/60 bg-[#0f172a]/95 backdrop-blur-md px-5 py-4 flex gap-3 absolute bottom-0 z-40 shadow-2xl">
        <Button
          type="button"
          onClick={handleRegister}
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>시험 문제 등록 중...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>기출문제 정식 등록하기</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
