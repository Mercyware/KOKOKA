/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,name]` on the table `classes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."classes_schoolId_name_grade_key";

-- CreateIndex
CREATE UNIQUE INDEX "classes_schoolId_name_key" ON "public"."classes"("schoolId", "name");
