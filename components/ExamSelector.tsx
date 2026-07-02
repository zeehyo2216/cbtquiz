"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, Play } from "lucide-react";

interface ExamItem {
  id: string;
  date: string;
  title: string;
  _count: {
    questions: number;
  };
}

interface ExamSelectorProps {
  exams: ExamItem[];
}

export default function ExamSelector({ exams }: ExamSelectorProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");

  const handleStart = () => {
    if (!selectedDate) return;
    router.push(`/solve/${selectedDate}`);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-[#1e293b]/40 border border-[#1e293b]/80 hover:border-indigo-500/30 text-slate-200 text-xs font-semibold rounded-xl h-11 px-4 appearance-none outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-200"
        >
          <option value="" className="bg-[#0f172a] text-slate-400">
            기출 회차를 선택하세요
          </option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.date} className="bg-[#0f172a] text-slate-200">
              {exam.title} ({exam._count.questions}문항)
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <Calendar className="h-4 w-4" />
        </div>
      </div>
      <Button
        onClick={handleStart}
        disabled={!selectedDate}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-11 rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play className="h-4 w-4 fill-current ml-0.5" />
        <span>선택한 기출문제 풀기</span>
      </Button>
    </div>
  );
}
