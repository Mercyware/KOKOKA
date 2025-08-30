/*
  Warnings:

  - You are about to drop the column `sectionId` on the `classes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_sectionId_fkey";

-- AlterTable
ALTER TABLE "public"."classes" DROP COLUMN "sectionId";
