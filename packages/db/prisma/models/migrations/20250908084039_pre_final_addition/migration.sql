/*
  Warnings:

  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ExamType" AS ENUM ('MID_TERM', 'FINAL_EXAM', 'QUIZ', 'PRACTICAL');

-- CreateEnum
CREATE TYPE "public"."ResultStatus" AS ENUM ('PASS', 'FAIL', 'PENDING', 'WITHHELD');

-- AlterTable
CREATE SEQUENCE "public".universities_uid_seq;
ALTER TABLE "public"."universities" ALTER COLUMN "uid" SET DEFAULT nextval('"public".universities_uid_seq');
ALTER SEQUENCE "public".universities_uid_seq OWNED BY "public"."universities"."uid";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."exams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ExamType" NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "semesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exam_results" (
    "id" TEXT NOT NULL,
    "totalMarksObtained" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "status" "public"."ResultStatus" NOT NULL,
    "remarks" TEXT,
    "grade" DOUBLE PRECISION,
    "studentId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grades" (
    "id" TEXT NOT NULL,
    "marksObtained" DOUBLE PRECISION NOT NULL,
    "examResultId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Semester" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "semesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exams_semesterId_key" ON "public"."exams"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_studentId_key" ON "public"."exam_results"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_examId_key" ON "public"."exam_results"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "grades_examResultId_key" ON "public"."grades"("examResultId");

-- CreateIndex
CREATE UNIQUE INDEX "grades_subjectId_key" ON "public"."grades"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_code_key" ON "public"."Semester"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "public"."Subject"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_semesterId_key" ON "public"."Subject"("semesterId");

-- AddForeignKey
ALTER TABLE "public"."exams" ADD CONSTRAINT "exams_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_results" ADD CONSTRAINT "exam_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_results" ADD CONSTRAINT "exam_results_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grades" ADD CONSTRAINT "grades_examResultId_fkey" FOREIGN KEY ("examResultId") REFERENCES "public"."exam_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grades" ADD CONSTRAINT "grades_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Semester" ADD CONSTRAINT "Semester_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
