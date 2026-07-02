import { getRandomQuestions } from "@/app/actions/questions";
import CbtSolver from "@/components/CbtSolver";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SolveRandomPage() {
  const { success, questions, error } = await getRandomQuestions(60);

  if (!success || questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-[#0f172a] text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">랜덤 모의고사를 시작할 수 없습니다.</h2>
        <p className="text-slate-400 text-xs mb-6">
          {error || "데이터베이스에 등록된 문제가 없습니다. 먼저 기출문제를 등록해 주세요."}
        </p>
        <Link href="/admin" passHref>
          <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-5 text-xs h-10 font-bold">
            문제 등록하러 가기
          </Button>
        </Link>
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
