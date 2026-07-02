"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveExamHistory } from "@/app/actions/questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Grid, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

export interface QuestionData {
  id: string;
  examId: string;
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

interface CbtSolverProps {
  questions: QuestionData[];
  examId: string | null;
  isRandom: boolean;
  examTitle: string;
}

export default function CbtSolver({ questions, examId, isRandom, examTitle }: CbtSolverProps) {
  const router = useRouter();
  
  // Maps question index (0 to N-1) to chosen answer (1 to 4)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  // Handle selecting an answer
  const handleSelectAnswer = (optionNum: number) => {
    setAnswers((prev) => ({
      ...prev,
      [activeIdx]: optionNum,
    }));

    // Auto-advance to the next question after a short delay for smooth UX
    if (activeIdx < totalQuestions - 1) {
      setTimeout(() => {
        setActiveIdx((prev) => prev + 1);
      }, 250);
    }
  };

  // Submit test and calculate score
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    let correctCount = 0;
    const userAnswersList: number[] = [];
    const correctAnswersList: number[] = [];
    const questionIdsList: string[] = [];

    questions.forEach((q, idx) => {
      const userAnswer = answers[idx] || 0; // 0 if unanswered
      const correctAnswer = q.answer;
      userAnswersList.push(userAnswer);
      correctAnswersList.push(correctAnswer);
      questionIdsList.push(q.id);

      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);

    const res = await saveExamHistory(
      examId,
      isRandom,
      score,
      userAnswersList,
      correctAnswersList,
      questionIdsList
    );

    setIsSubmitting(false);
    setShowConfirmSubmit(false);

    if (res.success && res.historyId) {
      router.push(`/result/${res.historyId}`);
    } else {
      alert(res.error || "시험 결과를 제출하는 데 실패했습니다.");
    }
  };

  const activeQuestion = questions[activeIdx];

  if (totalQuestions === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-[#0f172a] text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">풀이할 문제가 없습니다.</h2>
        <p className="text-slate-400 text-xs mb-6">등록된 문제가 비어 있거나 불러오지 못했습니다.</p>
        <Button onClick={() => router.push("/")} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-5 text-xs h-10 font-bold">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] overflow-hidden">
      {/* Header */}
      <header className="px-5 py-4 border-b border-[#1e293b]/50 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white flex items-center space-x-1 text-xs">
          <ArrowLeft className="h-4 w-4" />
          <span>중단</span>
        </button>
        <div className="text-center flex-1 max-w-[200px]">
          <h1 className="text-xs font-bold text-slate-100 truncate">{examTitle}</h1>
          <p className="text-[10px] text-indigo-400 font-semibold tracking-wider mt-0.5 uppercase">
            {isRandom ? "Random Mock Test" : "CBT Practice"}
          </p>
        </div>
        <Button
          onClick={() => setShowAnswerSheet(true)}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#1e293b]/40 rounded-xl"
        >
          <Grid className="h-4 w-4" />
        </Button>
      </header>

      {/* Progress Tracker */}
      <div className="px-5 pt-4 pb-2 bg-[#0f172a] space-y-2 border-b border-[#1e293b]/30">
        <div className="flex justify-between items-center text-[10px] font-bold tracking-wider">
          <span className="text-slate-400">진행도: {answeredCount} / {totalQuestions} 문항</span>
          <span className="text-indigo-400">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-1.5 bg-[#1e293b] [&>div]:bg-indigo-500 rounded-full" />
      </div>

      {/* Sliding Questions Container */}
      <div className="flex-1 flex flex-col justify-center items-center py-6 overflow-hidden">
        <div className="w-full overflow-hidden relative">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(-${activeIdx * (100 / totalQuestions)}%, 0, 0)`,
              width: `${totalQuestions * 100}%`,
            }}
          >
            {questions.map((q, idx) => {
              const selectedAnswer = answers[idx];
              
              return (
                <div
                  key={q.id}
                  style={{ width: `${100 / totalQuestions}%` }}
                  className="px-5 shrink-0 flex flex-col justify-center"
                >
                  <Card className="bg-[#1e293b]/20 border-[#1e293b]/60 shadow-xl rounded-2xl overflow-hidden min-h-[420px] flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-6">
                      {/* Question Number and content */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Q. {q.number} / {totalQuestions}
                          </span>
                          {q.exam && (
                            <span className="text-[9px] text-indigo-400/80 font-bold bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                              {isRandom ? `${q.exam.date}-Q${q.originalNumber || q.number}` : q.exam.date}
                            </span>
                          )}
                        </div>
                        <h2 className="text-sm font-bold text-slate-100 leading-relaxed break-all">
                          {isRandom ? q.content.replace(/^\[문제\s*\d+\]\s*/, "") : q.content}
                        </h2>
                      </div>

                      {/* Options List */}
                      <div className="space-y-2.5 mt-auto">
                        {[
                          { num: 1, text: q.option1 },
                          { num: 2, text: q.option2 },
                          { num: 3, text: q.option3 },
                          { num: 4, text: q.option4 },
                        ].map((opt) => (
                          <button
                            key={opt.num}
                            onClick={() => handleSelectAnswer(opt.num)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all duration-200 flex items-start space-x-3 ${
                              selectedAnswer === opt.num
                                ? "bg-indigo-500/15 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30 scale-[1.01]"
                                : "bg-[#1e293b]/40 border-[#1e293b]/60 text-slate-300 hover:bg-[#1e293b]/60 hover:text-slate-100 hover:border-indigo-500/20"
                            }`}
                          >
                            <span className={`h-5 w-5 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors ${
                              selectedAnswer === opt.num
                                ? "bg-indigo-500 text-white"
                                : "bg-[#0f172a] text-slate-400 border border-[#1e293b]"
                            }`}>
                              {opt.num}
                            </span>
                            <span className="leading-snug break-all">{opt.text}</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <footer className="px-5 py-4 border-t border-[#1e293b]/40 bg-[#0f172a]/95 backdrop-blur-md flex items-center justify-between gap-3 sticky bottom-0 z-30 shadow-2xl">
        <Button
          onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
          disabled={activeIdx === 0}
          variant="outline"
          className="flex-1 border-[#1e293b]/80 bg-[#1e293b]/10 text-slate-400 hover:bg-[#1e293b]/30 rounded-xl h-11 text-xs font-bold gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>이전</span>
        </Button>

        {activeIdx === totalQuestions - 1 ? (
          <Button
            onClick={() => setShowConfirmSubmit(true)}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl h-11 text-xs shadow-lg shadow-indigo-600/10"
          >
            제출 및 채점
          </Button>
        ) : (
          <Button
            onClick={() => setActiveIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
            variant="outline"
            className="flex-1 border-[#1e293b]/80 bg-[#1e293b]/10 text-slate-400 hover:bg-[#1e293b]/30 rounded-xl h-11 text-xs font-bold gap-1"
          >
            <span>다음</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </footer>

      {/* Dialog 1: Answer Board sheet */}
      <Dialog open={showAnswerSheet} onOpenChange={setShowAnswerSheet}>
        <DialogContent className="bg-[#0f172a] border-[#1e293b] text-slate-100 rounded-2xl max-w-sm w-[90%] p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-white">답안 상황판</DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px]">
              각 문항을 선택하면 해당 문제로 즉시 이동합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-2.5 max-h-[250px] overflow-y-auto py-2 pr-1">
            {questions.map((q, idx) => {
              const selectedAnswer = answers[idx];
              const isActive = idx === activeIdx;

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveIdx(idx);
                    setShowAnswerSheet(false);
                  }}
                  className={`h-9 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                    isActive
                      ? "bg-indigo-500 border-indigo-400 text-white"
                      : selectedAnswer
                      ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                      : "bg-[#1e293b]/20 border-[#1e293b]/50 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className="text-[10px]">{q.number}</span>
                  {selectedAnswer && (
                    <span className="text-[8px] opacity-75 mt-0.5">({selectedAnswer}번)</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-[#1e293b]/40">
            <span className="text-[10px] text-slate-400">남은 문제: {totalQuestions - answeredCount}개</span>
            <Button
              onClick={() => {
                setShowAnswerSheet(false);
                setShowConfirmSubmit(true);
              }}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[10px] px-3.5 h-8 font-bold"
            >
              지금 제출하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Submit Confirm Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent className="bg-[#0f172a] border-[#1e293b] text-slate-100 rounded-2xl max-w-xs w-[85%] p-5 text-center">
          <DialogHeader className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-sm font-bold text-white">시험지를 제출하시겠습니까?</DialogTitle>
            <DialogDescription className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
              {totalQuestions - answeredCount > 0 ? (
                <span className="text-rose-400 font-medium">풀지 않은 문제가 {totalQuestions - answeredCount}개 있습니다.<br /></span>
              ) : null}
              제출하시면 채점이 진행되고 결과를 즉시 확인하실 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2.5 pt-4">
            <Button
              onClick={() => setShowConfirmSubmit(false)}
              variant="outline"
              disabled={isSubmitting}
              className="flex-1 border-[#1e293b] text-slate-400 bg-transparent hover:bg-[#1e293b]/30 rounded-xl h-10 text-xs font-bold"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-10 text-xs font-bold"
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "제출하기"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
