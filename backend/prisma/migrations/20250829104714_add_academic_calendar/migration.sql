-- CreateEnum
CREATE TYPE "public"."AcademicTerm" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- CreateTable
CREATE TABLE "public"."academic_calendars" (
    "id" TEXT NOT NULL,
    "term" "public"."AcademicTerm" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "holidays" JSONB,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_calendars_schoolId_academicYearId_term_key" ON "public"."academic_calendars"("schoolId", "academicYearId", "term");

-- AddForeignKey
ALTER TABLE "public"."academic_calendars" ADD CONSTRAINT "academic_calendars_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."academic_calendars" ADD CONSTRAINT "academic_calendars_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."academic_calendars" ADD CONSTRAINT "academic_calendars_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
