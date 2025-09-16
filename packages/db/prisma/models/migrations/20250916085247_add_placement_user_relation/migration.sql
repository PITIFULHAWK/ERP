-- AddForeignKey
ALTER TABLE "public"."placements" ADD CONSTRAINT "placements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
