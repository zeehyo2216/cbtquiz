"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Check, Home, Download, AlertCircle, RefreshCw, X, ChevronDown, ChevronUp } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface QuestionResult {
  id: string;
  number: number;
  content: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: number;
  originalNumber?: number;
  exam?: {
    title: string;
    date: string;
  } | null;
}

interface ResultDetailProps {
  history: {
    id: string;
    examId: string | null;
    isRandom: boolean;
    score: number;
    userAnswers: string; // JSON string of number[]
    correctAnswers: string; // JSON string of number[]
    createdAt: Date;
    exam?: {
      title: string;
      date: string;
    } | null;
  };
  questions: QuestionResult[];
}

export default function ResultDetail({ history, questions }: ResultDetailProps) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const userAnswersList: number[] = JSON.parse(history.userAnswers);
  const correctAnswersList: number[] = JSON.parse(history.correctAnswers);

  const totalQuestions = questions.length;
  const score = history.score;
  const isPassed = score >= 60; // 60 points or above is passing

  const correctCount = questions.filter(
    (_, idx) => userAnswersList[idx] === correctAnswersList[idx]
  ).length;
  const wrongCount = totalQuestions - correctCount;

  const toggleExpand = (num: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [num]: !prev[num],
    }));
  };

  const handleExportPdf = async () => {
    setIsExporting(true);

    try {
      // Temporarily expand all questions for clean PDF capture
      const originalExpanded = { ...expandedQuestions };
      const allExpanded: Record<number, boolean> = {};
      questions.forEach((q) => {
        allExpanded[q.number] = true;
      });
      setExpandedQuestions(allExpanded);

      // Wait a tick for DOM to render expanded content
      await new Promise((resolve) => setTimeout(resolve, 300));

      const element = document.getElementById("pdf-report");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#0f172a", // Match background
        logging: false,
      });

      // Restore original expanded states
      setExpandedQuestions(originalExpanded);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Multi-page handling
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`CBT_성적표_${history.isRandom ? "랜덤" : history.exam?.date || "기출"}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("PDF를 내보내는 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] pb-24">
      {/* Header */}
      <header className="px-5 py-4 border-b border-[#1e293b]/50 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white flex items-center space-x-1 text-xs">
          <Home className="h-4 w-4" />
          <span>홈으로</span>
        </button>
        <h1 className="text-sm font-bold text-slate-100">CBT 성적 리포트</h1>
        <div className="w-8"></div>
      </header>

      {/* Main Container to be captured by PDF */}
      <div id="pdf-report" className="flex-1 px-5 py-6 space-y-6 bg-[#0f172a]">
        
        {/* Exam Title Block in PDF */}
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-white">
            {history.isRandom ? "무작위 60문항 랜덤 모의고사" : history.exam?.title}
          </h2>
          <p className="text-[10px] text-slate-400">
            풀이 일시: {new Date(history.createdAt).toLocaleString("ko-KR")}
          </p>
        </div>

        {/* Score Ring Summary */}
        <Card className="bg-[#1e293b]/20 border-[#1e293b]/60 shadow-xl rounded-2xl overflow-hidden p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            
            {/* Score Ring */}
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#1e293b]"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-1000 ${
                    isPassed ? "stroke-emerald-500" : "stroke-rose-500"
                  }`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center space-y-0.5">
                <span className="font-heading text-3xl font-extrabold text-white">{score}</span>
                <span className="text-xs text-slate-400 block">점</span>
              </div>
            </div>

            {/* Pass/Fail Status Banner */}
            <div className="text-center">
              <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-bold ${
                isPassed 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}>
                {isPassed ? "최종 합격 (PASS)" : "최종 불합격 (FAIL)"}
              </span>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">
                * 합격 기준: 60점 이상 (60문항 중 36문항 이상 정답)
              </p>
            </div>

            {/* Sub Stats Grid */}
            <div className="grid grid-cols-2 w-full gap-4 pt-4 border-t border-[#1e293b]/40">
              <div className="text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">정답 문항</span>
                <span className="text-sm font-bold text-emerald-400">{correctCount} / {totalQuestions}</span>
              </div>
              <div className="text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">오답 문항</span>
                <span className="text-sm font-bold text-rose-400">{wrongCount} / {totalQuestions}</span>
              </div>
            </div>

          </div>
        </Card>

        {/* Detailed Question Answers */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            상세 문항 피드백
          </h3>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const userAnswer = userAnswersList[idx] || 0;
              const correctAnswer = q.answer;
              const isCorrect = userAnswer === correctAnswer;
              const isExpanded = expandedQuestions[q.number] || false;

              return (
                <Card 
                  key={q.id} 
                  className={`bg-[#1e293b]/15 border-[#1e293b]/60 transition-all rounded-xl overflow-hidden`}
                >
                  {/* Collapsed Header */}
                  <div 
                    onClick={() => toggleExpand(q.number)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1e293b]/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <span className={`h-6 w-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${
                        isCorrect 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {q.number}
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-200 truncate pr-4">
                          {history.isRandom ? q.content.replace(/^\[문제\s*\d+\]\s*/, "") : q.content}
                        </p>
                        {history.isRandom && q.exam && (
                          <span className="text-[8px] text-indigo-400/80 font-bold mt-0.5">
                            출처: {q.exam.date}-Q{q.originalNumber || q.number}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {isCorrect ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> 맞힘
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded-full border border-rose-500/10 flex items-center gap-0.5">
                          <X className="h-3 w-3" /> 틀림
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#1e293b]/40 space-y-4 bg-[#1e293b]/10 animate-in fade-in slide-in-from-top-1 duration-200">
                      {/* Full question content */}
                      <div className="space-y-1">
                        <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                          {history.isRandom ? q.content.replace(/^\[문제\s*\d+\]\s*/, "") : q.content}
                        </p>
                        {history.isRandom && q.exam && (
                          <p className="text-[9px] text-indigo-400/90 font-bold">
                            출처: {q.exam.date}-Q{q.originalNumber || q.number}
                          </p>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {[
                          { num: 1, text: q.option1 },
                          { num: 2, text: q.option2 },
                          { num: 3, text: q.option3 },
                          { num: 4, text: q.option4 },
                        ].map((opt) => {
                          const isUserPicked = userAnswer === opt.num;
                          const isCorrectOpt = correctAnswer === opt.num;
                          
                          let badgeStyles = "bg-[#0f172a]/40 border-[#1e293b]/60 text-slate-400";
                          if (isCorrectOpt) {
                            badgeStyles = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold";
                          } else if (isUserPicked && !isCorrectOpt) {
                            badgeStyles = "bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold";
                          }

                          return (
                            <div
                              key={opt.num}
                              className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start space-x-3.5 ${badgeStyles}`}
                            >
                              <span className={`h-4.5 w-4.5 shrink-0 rounded flex items-center justify-center text-[9px] font-bold border ${
                                isCorrectOpt 
                                  ? "bg-emerald-500 border-emerald-400 text-white" 
                                  : isUserPicked
                                  ? "bg-rose-500 border-rose-400 text-white"
                                  : "bg-[#0f172a] border-[#1e293b] text-slate-400"
                              }`}>
                                {opt.num}
                              </span>
                              <span className="break-all">{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary callout */}
                      <div className="p-3 bg-[#0f172a]/60 border border-[#1e293b]/50 rounded-xl text-[10px] flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">내 선택 답안: <span className={isCorrect ? "text-emerald-400" : "text-rose-400 font-bold"}>{userAnswer === 0 ? "없음" : `${userAnswer}번`}</span></span>
                        <span className="text-emerald-400 font-bold">실제 정답: {correctAnswer}번</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

      </div>

      {/* Floating Action footer in screen (hidden in print) */}
      <footer className="max-w-md w-full border-t border-[#1e293b]/60 bg-[#0f172a]/95 backdrop-blur-md px-5 py-4 flex gap-3 absolute bottom-0 z-40 shadow-2xl">
        <Button
          type="button"
          onClick={() => router.push("/")}
          className="flex-1 border-[#1e293b] bg-[#1e293b]/30 text-slate-300 hover:bg-[#1e293b]/60 rounded-xl h-11 text-xs font-bold"
        >
          홈으로 가기
        </Button>
        <Button
          type="button"
          onClick={handleExportPdf}
          disabled={isExporting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-11 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
        >
          {isExporting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>PDF 생성 중...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>PDF 결과 저장하기</span>
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
