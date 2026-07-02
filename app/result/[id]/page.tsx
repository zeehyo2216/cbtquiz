import { getExamHistory } from "@/app/actions/questions";
import ResultDetail from "@/components/ResultDetail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  const { success, history, questions } = await getExamHistory(id);

  if (!success || !history) {
    notFound();
  }

  // Safe mapping to resolve serializability across RSC boundaries
  const serializedHistory = {
    id: history.id,
    examId: history.examId,
    isRandom: history.isRandom,
    score: history.score,
    userAnswers: history.userAnswers,
    correctAnswers: history.correctAnswers,
    createdAt: new Date(history.createdAt),
    exam: history.exam ? {
      title: history.exam.title,
      date: history.exam.date
    } : null
  };

  // Convert questions structure to match client expect type
  const serializedQuestions = questions.map(q => ({
    id: q.id,
    number: q.number,
    content: q.content,
    option1: q.option1,
    option2: q.option2,
    option3: q.option3,
    option4: q.option4,
    answer: q.answer,
    originalNumber: (q as any).originalNumber,
    exam: q.exam ? {
      title: q.exam.title,
      date: q.exam.date
    } : null
  }));

  return (
    <ResultDetail
      history={serializedHistory}
      questions={serializedQuestions}
    />
  );
}
