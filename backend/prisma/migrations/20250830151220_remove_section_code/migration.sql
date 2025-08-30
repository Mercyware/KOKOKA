/*
  Warnings:

  - You are about to drop the column `code` on the `sections` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[schoolId,name]` on the table `sections` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."sections_schoolId_code_key";

-- AlterTable
ALTER TABLE "public"."sections" DROP COLUMN "code";

-- CreateIndex
CREATE UNIQUE INDEX "sections_schoolId_name_key" ON "public"."sections"("schoolId", "name");
