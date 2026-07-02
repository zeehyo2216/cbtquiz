import { getExamByDate } from "@/app/actions/questions";
import CbtSolver from "@/components/CbtSolver";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ date: string }>;
}

export const dynamic = "force-dynamic";

export default async function SolveExamPage({ params }: PageProps) {
  const { date } = await params;
  const { success, exam } = await getExamByDate(date);

  if (!success || !exam) {
    notFound();
  }

  return (
    <CbtSolver
      questions={exam.questions}
      examId={exam.id}
      isRandom={false}
      examTitle={exam.title}
    />
  );
}
