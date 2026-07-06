import Link from "next/link";
import { getExams } from "@/app/actions/questions";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, HelpCircle, Play, Sparkles, PlusCircle, ChevronRight } from "lucide-react";
import ExamSelector from "@/components/ExamSelector";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { exams = [] } = await getExams();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Header */}
      <header className="px-6 pt-8 pb-6 border-b border-[#1e293b]/50 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent">
                CBT
              </h1>
              <p className="text-[10px] text-indigo-400 font-medium tracking-widest uppercase">
                모의고사 풀기
              </p>
            </div>
          </div>
          {/* Admin icon removed from header */}
        </div>
      </header>

      {/* Main Content Scroll Area */}
      <div className="flex-1 px-6 py-6 overflow-y-auto space-y-8 pb-20">
        {/* Banner Card */}
        {/* <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900/60 to-violet-950/60 border border-indigo-500/20 p-6 space-y-4 shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-32 w-32 text-indigo-400" />
          </div>
          <div className="space-y-1 relative z-10">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
              Premium Practice
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              모바일에 최적화된 기출 해설
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              슬라이딩 카드로 가볍고 빠르게 문제를 풀고, 상세한 채점 결과를 한눈에 확인하고 PDF로 보관하세요.
            </p>
          </div>
        </div> */}

        {/* Random Exam Trigger */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            빠른 문제 풀이
          </h3>
          <Link href="/solve/random" className="block group">
            <Card className="bg-[#1e293b]/30 hover:bg-[#1e293b]/60 border-[#1e293b]/80 hover:border-indigo-500/50 transition-all duration-300 shadow-lg rounded-2xl overflow-hidden cursor-pointer">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/15 group-hover:scale-105 transition-transform duration-300">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors duration-200 text-sm">
                      무작위 60문항 풀기
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      기출 회차와 관계없이 전체 문제 중 무작위 출제
                    </p>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-[#1e293b]/50 group-hover:bg-indigo-500/20 flex items-center justify-center text-slate-400 group-hover:text-indigo-300 transition-colors duration-200">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Exam Dates List */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            기출 회차 선택
          </h3>
          {exams.length === 0 ? (
            <Card className="bg-[#1e293b]/20 border-dashed border-[#1e293b]/80 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <HelpCircle className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm font-medium">등록된 기출문제가 없습니다.</p>
              <p className="text-slate-500 text-[11px] mt-1">아래의 &apos;새로운 기출문제 등록하기&apos;를 눌러 시험을 등록하세요.</p>
            </Card>
          ) : (
            <ExamSelector exams={exams} />
          )}
        </section>

        {/* Admin Trigger Section */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            시험 데이터 관리
          </h3>
          <Link href="/admin" className="block group">
            <Card className="bg-[#1e293b]/30 hover:bg-[#1e293b]/60 border-[#1e293b]/80 hover:border-indigo-500/50 transition-all duration-300 shadow-lg rounded-2xl overflow-hidden cursor-pointer">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/15 group-hover:scale-105 transition-transform duration-300">
                    <PlusCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors duration-200 text-sm">
                      새로운 기출문제 등록하기
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      시험 날짜별 문제 및 정답 등록 (관리자 암호 필요)
                    </p>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-[#1e293b]/50 group-hover:bg-indigo-500/20 flex items-center justify-center text-slate-400 group-hover:text-indigo-300 transition-colors duration-200">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>
      </div>

      {/* Footer copyright */}
      <footer className="text-center py-4 border-t border-[#1e293b]/40 text-[10px] text-slate-600 bg-[#0f172a] absolute bottom-0 left-0 right-0">
        &copy; {new Date().getFullYear()} Smart CBT mock exam. All rights reserved.
      </footer>
    </div>
  );
}
