/*
  Warnings:

  - You are about to drop the `academic_calendars` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `calendar_attachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."academic_calendars" DROP CONSTRAINT "academic_calendars_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."academic_calendars" DROP CONSTRAINT "academic_calendars_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."academic_calendars" DROP CONSTRAINT "academic_calendars_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."calendar_attachments" DROP CONSTRAINT "calendar_attachments_calendarId_fkey";

-- AlterTable
ALTER TABLE "public"."academic_years" ADD COLUMN     "calendarPdfName" TEXT,
ADD COLUMN     "calendarPdfUrl" TEXT,
ADD COLUMN     "calendarUploadedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."academic_calendars";

-- DropTable
DROP TABLE "public"."calendar_attachments";

-- DropEnum
DROP TYPE "public"."CalendarFileType";
