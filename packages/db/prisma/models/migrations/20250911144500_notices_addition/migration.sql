-- CreateEnum
CREATE TYPE "public"."NoticeType" AS ENUM ('GENERAL', 'URGENT', 'ACADEMIC', 'HOSTEL', 'EXAM');

-- CreateEnum
CREATE TYPE "public"."NoticePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."NoticeAudience" AS ENUM ('ALL', 'STUDENTS', 'FACULTY', 'STAFF');

-- CreateEnum
CREATE TYPE "public"."NoticeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'EXPIRED');

-- AlterTable
ALTER TABLE "public"."notices" ADD COLUMN     "priority" "public"."NoticePriority" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "targetAudience" "public"."NoticeAudience" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "type" "public"."NoticeType" NOT NULL DEFAULT 'GENERAL';

-- CreateTable
CREATE TABLE "public"."receipts" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."receipts" ADD CONSTRAINT "receipts_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipts" ADD CONSTRAINT "receipts_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
