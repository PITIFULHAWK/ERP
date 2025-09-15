/*
  Warnings:

  - The values [LATE,EXCUSED] on the enum `AttendanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cgpa` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AttendanceStatus_new" AS ENUM ('PRESENT', 'ABSENT');
ALTER TABLE "public"."attendances" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."attendances" ALTER COLUMN "status" TYPE "public"."AttendanceStatus_new" USING ("status"::text::"public"."AttendanceStatus_new");
ALTER TYPE "public"."AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "public"."AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "public"."AttendanceStatus_old";
ALTER TABLE "public"."attendances" ALTER COLUMN "status" SET DEFAULT 'PRESENT';
COMMIT;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "cgpa";
