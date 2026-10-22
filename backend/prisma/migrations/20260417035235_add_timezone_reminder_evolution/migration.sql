-- AlterTable
ALTER TABLE "SurveyAttempt" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "timezone" TEXT DEFAULT 'America/New_York';

-- CreateTable
CREATE TABLE "EvolutionAnalysis" (
    "id" TEXT NOT NULL,
    "currentAttemptId" TEXT NOT NULL,
    "previousAttemptId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvolutionAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvolutionAnalysis_currentAttemptId_previousAttemptId_key" ON "EvolutionAnalysis"("currentAttemptId", "previousAttemptId");
