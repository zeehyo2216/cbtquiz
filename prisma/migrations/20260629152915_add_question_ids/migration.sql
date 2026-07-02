/*
  Warnings:

  - Added the required column `questionIds` to the `ExamHistory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExamHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT,
    "isRandom" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL,
    "userAnswers" TEXT NOT NULL,
    "correctAnswers" TEXT NOT NULL,
    "questionIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExamHistory_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ExamHistory" ("correctAnswers", "createdAt", "examId", "id", "isRandom", "score", "userAnswers") SELECT "correctAnswers", "createdAt", "examId", "id", "isRandom", "score", "userAnswers" FROM "ExamHistory";
DROP TABLE "ExamHistory";
ALTER TABLE "new_ExamHistory" RENAME TO "ExamHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
