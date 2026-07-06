import { getRandomQuestions, getExams } from "@/app/actions/questions";
import CbtSolver from "@/components/CbtSolver";
import RandomExamSelector from "@/components/RandomExamSelector";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ exams?: string }>;
}

export default async function SolveRandomPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const examsParam = resolvedParams.exams;

  if (!examsParam) {
    const { exams = [] } = await getExams();
    return <RandomExamSelector exams={exams} />;
  }

  const examIds = examsParam.split(",");
  const { success, questions, error } = await getRandomQuestions(60, examIds);

  if (!success || questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-[#0f172a] text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">랜덤 모의고사를 시작할 수 없습니다.</h2>
        <p className="text-slate-400 text-xs mb-6">
          {error || "선택한 기출문제 범위에 등록된 문항이 없습니다. 먼저 문항을 등록해 주세요."}
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/solve/random" passHref>
            <Button variant="outline" className="border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 rounded-xl px-5 text-xs h-10 font-bold">
              범위 다시 선택
            </Button>
          </Link>
          <Link href="/admin" passHref>
            <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-5 text-xs h-10 font-bold">
              문제 등록하러 가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CbtSolver
      questions={questions}
      examId={null}
      isRandom={true}
      examTitle="무작위 60문항 랜덤 모의고사"
    />
  );
}
