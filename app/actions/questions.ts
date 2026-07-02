"use server"

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

export interface QuestionInput {
  number: number;
  content: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: number;
}

export async function registerExam(date: string, password: string, questions: QuestionInput[]) {
  try {
    if (password !== ADMIN_PASSWORD) {
      return { success: false, error: "관리자 비밀번호가 올바르지 않습니다." };
    }

    if (!/^\d{8}$/.test(date)) {
      return { success: false, error: "시험 날짜는 YYYYMMDD 형식의 8자리 숫자여야 합니다." };
    }

    if (questions.length === 0) {
      return { success: false, error: "등록할 문제가 없습니다." };
    }

    // Sort questions by number
    const sortedQuestions = [...questions].sort((a, b) => a.number - b.number);

    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    const title = `${year}년 ${month}월 ${day}일 실시 기출문제`;

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete existing exam if it exists
      const existing = await tx.exam.findUnique({
        where: { date }
      });
      if (existing) {
        await tx.exam.delete({
          where: { id: existing.id }
        });
      }

      // Create new exam
      const exam = await tx.exam.create({
        data: {
          date,
          title,
        }
      });

      // Create questions
      await tx.question.createMany({
        data: sortedQuestions.map((q) => ({
          examId: exam.id,
          number: q.number,
          content: q.content,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          answer: q.answer
        }))
      });
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("registerExam error:", error);
    return { success: false, error: error.message || "서버 오류가 발생했습니다." };
  }
}

export async function getExams() {
  try {
    const exams = await db.exam.findMany({
      orderBy: { date: "desc" },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
    return { success: true, exams };
  } catch (error: any) {
    console.error("getExams error:", error);
    return { success: false, error: error.message || "시험 목록을 가져오지 못했습니다.", exams: [] };
  }
}

export async function getExamDetail(examId: string) {
  try {
    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { number: "asc" }
        }
      }
    });
    if (!exam) {
      return { success: false, error: "시험을 찾을 수 없습니다.", exam: null };
    }
    return { success: true, exam };
  } catch (error: any) {
    console.error("getExamDetail error:", error);
    return { success: false, error: error.message || "시험 상세 정보를 가져오지 못했습니다.", exam: null };
  }
}

export async function getExamByDate(date: string) {
  try {
    const exam = await db.exam.findUnique({
      where: { date },
      include: {
        questions: {
          orderBy: { number: "asc" }
        }
      }
    });
    if (!exam) {
      return { success: false, error: "해당 날짜의 시험을 찾을 수 없습니다.", exam: null };
    }
    return { success: true, exam };
  } catch (error: any) {
    console.error("getExamByDate error:", error);
    return { success: false, error: error.message || "시험 정보를 가져오지 못했습니다.", exam: null };
  }
}

export async function getRandomQuestions(limit = 60) {
  try {
    const allQuestions = await db.question.findMany({
      include: {
        exam: true
      }
    });

    if (allQuestions.length === 0) {
      return { success: false, error: "등록된 문제가 없습니다.", questions: [] };
    }

    // Shuffle questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

    // Re-index them for the UI as 1 to N
    const reindexed = selected.map((q, idx) => ({
      ...q,
      originalNumber: q.number,
      number: idx + 1 // New progressive number for the solving screen
    }));

    return { success: true, questions: reindexed };
  } catch (error: any) {
    console.error("getRandomQuestions error:", error);
    return { success: false, error: error.message || "랜덤 문제를 생성하지 못했습니다.", questions: [] };
  }
}

export async function saveExamHistory(
  examId: string | null,
  isRandom: boolean,
  score: number,
  userAnswers: number[],
  correctAnswers: number[],
  questionIds: string[]
) {
  try {
    const history = await db.examHistory.create({
      data: {
        examId,
        isRandom,
        score,
        userAnswers: JSON.stringify(userAnswers),
        correctAnswers: JSON.stringify(correctAnswers),
        questionIds: JSON.stringify(questionIds)
      }
    });
    return { success: true, historyId: history.id };
  } catch (error: any) {
    console.error("saveExamHistory error:", error);
    return { success: false, error: error.message || "풀이 결과를 저장하지 못했습니다." };
  }
}

export async function getExamHistory(historyId: string) {
  try {
    const history = await db.examHistory.findUnique({
      where: { id: historyId },
      include: {
        exam: true
      }
    });

    if (!history) {
      return { success: false, error: "풀이 기록을 찾을 수 없습니다.", history: null, questions: [] };
    }

    const parsedQuestionIds: string[] = JSON.parse(history.questionIds);

    // Fetch the specific questions in the history
    const questions = await db.question.findMany({
      where: {
        id: { in: parsedQuestionIds }
      },
      include: {
        exam: true
      }
    });

    // Sort questions according to the order of questionIds
    const questionOrderMap = new Map(parsedQuestionIds.map((id, index) => [id, index]));
    const sortedQuestions = [...questions].sort((a, b) => {
      return (questionOrderMap.get(a.id) ?? 0) - (questionOrderMap.get(b.id) ?? 0);
    });

    return {
      success: true,
      history,
      questions: sortedQuestions.map((q, idx) => ({
        ...q,
        originalNumber: q.number,
        number: idx + 1 // progressive numbers 1 to N
      }))
    };
  } catch (error: any) {
    console.error("getExamHistory error:", error);
    return { success: false, error: error.message || "풀이 기록을 불러오지 못했습니다.", history: null, questions: [] };
  }
}

export async function deleteExam(examId: string, password: string) {
  try {
    if (password !== ADMIN_PASSWORD) {
      return { success: false, error: "관리자 비밀번호가 올바르지 않습니다." };
    }

    await db.exam.delete({
      where: { id: examId }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("deleteExam error:", error);
    return { success: false, error: error.message || "시험 삭제 중 오류가 발생했습니다." };
  }
}
