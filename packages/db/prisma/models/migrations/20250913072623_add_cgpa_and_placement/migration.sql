-- CreateEnum
CREATE TYPE "public"."PlacementStatus" AS ENUM ('ACTIVE', 'CLOSED', 'DRAFT');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "cgpa" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "public"."placements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "packageOffered" TEXT,
    "cgpaCriteria" DOUBLE PRECISION,
    "location" TEXT,
    "applicationDeadline" TIMESTAMP(3),
    "skills" TEXT[],
    "status" "public"."PlacementStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."placements" ADD CONSTRAINT "placements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
