/*
  Warnings:

  - You are about to drop the column `calendarCloudinaryPublicId` on the `academic_years` table. All the data in the column will be lost.
  - You are about to drop the column `cloudinaryPublicId` on the `section_resources` table. All the data in the column will be lost.
  - You are about to drop the column `fileSizeBytes` on the `section_resources` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."SectionResourceType" ADD VALUE 'TIMETABLE';

-- AlterTable
ALTER TABLE "public"."academic_years" DROP COLUMN "calendarCloudinaryPublicId";

-- AlterTable
ALTER TABLE "public"."section_resources" DROP COLUMN "cloudinaryPublicId",
DROP COLUMN "fileSizeBytes";
