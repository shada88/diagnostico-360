-- CreateEnum
CREATE TYPE "DimensionType" AS ENUM ('INTERNAL', 'BUSINESS', 'GROWTH');

-- CreateEnum
CREATE TYPE "SubdimensionType" AS ENUM ('SPIRITUAL', 'PERSONAL', 'RELATIONAL', 'PURPOSE', 'FINANCIAL', 'SALES', 'OPERATIONS', 'MARKETING', 'LEADERSHIP', 'PLANNING');

-- CreateEnum
CREATE TYPE "MaturityLevel" AS ENUM ('CRITICO', 'RIESGO', 'ESTABLE', 'COMPETENTE', 'EXCELENTE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "businessName" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "phoneNumber" TEXT,
    "avatarUrl" TEXT,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "resetCode" TEXT,
    "resetCodeExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "dimension" "DimensionType" NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "dimension" "DimensionType" NOT NULL,
    "subdimension" "SubdimensionType" NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "surveyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SurveyAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticResult" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "scoreSpiritual" DOUBLE PRECISION NOT NULL,
    "scorePersonal" DOUBLE PRECISION NOT NULL,
    "scoreRelational" DOUBLE PRECISION NOT NULL,
    "scorePurpose" DOUBLE PRECISION NOT NULL,
    "scoreFinancial" DOUBLE PRECISION NOT NULL,
    "scoreSales" DOUBLE PRECISION NOT NULL,
    "scoreOperations" DOUBLE PRECISION NOT NULL,
    "scoreMarketing" DOUBLE PRECISION NOT NULL,
    "scoreLeadership" DOUBLE PRECISION NOT NULL,
    "scorePlanning" DOUBLE PRECISION NOT NULL,
    "scoreD1" DOUBLE PRECISION NOT NULL,
    "scoreD2" DOUBLE PRECISION NOT NULL,
    "scoreD3" DOUBLE PRECISION NOT NULL,
    "scoreIG" DOUBLE PRECISION NOT NULL,
    "maturityD1" "MaturityLevel" NOT NULL,
    "maturityD2" "MaturityLevel" NOT NULL,
    "maturityD3" "MaturityLevel" NOT NULL,
    "maturityGlobal" "MaturityLevel" NOT NULL,
    "alertGlassCeiling" BOOLEAN NOT NULL DEFAULT false,
    "alertLeakyBucket" BOOLEAN NOT NULL DEFAULT false,
    "alertSuccessCollapse" BOOLEAN NOT NULL DEFAULT false,
    "alertSelfEmployed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DiagnosticResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiEvaluation" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "Section_title_idx" ON "Section"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Section_surveyId_order_key" ON "Section"("surveyId", "order");

-- CreateIndex
CREATE INDEX "Question_dimension_idx" ON "Question"("dimension");

-- CreateIndex
CREATE INDEX "Question_subdimension_idx" ON "Question"("subdimension");

-- CreateIndex
CREATE INDEX "Question_sectionId_idx" ON "Question"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_attemptId_questionId_key" ON "Answer"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticResult_attemptId_key" ON "DiagnosticResult"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "AiEvaluation_attemptId_key" ON "AiEvaluation"("attemptId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAttempt" ADD CONSTRAINT "SurveyAttempt_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAttempt" ADD CONSTRAINT "SurveyAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "SurveyAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticResult" ADD CONSTRAINT "DiagnosticResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "SurveyAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiEvaluation" ADD CONSTRAINT "AiEvaluation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "SurveyAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
