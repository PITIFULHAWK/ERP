/*
  Warnings:

  - You are about to drop the `_UserCourses` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,examId]` on the table `exam_results` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ComplaintCategory" AS ENUM ('HOSTEL', 'ACADEMIC', 'INFRASTRUCTURE', 'FOOD', 'TRANSPORT', 'LIBRARY', 'MEDICAL', 'FINANCIAL', 'ADMINISTRATIVE', 'DISCIPLINARY', 'TECHNICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_INFO', 'RESOLVED', 'CLOSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "public"."ComplaintPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."UpdateType" AS ENUM ('COMMENT', 'STATUS_CHANGE', 'ASSIGNMENT', 'RESOLUTION', 'ESCALATION');

-- DropForeignKey
ALTER TABLE "public"."_UserCourses" DROP CONSTRAINT "_UserCourses_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserCourses" DROP CONSTRAINT "_UserCourses_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendance_summaries" DROP CONSTRAINT "attendance_summaries_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_studentId_fkey";

-- DropIndex
DROP INDEX "public"."exam_results_examId_key";

-- DropIndex
DROP INDEX "public"."exam_results_studentId_key";

-- DropTable
DROP TABLE "public"."_UserCourses";

-- CreateTable
CREATE TABLE "public"."complaints" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."ComplaintCategory" NOT NULL DEFAULT 'OTHER',
    "priority" "public"."ComplaintPriority" NOT NULL DEFAULT 'MEDIUM',
    "studentId" TEXT NOT NULL,
    "status" "public"."ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolutionNote" TEXT,
    "location" TEXT,
    "urgency" BOOLEAN NOT NULL DEFAULT false,
    "attachmentUrls" TEXT[],
    "adminNotes" TEXT,
    "assignedTo" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."complaint_updates" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updateType" "public"."UpdateType" NOT NULL DEFAULT 'COMMENT',
    "message" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_studentId_examId_key" ON "public"."exam_results"("studentId", "examId");

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaint_updates" ADD CONSTRAINT "complaint_updates_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "public"."complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaint_updates" ADD CONSTRAINT "complaint_updates_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
