-- DropForeignKey
ALTER TABLE "public"."placements" DROP CONSTRAINT "placements_createdById_fkey";

-- AlterTable
ALTER TABLE "public"."section_resources" ADD COLUMN     "cloudinaryPublicId" TEXT,
ADD COLUMN     "fileSizeBytes" INTEGER;
