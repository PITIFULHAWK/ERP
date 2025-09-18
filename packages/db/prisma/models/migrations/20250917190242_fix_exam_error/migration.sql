/*
  Warnings:

  - The values [MID_TERM,QUIZ,PRACTICAL] on the enum `ExamType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[examResultId,subjectId]` on the table `grades` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ExamType_new" AS ENUM ('FINAL_EXAM');
ALTER TABLE "public"."exams" ALTER COLUMN "type" TYPE "public"."ExamType_new" USING ("type"::text::"public"."ExamType_new");
ALTER TYPE "public"."ExamType" RENAME TO "ExamType_old";
ALTER TYPE "public"."ExamType_new" RENAME TO "ExamType";
DROP TYPE "public"."ExamType_old";
COMMIT;

-- DropIndex
DROP INDEX "public"."grades_examResultId_key";

-- DropIndex
DROP INDEX "public"."grades_subjectId_key";

-- CreateIndex
CREATE UNIQUE INDEX "grades_examResultId_subjectId_key" ON "public"."grades"("examResultId", "subjectId");
