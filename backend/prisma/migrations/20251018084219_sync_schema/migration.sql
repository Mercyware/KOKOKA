/*
  Warnings:

  - You are about to drop the column `teacherId` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `class_teachers` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `teacher_subjects` table. All the data in the column will be lost.
  - You are about to drop the `teachers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[staffId,classId,academicYearId]` on the table `class_teachers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profilePictureId]` on the table `staff` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[profilePictureId]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffId,subjectId]` on the table `teacher_subjects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffId` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicYearId` to the `class_teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staffId` to the `class_teachers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `staffId` to the `teacher_subjects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AttendanceReportType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM_RANGE', 'STUDENT_WISE', 'CLASS_WISE', 'TEACHER_WISE');

-- CreateEnum
CREATE TYPE "public"."AttendanceReportStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."CustomizationLevel" AS ENUM ('MINIMAL', 'MODERATE', 'FULL');

-- CreateEnum
CREATE TYPE "public"."ProgressionStatus" AS ENUM ('AHEAD', 'ON_TRACK', 'BEHIND', 'AT_RISK');

-- CreateEnum
CREATE TYPE "public"."GradeBookStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'LOCKED', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."GradeReportType" AS ENUM ('TERM_REPORT', 'SEMESTER_REPORT', 'ANNUAL_REPORT', 'PROGRESS_REPORT', 'PARENT_CONFERENCE', 'TRANSCRIPT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'SENT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."BatchProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "public"."ClassSubjectStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."ClassTeacherStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'TRANSFERRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."FileCategory" AS ENUM ('PROFILE_PICTURE', 'DOCUMENT', 'IMAGE', 'AUDIO', 'VIDEO', 'REPORT', 'ASSIGNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FileStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'DELETED', 'QUARANTINED', 'PROCESSING');

-- CreateEnum
CREATE TYPE "public"."SubjectAssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'TRANSFERRED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."BookType" AS ENUM ('PHYSICAL', 'EBOOK', 'BOTH');

-- CreateEnum
CREATE TYPE "public"."BookCategory" AS ENUM ('FICTION', 'NON_FICTION', 'SCIENCE', 'MATHEMATICS', 'HISTORY', 'GEOGRAPHY', 'LITERATURE', 'BIOGRAPHY', 'REFERENCE', 'TEXTBOOK', 'MAGAZINE', 'JOURNAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."BookStatus" AS ENUM ('AVAILABLE', 'ISSUED', 'LOST', 'DAMAGED', 'UNDER_REPAIR', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."IssueStatus" AS ENUM ('ISSUED', 'RETURNED', 'OVERDUE', 'LOST', 'DAMAGED');

-- CreateEnum
CREATE TYPE "public"."BookCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "public"."HostelType" AS ENUM ('BOYS', 'GIRLS', 'MIXED', 'STAFF');

-- CreateEnum
CREATE TYPE "public"."HostelStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."RoomType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD', 'DORMITORY', 'STANDARD', 'DELUXE', 'SUITE');

-- CreateEnum
CREATE TYPE "public"."RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE', 'RESERVED');

-- CreateEnum
CREATE TYPE "public"."AllocationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "public"."FeeFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMESTERLY', 'YEARLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "public"."MessageThreadType" AS ENUM ('DIRECT', 'GROUP', 'CLASS', 'ANNOUNCEMENT', 'BROADCAST');

-- CreateEnum
CREATE TYPE "public"."MessageThreadStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'CLOSED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'FILE', 'LINK');

-- CreateEnum
CREATE TYPE "public"."MessagePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."MessageDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "public"."ParticipantStatus" AS ENUM ('ACTIVE', 'LEFT', 'REMOVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."VehicleType" AS ENUM ('BUS', 'VAN', 'CAR', 'MINIBUS', 'COACH');

-- CreateEnum
CREATE TYPE "public"."VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED');

-- CreateEnum
CREATE TYPE "public"."VehicleCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_REPAIR');

-- CreateEnum
CREATE TYPE "public"."TransportStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."RouteDirection" AS ENUM ('TO_SCHOOL', 'FROM_SCHOOL', 'BOTH');

-- CreateEnum
CREATE TYPE "public"."MaintenanceType" AS ENUM ('ROUTINE_SERVICE', 'REPAIR', 'INSPECTION', 'OIL_CHANGE', 'TIRE_REPLACEMENT', 'BRAKE_SERVICE', 'ENGINE_REPAIR', 'BODY_WORK', 'ELECTRICAL', 'EMERGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "public"."InventoryItemType" AS ENUM ('ASSET', 'CONSUMABLE', 'EQUIPMENT', 'FURNITURE', 'ELECTRONICS', 'SPORTS', 'BOOKS', 'UNIFORMS', 'LABORATORY', 'OFFICE', 'MEDICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."InventoryItemStatus" AS ENUM ('ACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED', 'ON_ORDER', 'INACTIVE', 'EXPIRED', 'RESERVED');

-- CreateEnum
CREATE TYPE "public"."ItemCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'NEEDS_REPAIR', 'UNDER_REPAIR');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('PURCHASE', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'WRITE_OFF', 'TRANSFER', 'DONATION', 'DISPOSAL');

-- CreateEnum
CREATE TYPE "public"."AllocationTargetType" AS ENUM ('STUDENT', 'TEACHER', 'STAFF', 'DEPARTMENT', 'CLASS', 'HOSTEL', 'LIBRARY', 'LABORATORY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."InventoryAllocationStatus" AS ENUM ('ALLOCATED', 'RETURNED', 'OVERDUE', 'LOST', 'DAMAGED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AssessmentType" ADD VALUE 'AFFECTIVE';
ALTER TYPE "public"."AssessmentType" ADD VALUE 'PSYCHOMOTOR';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AttendanceMethod" ADD VALUE 'RFID';
ALTER TYPE "public"."AttendanceMethod" ADD VALUE 'FACE_RECOGNITION';
ALTER TYPE "public"."AttendanceMethod" ADD VALUE 'MOBILE_APP';
ALTER TYPE "public"."AttendanceMethod" ADD VALUE 'WEB_PORTAL';
ALTER TYPE "public"."AttendanceMethod" ADD VALUE 'CSV_IMPORT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AttendancePeriod" ADD VALUE 'LUNCH';
ALTER TYPE "public"."AttendancePeriod" ADD VALUE 'ASSEMBLY';
ALTER TYPE "public"."AttendancePeriod" ADD VALUE 'BREAK';
ALTER TYPE "public"."AttendancePeriod" ADD VALUE 'CUSTOM';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AttendanceStatus" ADD VALUE 'SICK';
ALTER TYPE "public"."AttendanceStatus" ADD VALUE 'SUSPENDED';
ALTER TYPE "public"."AttendanceStatus" ADD VALUE 'EARLY_DEPARTURE';

-- DropForeignKey
ALTER TABLE "public"."assessments" DROP CONSTRAINT "assessments_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_teachers" DROP CONSTRAINT "class_teachers_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_subjects" DROP CONSTRAINT "teacher_subjects_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teachers" DROP CONSTRAINT "teachers_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teachers" DROP CONSTRAINT "teachers_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teachers" DROP CONSTRAINT "teachers_userId_fkey";

-- DropIndex
DROP INDEX "public"."class_teachers_teacherId_classId_key";

-- DropIndex
DROP INDEX "public"."teacher_subjects_teacherId_subjectId_key";

-- AlterTable
ALTER TABLE "public"."assessments" DROP COLUMN "teacherId",
ADD COLUMN     "staffId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."attendance" ADD COLUMN     "academicYearId" TEXT NOT NULL,
ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "deviceInfo" JSONB,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "modifiedAt" TIMESTAMP(3),
ADD COLUMN     "modifiedById" TEXT,
ADD COLUMN     "temperature" DOUBLE PRECISION,
ADD COLUMN     "termId" TEXT,
ADD COLUMN     "totalMinutesPresent" INTEGER;

-- AlterTable
ALTER TABLE "public"."class_curricula" ADD COLUMN     "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "milestones" JSONB;

-- AlterTable
ALTER TABLE "public"."class_teachers" DROP COLUMN "teacherId",
ADD COLUMN     "academicYearId" TEXT NOT NULL,
ADD COLUMN     "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "canGradeAssignments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canManageClassroom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canMarkAttendance" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isSubjectTeacher" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "staffId" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "public"."ClassTeacherStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "subjects" TEXT[];

-- AlterTable
ALTER TABLE "public"."curricula" ADD COLUMN     "adoptionDate" TIMESTAMP(3),
ADD COLUMN     "analytics" JSONB,
ADD COLUMN     "customizationLevel" "public"."CustomizationLevel" NOT NULL DEFAULT 'FULL',
ADD COLUMN     "globalCurriculumId" TEXT,
ADD COLUMN     "implementationStatus" "public"."ImplementationStatus" NOT NULL DEFAULT 'PLANNED',
ADD COLUMN     "lastReviewDate" TIMESTAMP(3),
ADD COLUMN     "nextReviewDate" TIMESTAMP(3),
ADD COLUMN     "originalTemplate" JSONB;

-- AlterTable
ALTER TABLE "public"."staff" ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "profilePictureId" TEXT,
ADD COLUMN     "qualification" TEXT;

-- AlterTable
ALTER TABLE "public"."student_class_history" ADD COLUMN     "sectionId" TEXT;

-- AlterTable
ALTER TABLE "public"."students" ADD COLUMN     "admissionTestScore" DOUBLE PRECISION,
ADD COLUMN     "allergies" TEXT[],
ADD COLUMN     "applicationDate" TIMESTAMP(3),
ADD COLUMN     "behavioralNotes" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "currentSectionId" TEXT,
ADD COLUMN     "doctorName" TEXT,
ADD COLUMN     "doctorPhone" TEXT,
ADD COLUMN     "documentsSubmitted" TEXT[],
ADD COLUMN     "emergencyContacts" JSONB,
ADD COLUMN     "emergencyMedicalInfo" TEXT,
ADD COLUMN     "extracurriculars" TEXT[],
ADD COLUMN     "feesPaid" DOUBLE PRECISION,
ADD COLUMN     "hospitalPreference" TEXT,
ADD COLUMN     "identificationDocs" JSONB,
ADD COLUMN     "immunizations" JSONB,
ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "languagesSpoken" TEXT[],
ADD COLUMN     "medicalConditions" TEXT[],
ADD COLUMN     "medicalInfo" JSONB,
ADD COLUMN     "medications" JSONB,
ADD COLUMN     "motherTongue" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "permanentCity" TEXT,
ADD COLUMN     "permanentCountry" TEXT,
ADD COLUMN     "permanentState" TEXT,
ADD COLUMN     "permanentStreetAddress" TEXT,
ADD COLUMN     "permanentZipCode" TEXT,
ADD COLUMN     "photographs" JSONB,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "previousAcademicRecord" JSONB,
ADD COLUMN     "previousClass" TEXT,
ADD COLUMN     "previousSchool" TEXT,
ADD COLUMN     "profilePictureId" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "scholarshipInfo" JSONB,
ADD COLUMN     "socialBackground" TEXT,
ADD COLUMN     "specialNeeds" TEXT,
ADD COLUMN     "talents" TEXT[],
ADD COLUMN     "tcDate" TIMESTAMP(3),
ADD COLUMN     "tcNumber" TEXT,
ADD COLUMN     "transportInfo" JSONB;

-- AlterTable
ALTER TABLE "public"."teacher_subjects" DROP COLUMN "teacherId",
ADD COLUMN     "staffId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."teachers";

-- DropEnum
DROP TYPE "public"."TeacherStatus";

-- CreateTable
CREATE TABLE "public"."file_manager" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "category" "public"."FileCategory" NOT NULL DEFAULT 'OTHER',
    "originalName" TEXT,
    "dimensions" JSONB,
    "compressed" BOOLEAN NOT NULL DEFAULT false,
    "entityType" TEXT,
    "entityId" TEXT,
    "uploadedById" TEXT,
    "schoolId" TEXT NOT NULL,
    "status" "public"."FileStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_curricula" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "type" "public"."CurriculumType" NOT NULL DEFAULT 'STANDARD',
    "provider" TEXT NOT NULL,
    "country" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "minGrade" INTEGER NOT NULL DEFAULT 1,
    "maxGrade" INTEGER NOT NULL DEFAULT 12,
    "framework" JSONB,
    "standards" JSONB,
    "assessmentTypes" JSONB,
    "status" "public"."CurriculumStatus" NOT NULL DEFAULT 'ACTIVE',
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "licenseType" TEXT NOT NULL DEFAULT 'FREE',
    "adoptionCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "difficulty" TEXT NOT NULL DEFAULT 'STANDARD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_curricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."global_curriculum_subjects" (
    "id" TEXT NOT NULL,
    "globalCurriculumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "gradeLevel" INTEGER NOT NULL,
    "term" INTEGER,
    "recommendedHours" INTEGER,
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "learningOutcomes" JSONB,
    "keyTopics" JSONB,
    "skillsFramework" JSONB,
    "prerequisites" TEXT[],
    "followUpSubjects" TEXT[],
    "assessmentWeights" JSONB,
    "gradingScale" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_curriculum_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."curriculum_progress_trackers" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT,
    "globalCurriculumId" TEXT,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "overallProgress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "subjectProgress" JSONB,
    "skillsDevelopment" JSONB,
    "learningOutcomes" JSONB,
    "currentGrade" TEXT,
    "expectedProgression" TEXT,
    "progressionStatus" "public"."ProgressionStatus" NOT NULL DEFAULT 'ON_TRACK',
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "recommendations" JSONB,
    "lastAssessmentDate" TIMESTAMP(3),
    "nextMilestoneDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_progress_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grade_books" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "termId" TEXT,
    "name" TEXT NOT NULL,
    "gradingScale" JSONB NOT NULL,
    "weightingScheme" JSONB,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "averageGrade" DOUBLE PRECISION,
    "progressSummary" JSONB,
    "status" "public"."GradeBookStatus" NOT NULL DEFAULT 'ACTIVE',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grade_entries" (
    "id" TEXT NOT NULL,
    "gradeBookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assessmentId" TEXT,
    "rawScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "letterGrade" TEXT,
    "gradePoint" DOUBLE PRECISION,
    "weightedScore" DOUBLE PRECISION,
    "category" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isExcused" BOOLEAN NOT NULL DEFAULT false,
    "feedback" TEXT,
    "teacherNotes" TEXT,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grade_reports" (
    "id" TEXT NOT NULL,
    "gradeBookId" TEXT,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "termId" TEXT,
    "reportType" "public"."GradeReportType" NOT NULL,
    "reportPeriod" TEXT NOT NULL,
    "overallGrade" TEXT,
    "overallPercentage" DOUBLE PRECISION,
    "overallGPA" DOUBLE PRECISION,
    "classRank" INTEGER,
    "classSize" INTEGER,
    "subjectGrades" JSONB NOT NULL,
    "progressIndicators" JSONB,
    "teacherComments" JSONB,
    "conductGrade" TEXT,
    "attendancePercentage" DOUBLE PRECISION,
    "strengths" TEXT[],
    "areasForImprovement" TEXT[],
    "recommendations" TEXT[],
    "parentGuidance" TEXT,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "parentViewedAt" TIMESTAMP(3),
    "studentViewedAt" TIMESTAMP(3),
    "generatedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_card_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."GradeReportType" NOT NULL,
    "layout" JSONB NOT NULL,
    "subjectOrder" TEXT[],
    "includeAttendance" BOOLEAN NOT NULL DEFAULT true,
    "includeConduct" BOOLEAN NOT NULL DEFAULT true,
    "includeCreditHours" BOOLEAN NOT NULL DEFAULT false,
    "includeClassRank" BOOLEAN NOT NULL DEFAULT false,
    "includeGPA" BOOLEAN NOT NULL DEFAULT true,
    "includePercentile" BOOLEAN NOT NULL DEFAULT false,
    "includeComments" BOOLEAN NOT NULL DEFAULT true,
    "includeSignatures" BOOLEAN NOT NULL DEFAULT true,
    "gradingScale" JSONB NOT NULL,
    "passingGrade" TEXT NOT NULL DEFAULT 'D',
    "showLetterGrades" BOOLEAN NOT NULL DEFAULT true,
    "showPercentages" BOOLEAN NOT NULL DEFAULT true,
    "showGPA" BOOLEAN NOT NULL DEFAULT true,
    "headerText" TEXT,
    "footerText" TEXT,
    "logoUrl" TEXT,
    "colors" JSONB,
    "fonts" JSONB,
    "pageSize" TEXT NOT NULL DEFAULT 'A4',
    "orientation" TEXT NOT NULL DEFAULT 'portrait',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "schoolId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_card_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_cards" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "termId" TEXT,
    "classId" TEXT,
    "templateId" TEXT NOT NULL,
    "reportType" "public"."GradeReportType" NOT NULL,
    "reportPeriod" TEXT NOT NULL,
    "generatedData" JSONB NOT NULL,
    "subjectGrades" JSONB NOT NULL,
    "overallSummary" JSONB NOT NULL,
    "overallGrade" TEXT,
    "overallPercentage" DOUBLE PRECISION,
    "overallGPA" DOUBLE PRECISION,
    "classRank" INTEGER,
    "classSize" INTEGER,
    "attendanceData" JSONB,
    "conductGrade" TEXT,
    "teacherComments" JSONB,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "parentViewedAt" TIMESTAMP(3),
    "studentViewedAt" TIMESTAMP(3),
    "generatedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "pdfStoragePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_batches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "academicYearId" TEXT NOT NULL,
    "termId" TEXT,
    "classIds" TEXT[],
    "studentIds" TEXT[],
    "templateId" TEXT NOT NULL,
    "reportType" "public"."GradeReportType" NOT NULL,
    "reportPeriod" TEXT NOT NULL,
    "status" "public"."BatchProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "totalStudents" INTEGER NOT NULL,
    "processedStudents" INTEGER NOT NULL DEFAULT 0,
    "successfulReports" INTEGER NOT NULL DEFAULT 0,
    "failedReports" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorLog" JSONB,
    "bulkPdfUrl" TEXT,
    "individualPdfsUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parent_grade_access" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "hasGradeAccess" BOOLEAN NOT NULL DEFAULT true,
    "hasReportAccess" BOOLEAN NOT NULL DEFAULT true,
    "hasProgressAccess" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnNewGrades" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnReportCards" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnProgress" BOOLEAN NOT NULL DEFAULT true,
    "lastAccessDate" TIMESTAMP(3),
    "totalAccesses" INTEGER NOT NULL DEFAULT 0,
    "mostViewedSubject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_grade_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_subject_history" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "credits" INTEGER,
    "hoursPerWeek" INTEGER,
    "term" INTEGER,
    "semester" INTEGER,
    "staffId" TEXT,
    "status" "public"."ClassSubjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "maxStudents" INTEGER,
    "prerequisites" TEXT[],
    "description" TEXT,
    "gradingScale" JSONB,
    "passingGrade" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_subject_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subject_assignments" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "sectionId" TEXT,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "public"."SubjectAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "hoursPerWeek" INTEGER,
    "term" INTEGER,
    "semester" INTEGER,
    "isMainTeacher" BOOLEAN NOT NULL DEFAULT true,
    "canGrade" BOOLEAN NOT NULL DEFAULT true,
    "canMarkAttendance" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_sessions" (
    "id" TEXT NOT NULL,
    "sessionName" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "graceMinutes" INTEGER NOT NULL DEFAULT 15,
    "halfDayMinutes" INTEGER NOT NULL DEFAULT 240,
    "fullDayMinutes" INTEGER NOT NULL DEFAULT 360,
    "lowAttendanceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 75.0,
    "criticalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 65.0,
    "enableParentNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableSMSAlerts" BOOLEAN NOT NULL DEFAULT false,
    "enableEmailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnLateArrival" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnAbsence" BOOLEAN NOT NULL DEFAULT true,
    "enableGeofencing" BOOLEAN NOT NULL DEFAULT false,
    "geofenceRadius" DOUBLE PRECISION,
    "geofenceCenter" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicableFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicableTo" TIMESTAMP(3),
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_reports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reportType" "public"."AttendanceReportType" NOT NULL DEFAULT 'MONTHLY',
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "filters" JSONB,
    "reportData" JSONB NOT NULL,
    "summary" JSONB,
    "status" "public"."AttendanceReportStatus" NOT NULL DEFAULT 'PENDING',
    "generatedAt" TIMESTAMP(3),
    "fileUrl" TEXT,
    "schoolId" TEXT NOT NULL,
    "generatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT,
    "publisher" TEXT,
    "publishedDate" TIMESTAMP(3),
    "edition" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "bookType" "public"."BookType" NOT NULL DEFAULT 'PHYSICAL',
    "fileUrl" TEXT,
    "fileFormat" TEXT,
    "fileSize" INTEGER,
    "downloadLimit" INTEGER,
    "category" "public"."BookCategory" NOT NULL DEFAULT 'GENERAL',
    "subcategory" TEXT,
    "description" TEXT,
    "pages" INTEGER,
    "coverImageUrl" TEXT,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "issuedCopies" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT,
    "rackNumber" TEXT,
    "price" DOUBLE PRECISION,
    "procuredDate" TIMESTAMP(3),
    "vendor" TEXT,
    "status" "public"."BookStatus" NOT NULL DEFAULT 'AVAILABLE',
    "tags" TEXT[],
    "subjects" TEXT[],
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."book_issues" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "status" "public"."IssueStatus" NOT NULL DEFAULT 'ISSUED',
    "fine" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "fineReason" TEXT,
    "finePaid" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastDownloadAt" TIMESTAMP(3),
    "accessExpiry" TIMESTAMP(3),
    "issueNotes" TEXT,
    "returnNotes" TEXT,
    "condition" "public"."BookCondition",
    "issuedById" TEXT NOT NULL,
    "returnedById" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hostels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostelType" "public"."HostelType" NOT NULL,
    "gender" "public"."Gender",
    "address" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "occupiedBeds" INTEGER NOT NULL DEFAULT 0,
    "availableBeds" INTEGER NOT NULL DEFAULT 0,
    "wardenId" TEXT,
    "facilities" TEXT[],
    "description" TEXT,
    "status" "public"."HostelStatus" NOT NULL DEFAULT 'ACTIVE',
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hostel_rooms" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floor" INTEGER,
    "roomType" "public"."RoomType" NOT NULL DEFAULT 'STANDARD',
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "occupiedBeds" INTEGER NOT NULL DEFAULT 0,
    "availableBeds" INTEGER NOT NULL DEFAULT 0,
    "facilities" TEXT[],
    "status" "public"."RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "hostelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hostel_allocations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "bedNumber" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "public"."AllocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "academicYearId" TEXT,
    "remarks" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hostel_fees" (
    "id" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomType" "public"."RoomType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "frequency" "public"."FeeFrequency" NOT NULL DEFAULT 'MONTHLY',
    "description" TEXT,
    "academicYearId" TEXT,
    "securityDeposit" DOUBLE PRECISION,
    "admissionFee" DOUBLE PRECISION,
    "status" "public"."HostelStatus" NOT NULL DEFAULT 'ACTIVE',
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_threads" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "type" "public"."MessageThreadType" NOT NULL DEFAULT 'DIRECT',
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "groupName" TEXT,
    "groupAvatar" TEXT,
    "status" "public"."MessageThreadStatus" NOT NULL DEFAULT 'ACTIVE',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "classId" TEXT,
    "subjectId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "lastMessagePreview" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_thread_participants" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."ParticipantStatus" NOT NULL DEFAULT 'ACTIVE',
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_thread_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "public"."MessageType" NOT NULL DEFAULT 'TEXT',
    "parentMessageId" TEXT,
    "attachments" JSONB,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "priority" "public"."MessagePriority" NOT NULL DEFAULT 'NORMAL',
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "senderId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_recipients" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "deliveryStatus" "public"."MessageDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "deliveredAt" TIMESTAMP(3),
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transport_routes" (
    "id" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "routeNumber" TEXT,
    "description" TEXT,
    "startPoint" TEXT NOT NULL,
    "endPoint" TEXT NOT NULL,
    "stops" JSONB NOT NULL,
    "distance" DOUBLE PRECISION,
    "estimatedTime" INTEGER,
    "fare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" "public"."TransportStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicles" (
    "id" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "vehicleName" TEXT,
    "vehicleType" "public"."VehicleType" NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "color" TEXT,
    "registrationNumber" TEXT,
    "seatingCapacity" INTEGER NOT NULL DEFAULT 0,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "driverLicense" TEXT,
    "lastServiceDate" TIMESTAMP(3),
    "nextServiceDate" TIMESTAMP(3),
    "insuranceExpiry" TIMESTAMP(3),
    "roadworthyExpiry" TIMESTAMP(3),
    "gpsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gpsDeviceId" TEXT,
    "status" "public"."VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "condition" "public"."VehicleCondition" NOT NULL DEFAULT 'GOOD',
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."route_vehicle_assignments" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "dayOfWeek" TEXT[],
    "departureTime" TEXT,
    "arrivalTime" TEXT,
    "direction" "public"."RouteDirection" NOT NULL DEFAULT 'BOTH',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "public"."TransportStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_vehicle_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_transport_assignments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "pickupPoint" TEXT NOT NULL,
    "pickupTime" TEXT,
    "dropoffPoint" TEXT NOT NULL,
    "dropoffTime" TEXT,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "academicYearId" TEXT,
    "status" "public"."TransportStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_transport_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicle_maintenance" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "maintenanceType" "public"."MaintenanceType" NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "serviceProvider" TEXT,
    "mechanicName" TEXT,
    "mechanicPhone" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "nextServiceDate" TIMESTAMP(3),
    "status" "public"."MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "odometerReading" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "itemCode" TEXT NOT NULL,
    "barcode" TEXT,
    "categoryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minimumStock" INTEGER NOT NULL DEFAULT 0,
    "maximumStock" INTEGER,
    "reorderLevel" INTEGER,
    "unit" TEXT NOT NULL,
    "location" TEXT,
    "shelf" TEXT,
    "bin" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "supplierName" TEXT,
    "supplierContact" TEXT,
    "itemType" "public"."InventoryItemType" NOT NULL,
    "status" "public"."InventoryItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "condition" "public"."ItemCondition" NOT NULL DEFAULT 'GOOD',
    "expiryDate" TIMESTAMP(3),
    "warrantyExpiry" TIMESTAMP(3),
    "notes" TEXT,
    "tags" TEXT[],
    "imageUrl" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_transactions" (
    "id" TEXT NOT NULL,
    "transactionType" "public"."TransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION,
    "itemId" TEXT NOT NULL,
    "previousQty" INTEGER NOT NULL,
    "newQty" INTEGER NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "referenceNumber" TEXT,
    "userId" TEXT NOT NULL,
    "supplierName" TEXT,
    "recipientName" TEXT,
    "recipientType" TEXT,
    "recipientId" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_allocations" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "allocatedTo" TEXT NOT NULL,
    "allocatedToType" "public"."AllocationTargetType" NOT NULL,
    "allocatedToId" TEXT,
    "allocationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedReturn" TIMESTAMP(3),
    "actualReturn" TIMESTAMP(3),
    "status" "public"."InventoryAllocationStatus" NOT NULL DEFAULT 'ALLOCATED',
    "issuedCondition" "public"."ItemCondition" NOT NULL DEFAULT 'GOOD',
    "returnCondition" "public"."ItemCondition",
    "allocatedBy" TEXT NOT NULL,
    "purpose" TEXT,
    "notes" TEXT,
    "returnNotes" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grade_scales" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grade_ranges" (
    "id" TEXT NOT NULL,
    "gradeScaleId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "minScore" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "gradePoint" DOUBLE PRECISION NOT NULL,
    "remark" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."results" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "gradeScaleId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "totalSubjects" INTEGER NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "position" INTEGER,
    "daysPresent" INTEGER NOT NULL DEFAULT 0,
    "daysAbsent" INTEGER NOT NULL DEFAULT 0,
    "timesLate" INTEGER NOT NULL DEFAULT 0,
    "conductGrade" TEXT,
    "teacherComment" TEXT,
    "principalComment" TEXT,
    "promoted" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subject_results" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "firstCA" DOUBLE PRECISION,
    "secondCA" DOUBLE PRECISION,
    "thirdCA" DOUBLE PRECISION,
    "exam" DOUBLE PRECISION,
    "totalCA" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION,
    "grade" TEXT,
    "gradePoint" DOUBLE PRECISION,
    "remark" TEXT,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_AttendanceToAttendanceSession" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AttendanceToAttendanceSession_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_manager_fileKey_key" ON "public"."file_manager"("fileKey");

-- CreateIndex
CREATE UNIQUE INDEX "global_curricula_name_key" ON "public"."global_curricula"("name");

-- CreateIndex
CREATE UNIQUE INDEX "global_curriculum_subjects_globalCurriculumId_code_gradeLev_key" ON "public"."global_curriculum_subjects"("globalCurriculumId", "code", "gradeLevel");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_progress_trackers_studentId_curriculumId_academi_key" ON "public"."curriculum_progress_trackers"("studentId", "curriculumId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_books_staffId_classId_subjectId_academicYearId_termId_key" ON "public"."grade_books"("staffId", "classId", "subjectId", "academicYearId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_entries_gradeBookId_studentId_assessmentId_key" ON "public"."grade_entries"("gradeBookId", "studentId", "assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_reports_studentId_reportType_reportPeriod_academicYea_key" ON "public"."grade_reports"("studentId", "reportType", "reportPeriod", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "report_card_templates_schoolId_name_key" ON "public"."report_card_templates"("schoolId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_studentId_reportType_reportPeriod_academicYear_key" ON "public"."report_cards"("studentId", "reportType", "reportPeriod", "academicYearId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "parent_grade_access_guardianId_studentId_key" ON "public"."parent_grade_access"("guardianId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "class_subject_history_classId_subjectId_academicYearId_term_key" ON "public"."class_subject_history"("classId", "subjectId", "academicYearId", "term");

-- CreateIndex
CREATE UNIQUE INDEX "subject_assignments_staffId_subjectId_classId_sectionId_aca_key" ON "public"."subject_assignments"("staffId", "subjectId", "classId", "sectionId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "public"."books"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_rooms_hostelId_roomNumber_key" ON "public"."hostel_rooms"("hostelId", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "message_thread_participants_threadId_userId_key" ON "public"."message_thread_participants"("threadId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "message_recipients_messageId_recipientId_key" ON "public"."message_recipients"("messageId", "recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNumber_key" ON "public"."vehicles"("vehicleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "route_vehicle_assignments_routeId_vehicleId_direction_key" ON "public"."route_vehicle_assignments"("routeId", "vehicleId", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_itemCode_key" ON "public"."inventory_items"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "results_studentId_termId_key" ON "public"."results"("studentId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_results_resultId_subjectId_key" ON "public"."subject_results"("resultId", "subjectId");

-- CreateIndex
CREATE INDEX "_AttendanceToAttendanceSession_B_index" ON "public"."_AttendanceToAttendanceSession"("B");

-- CreateIndex
CREATE UNIQUE INDEX "class_teachers_staffId_classId_academicYearId_key" ON "public"."class_teachers"("staffId", "classId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profilePictureId_key" ON "public"."staff"("profilePictureId");

-- CreateIndex
CREATE UNIQUE INDEX "students_profilePictureId_key" ON "public"."students"("profilePictureId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subjects_staffId_subjectId_key" ON "public"."teacher_subjects"("staffId", "subjectId");

-- AddForeignKey
ALTER TABLE "public"."file_manager" ADD CONSTRAINT "file_manager_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_manager" ADD CONSTRAINT "file_manager_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."global_curriculum_subjects" ADD CONSTRAINT "global_curriculum_subjects_globalCurriculumId_fkey" FOREIGN KEY ("globalCurriculumId") REFERENCES "public"."global_curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curricula" ADD CONSTRAINT "curricula_globalCurriculumId_fkey" FOREIGN KEY ("globalCurriculumId") REFERENCES "public"."global_curricula"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" ADD CONSTRAINT "curriculum_progress_trackers_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" ADD CONSTRAINT "curriculum_progress_trackers_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" ADD CONSTRAINT "curriculum_progress_trackers_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."curricula"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" ADD CONSTRAINT "curriculum_progress_trackers_globalCurriculumId_fkey" FOREIGN KEY ("globalCurriculumId") REFERENCES "public"."global_curricula"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" ADD CONSTRAINT "curriculum_progress_trackers_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_books" ADD CONSTRAINT "grade_books_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_books" ADD CONSTRAINT "grade_books_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_books" ADD CONSTRAINT "grade_books_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_books" ADD CONSTRAINT "grade_books_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_books" ADD CONSTRAINT "grade_books_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_books" ADD CONSTRAINT "grade_books_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_entries" ADD CONSTRAINT "grade_entries_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_entries" ADD CONSTRAINT "grade_entries_gradeBookId_fkey" FOREIGN KEY ("gradeBookId") REFERENCES "public"."grade_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_entries" ADD CONSTRAINT "grade_entries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_reports" ADD CONSTRAINT "grade_reports_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_reports" ADD CONSTRAINT "grade_reports_gradeBookId_fkey" FOREIGN KEY ("gradeBookId") REFERENCES "public"."grade_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_reports" ADD CONSTRAINT "grade_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_reports" ADD CONSTRAINT "grade_reports_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_card_templates" ADD CONSTRAINT "report_card_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_card_templates" ADD CONSTRAINT "report_card_templates_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_cards" ADD CONSTRAINT "report_cards_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_cards" ADD CONSTRAINT "report_cards_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_cards" ADD CONSTRAINT "report_cards_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_cards" ADD CONSTRAINT "report_cards_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_cards" ADD CONSTRAINT "report_cards_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_cards" ADD CONSTRAINT "report_cards_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."report_card_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_cards" ADD CONSTRAINT "report_cards_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_batches" ADD CONSTRAINT "report_batches_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_batches" ADD CONSTRAINT "report_batches_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_batches" ADD CONSTRAINT "report_batches_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_batches" ADD CONSTRAINT "report_batches_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."report_card_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_batches" ADD CONSTRAINT "report_batches_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parent_grade_access" ADD CONSTRAINT "parent_grade_access_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "public"."guardians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parent_grade_access" ADD CONSTRAINT "parent_grade_access_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_currentSectionId_fkey" FOREIGN KEY ("currentSectionId") REFERENCES "public"."sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_profilePictureId_fkey" FOREIGN KEY ("profilePictureId") REFERENCES "public"."file_manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher_subjects" ADD CONSTRAINT "teacher_subjects_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_teachers" ADD CONSTRAINT "class_teachers_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_teachers" ADD CONSTRAINT "class_teachers_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_class_history" ADD CONSTRAINT "student_class_history_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_subject_history" ADD CONSTRAINT "class_subject_history_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_subject_history" ADD CONSTRAINT "class_subject_history_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_subject_history" ADD CONSTRAINT "class_subject_history_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_subject_history" ADD CONSTRAINT "class_subject_history_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_subject_history" ADD CONSTRAINT "class_subject_history_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_assignments" ADD CONSTRAINT "subject_assignments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_assignments" ADD CONSTRAINT "subject_assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_assignments" ADD CONSTRAINT "subject_assignments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_assignments" ADD CONSTRAINT "subject_assignments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_assignments" ADD CONSTRAINT "subject_assignments_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_assignments" ADD CONSTRAINT "subject_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessments" ADD CONSTRAINT "assessments_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_modifiedById_fkey" FOREIGN KEY ("modifiedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance" ADD CONSTRAINT "attendance_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_sessions" ADD CONSTRAINT "attendance_sessions_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_sessions" ADD CONSTRAINT "attendance_sessions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_policies" ADD CONSTRAINT "attendance_policies_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_reports" ADD CONSTRAINT "attendance_reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_reports" ADD CONSTRAINT "attendance_reports_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."books" ADD CONSTRAINT "books_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_issues" ADD CONSTRAINT "book_issues_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_issues" ADD CONSTRAINT "book_issues_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_issues" ADD CONSTRAINT "book_issues_returnedById_fkey" FOREIGN KEY ("returnedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_issues" ADD CONSTRAINT "book_issues_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."book_issues" ADD CONSTRAINT "book_issues_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostels" ADD CONSTRAINT "hostels_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostels" ADD CONSTRAINT "hostels_wardenId_fkey" FOREIGN KEY ("wardenId") REFERENCES "public"."staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostel_rooms" ADD CONSTRAINT "hostel_rooms_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostel_allocations" ADD CONSTRAINT "hostel_allocations_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostel_allocations" ADD CONSTRAINT "hostel_allocations_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostel_allocations" ADD CONSTRAINT "hostel_allocations_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."hostel_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostel_allocations" ADD CONSTRAINT "hostel_allocations_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostel_allocations" ADD CONSTRAINT "hostel_allocations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostel_fees" ADD CONSTRAINT "hostel_fees_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostel_fees" ADD CONSTRAINT "hostel_fees_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "public"."hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostel_fees" ADD CONSTRAINT "hostel_fees_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_threads" ADD CONSTRAINT "message_threads_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_threads" ADD CONSTRAINT "message_threads_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_thread_participants" ADD CONSTRAINT "message_thread_participants_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_thread_participants" ADD CONSTRAINT "message_thread_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "public"."messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_recipients" ADD CONSTRAINT "message_recipients_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_recipients" ADD CONSTRAINT "message_recipients_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transport_routes" ADD CONSTRAINT "transport_routes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicles" ADD CONSTRAINT "vehicles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_vehicle_assignments" ADD CONSTRAINT "route_vehicle_assignments_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."transport_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."route_vehicle_assignments" ADD CONSTRAINT "route_vehicle_assignments_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_transport_assignments" ADD CONSTRAINT "student_transport_assignments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_transport_assignments" ADD CONSTRAINT "student_transport_assignments_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."transport_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_transport_assignments" ADD CONSTRAINT "student_transport_assignments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_transport_assignments" ADD CONSTRAINT "student_transport_assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_transport_assignments" ADD CONSTRAINT "student_transport_assignments_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vehicle_maintenance" ADD CONSTRAINT "vehicle_maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_categories" ADD CONSTRAINT "inventory_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_categories" ADD CONSTRAINT "inventory_categories_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_items" ADD CONSTRAINT "inventory_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."inventory_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_items" ADD CONSTRAINT "inventory_items_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_transactions" ADD CONSTRAINT "inventory_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_allocations" ADD CONSTRAINT "inventory_allocations_allocatedBy_fkey" FOREIGN KEY ("allocatedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_allocations" ADD CONSTRAINT "inventory_allocations_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_allocations" ADD CONSTRAINT "inventory_allocations_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_scales" ADD CONSTRAINT "grade_scales_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_ranges" ADD CONSTRAINT "grade_ranges_gradeScaleId_fkey" FOREIGN KEY ("gradeScaleId") REFERENCES "public"."grade_scales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."results" ADD CONSTRAINT "results_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."results" ADD CONSTRAINT "results_gradeScaleId_fkey" FOREIGN KEY ("gradeScaleId") REFERENCES "public"."grade_scales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."results" ADD CONSTRAINT "results_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."results" ADD CONSTRAINT "results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."results" ADD CONSTRAINT "results_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_results" ADD CONSTRAINT "subject_results_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "public"."results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject_results" ADD CONSTRAINT "subject_results_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttendanceToAttendanceSession" ADD CONSTRAINT "_AttendanceToAttendanceSession_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_AttendanceToAttendanceSession" ADD CONSTRAINT "_AttendanceToAttendanceSession_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
