-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_authorId_fkey";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "authorName" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminActionFailedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "adminActionLockedUntil" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: relatórios existentes recebem o nome atual do autor.
UPDATE "Report" r SET "authorName" = u."name" FROM "User" u WHERE r."authorId" = u."id";
