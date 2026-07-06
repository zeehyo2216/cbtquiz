"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckSquare, Square, Play, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ExamItem {
  id: string;
  date: string;
  title: string;
  _count: {
    questions: number;
  };
}

interface RandomExamSelectorProps {
  exams: ExamItem[];
}

export default function RandomExamSelector({ exams }: RandomExamSelectorProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(exams.map(e => e.id));

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === exams.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(exams.map(e => e.id));
    }
  };

  const handleStart = () => {
    if (selectedIds.length === 0) return;
    router.push(`/solve/random?exams=${selectedIds.join(",")}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-slate-100">
      {/* Header */}
      <header className="px-5 py-4 border-b border-[#1e293b]/50 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <Link href="/" className="text-slate-400 hover:text-white flex items-center space-x-1 text-xs">
          <ArrowLeft className="h-4 w-4" />
          <span>홈</span>
        </Link>
        <h1 className="text-sm font-bold text-slate-100">무작위 60문항 설정</h1>
        <div className="w-8"></div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 pb-24 max-w-md mx-auto w-full space-y-6">
        <Card className="bg-[#1e293b]/20 border-[#1e293b]/80 rounded-2xl overflow-hidden shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              문제 출제 범위 선택
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              무작위로 풀이할 기출 시험 회차를 1개 이상 선택해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exams.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-slate-600" />
                <span>등록된 기출문제가 없습니다.</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-2 border-b border-[#1e293b]/40">
                  <span className="text-xs text-slate-400 font-medium">선택된 범위: {selectedIds.length} / {exams.length} 회차</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 px-2 rounded-lg"
                  >
                    {selectedIds.length === exams.length ? "전체 해제" : "전체 선택"}
                  </Button>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 divide-y divide-[#1e293b]/20">
                  {exams.map((exam) => {
                    const isChecked = selectedIds.includes(exam.id);
                    return (
                      <div
                        key={exam.id}
                        onClick={() => handleToggle(exam.id)}
                        className="flex items-center justify-between py-3 cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          {isChecked ? (
                            <CheckSquare className="h-4.5 w-4.5 text-indigo-500 fill-indigo-500/10" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-slate-500 group-hover:text-slate-400" />
                          )}
                          <div>
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors duration-150">
                              {exam.title}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">날짜: {exam.date} • {exam._count.questions}문항</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      {exams.length > 0 && (
        <div className="max-w-md mx-auto w-full border-t border-[#1e293b]/60 bg-[#0f172a]/95 backdrop-blur-md px-5 py-4 absolute bottom-0 left-0 right-0 z-40 shadow-2xl">
          <Button
            onClick={handleStart}
            disabled={selectedIds.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4 fill-current ml-0.5" />
            <span>무작위 60문항 풀기 시작</span>
          </Button>
        </div>
      )}
    </div>
  );
}
