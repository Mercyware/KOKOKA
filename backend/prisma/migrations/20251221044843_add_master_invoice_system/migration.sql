/*
  Warnings:

  - The values [CURRICULUM] on the enum `DocumentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `class_curricula` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `class_curricula` table. All the data in the column will be lost.
  - The `status` column on the `class_curricula` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `activities` on the `content_modules` table. All the data in the column will be lost.
  - You are about to drop the column `chapter` on the `content_modules` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `content_modules` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `content_modules` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `content_modules` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `content_modules` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `content_modules` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `content_modules` table. All the data in the column will be lost.
  - You are about to drop the column `analytics` on the `curricula` table. All the data in the column will be lost.
  - You are about to drop the column `globalCurriculumId` on the `curricula` table. All the data in the column will be lost.
  - You are about to drop the column `lastReviewDate` on the `curricula` table. All the data in the column will be lost.
  - You are about to drop the column `nextReviewDate` on the `curricula` table. All the data in the column will be lost.
  - You are about to drop the column `originalTemplate` on the `curricula` table. All the data in the column will be lost.
  - The `status` column on the `curricula` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `customizationLevel` column on the `curricula` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `implementationStatus` column on the `curricula` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `currentGrade` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `expectedProgression` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `globalCurriculumId` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `lastAssessmentDate` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `learningOutcomes` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `nextMilestoneDate` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `recommendations` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `skillsDevelopment` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `strengths` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - You are about to drop the column `weaknesses` on the `curriculum_progress_trackers` table. All the data in the column will be lost.
  - The `progressionStatus` column on the `curriculum_progress_trackers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `curriculum_subjects` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `curriculum_subjects` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentCriteria` on the `learning_objectives` table. All the data in the column will be lost.
  - You are about to drop the column `bloomLevel` on the `learning_objectives` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `learning_objectives` table. All the data in the column will be lost.
  - You are about to drop the column `expectedOutcome` on the `learning_objectives` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `learning_objectives` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `learning_objectives` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `learning_objectives` table. All the data in the column will be lost.
  - You are about to drop the column `admissionTestScore` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `applicationDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `behavioralNotes` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `documentsSubmitted` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `feesPaid` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `identificationDocs` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `immunizations` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `interviewDate` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `medicalInfo` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `photographs` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `previousAcademicRecord` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `scholarshipInfo` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `socialBackground` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `transportInfo` on the `students` table. All the data in the column will be lost.
  - You are about to drop the `global_curricula` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `global_curriculum_subjects` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,curriculumId,classId,academicYearId]` on the table `curriculum_progress_trackers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paystackSubaccountCode]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailVerificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refreshToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `content_modules` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `curricula` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `createdBy` on table `curricula` required. This step will fail if there are existing NULL values in that column.
  - Made the column `curriculumId` on table `curriculum_progress_trackers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `learning_objectives` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."LearningActivityType" AS ENUM ('ASSIGNMENT_SUBMISSION', 'ASSESSMENT_ATTEMPT', 'CONTENT_VIEW', 'RESOURCE_DOWNLOAD', 'DISCUSSION_POST', 'VIDEO_WATCH', 'PRACTICE_EXERCISE', 'QUIZ_ATTEMPT', 'READING_ACTIVITY', 'PROJECT_WORK');

-- CreateEnum
CREATE TYPE "public"."AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADING', 'GRADED', 'RETURNED', 'RESUBMITTED', 'LATE', 'MISSING');

-- CreateEnum
CREATE TYPE "public"."ConsentType" AS ENUM ('AI_ANALYTICS', 'PERFORMANCE_TRACKING', 'PERSONALIZED_LEARNING', 'PARENT_DATA_SHARING', 'RESEARCH_PARTICIPATION');

-- CreateEnum
CREATE TYPE "public"."ConversationType" AS ENUM ('FAQ', 'SUPPORT', 'GENERAL_INQUIRY', 'COMPLAINT', 'FEEDBACK', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "public"."ConversationStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'ESCALATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."KnowledgeCategory" AS ENUM ('ADMISSIONS', 'ACADEMICS', 'ATTENDANCE', 'FEES', 'TRANSPORTATION', 'HOSTEL', 'LIBRARY', 'EXAMS', 'TIMETABLE', 'POLICIES', 'TECHNICAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."NotificationRuleType" AS ENUM ('ATTENDANCE_PATTERN', 'GRADE_DROP', 'ASSIGNMENT_OVERDUE', 'FEE_REMINDER', 'EXAM_REMINDER', 'LOW_PERFORMANCE', 'HIGH_ACHIEVEMENT', 'BEHAVIOR_INCIDENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."DigestType" AS ENUM ('DAILY_SUMMARY', 'WEEKLY_SUMMARY', 'MONTHLY_REPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."DigestFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "public"."DigestStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PatternType" AS ENUM ('CHRONIC_ABSENCE', 'FREQUENT_TARDINESS', 'MONDAY_PATTERN', 'FRIDAY_PATTERN', 'SUBJECT_SPECIFIC', 'WEATHER_RELATED', 'IRREGULAR', 'IMPROVING', 'DECLINING');

-- CreateEnum
CREATE TYPE "public"."PatternSeverity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."InsightType" AS ENUM ('TREND', 'ANOMALY', 'PREDICTION', 'RECOMMENDATION', 'ALERT');

-- CreateEnum
CREATE TYPE "public"."PredictionType" AS ENUM ('FINAL_GRADE', 'TERM_AVERAGE', 'SUBJECT_PERFORMANCE', 'OVERALL_GPA', 'EXAM_SCORE', 'PASS_PROBABILITY');

-- CreateEnum
CREATE TYPE "public"."RiskType" AS ENUM ('ACADEMIC_FAILURE', 'DROPOUT', 'CHRONIC_ABSENCE', 'BEHAVIORAL', 'MENTAL_HEALTH', 'FINANCIAL');

-- CreateEnum
CREATE TYPE "public"."RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY', 'CHEQUE');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ReminderMethod" AS ENUM ('EMAIL', 'SMS', 'PORTAL_NOTIFICATION');

-- CreateEnum
CREATE TYPE "public"."ReminderStatus" AS ENUM ('SENT', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "public"."AccountingType" AS ENUM ('INCOME', 'EXPENDITURE');

-- CreateEnum
CREATE TYPE "public"."ExpenditureStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."DocumentType_new" AS ENUM ('BIRTH_CERTIFICATE', 'MEDICAL_RECORD', 'IMMUNIZATION_RECORD', 'PREVIOUS_SCHOOL_RECORD', 'TRANSFER_CERTIFICATE', 'REPORT_CARD', 'ID_CARD', 'PASSPORT', 'VISA', 'RESIDENCE_PERMIT', 'GUARDIAN_ID', 'FEE_RECEIPT', 'SCHOLARSHIP_DOCUMENT', 'SPECIAL_NEEDS_ASSESSMENT', 'PHOTO', 'ASSIGNMENT', 'LESSON_PLAN', 'POLICY', 'FORM', 'CERTIFICATE', 'ANNOUNCEMENT', 'MEDIA', 'ASSESSMENT', 'GRADE_SHEET', 'ATTENDANCE_RECORD', 'OTHER');
ALTER TABLE "public"."documents" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."documents" ALTER COLUMN "type" TYPE "public"."DocumentType_new" USING ("type"::text::"public"."DocumentType_new");
ALTER TYPE "public"."DocumentType" RENAME TO "DocumentType_old";
ALTER TYPE "public"."DocumentType_new" RENAME TO "DocumentType";
DROP TYPE "public"."DocumentType_old";
ALTER TABLE "public"."documents" ALTER COLUMN "type" SET DEFAULT 'OTHER';
COMMIT;

-- AlterEnum
ALTER TYPE "public"."FeeFrequency" ADD VALUE 'TERMINAL';

-- DropForeignKey
ALTER TABLE "public"."curricula" DROP CONSTRAINT "curricula_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."curricula" DROP CONSTRAINT "curricula_globalCurriculumId_fkey";

-- DropForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" DROP CONSTRAINT "curriculum_progress_trackers_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" DROP CONSTRAINT "curriculum_progress_trackers_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" DROP CONSTRAINT "curriculum_progress_trackers_curriculumId_fkey";

-- DropForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" DROP CONSTRAINT "curriculum_progress_trackers_globalCurriculumId_fkey";

-- DropForeignKey
ALTER TABLE "public"."global_curriculum_subjects" DROP CONSTRAINT "global_curriculum_subjects_globalCurriculumId_fkey";

-- DropIndex
DROP INDEX "public"."curriculum_progress_trackers_studentId_curriculumId_academi_key";

-- AlterTable
ALTER TABLE "public"."class_curricula" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."content_modules" DROP COLUMN "activities",
DROP COLUMN "chapter",
DROP COLUMN "content",
DROP COLUMN "createdAt",
DROP COLUMN "duration",
DROP COLUMN "title",
DROP COLUMN "unit",
DROP COLUMN "updatedAt",
ADD COLUMN     "estimatedHours" INTEGER,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."curricula" DROP COLUMN "analytics",
DROP COLUMN "globalCurriculumId",
DROP COLUMN "lastReviewDate",
DROP COLUMN "nextReviewDate",
DROP COLUMN "originalTemplate",
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "createdBy" SET NOT NULL,
DROP COLUMN "customizationLevel",
ADD COLUMN     "customizationLevel" TEXT,
DROP COLUMN "implementationStatus",
ADD COLUMN     "implementationStatus" TEXT;

-- AlterTable
ALTER TABLE "public"."curriculum_progress_trackers" DROP COLUMN "createdAt",
DROP COLUMN "currentGrade",
DROP COLUMN "expectedProgression",
DROP COLUMN "globalCurriculumId",
DROP COLUMN "lastAssessmentDate",
DROP COLUMN "learningOutcomes",
DROP COLUMN "nextMilestoneDate",
DROP COLUMN "recommendations",
DROP COLUMN "skillsDevelopment",
DROP COLUMN "strengths",
DROP COLUMN "updatedAt",
DROP COLUMN "weaknesses",
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "curriculumId" SET NOT NULL,
DROP COLUMN "progressionStatus",
ADD COLUMN     "progressionStatus" TEXT NOT NULL DEFAULT 'ON_TRACK';

-- AlterTable
ALTER TABLE "public"."curriculum_subjects" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "term" SET DATA TYPE TEXT,
ALTER COLUMN "prerequisites" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."learning_objectives" DROP COLUMN "assessmentCriteria",
DROP COLUMN "bloomLevel",
DROP COLUMN "createdAt",
DROP COLUMN "expectedOutcome",
DROP COLUMN "title",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
ADD COLUMN     "bloomsLevel" TEXT,
ADD COLUMN     "code" TEXT,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."schools" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "paystackSubaccountCode" TEXT,
ADD COLUMN     "paystackSubaccountId" TEXT;

-- AlterTable
ALTER TABLE "public"."staff" ADD COLUMN     "performanceMetrics" JSONB,
ADD COLUMN     "professionalDevelopment" JSONB,
ADD COLUMN     "specializations" TEXT[],
ADD COLUMN     "teachingMetrics" JSONB,
ADD COLUMN     "teachingStyle" JSONB;

-- AlterTable
ALTER TABLE "public"."students" DROP COLUMN "admissionTestScore",
DROP COLUMN "applicationDate",
DROP COLUMN "behavioralNotes",
DROP COLUMN "documentsSubmitted",
DROP COLUMN "feesPaid",
DROP COLUMN "identificationDocs",
DROP COLUMN "immunizations",
DROP COLUMN "interviewDate",
DROP COLUMN "medicalInfo",
DROP COLUMN "photographs",
DROP COLUMN "previousAcademicRecord",
DROP COLUMN "scholarshipInfo",
DROP COLUMN "socialBackground",
DROP COLUMN "transportInfo",
ADD COLUMN     "aiRecommendations" JSONB,
ADD COLUMN     "assignmentCompletionRate" DOUBLE PRECISION,
ADD COLUMN     "attendancePercentage" DOUBLE PRECISION,
ADD COLUMN     "averageGradePoint" DOUBLE PRECISION,
ADD COLUMN     "behavioralPatterns" JSONB,
ADD COLUMN     "engagementMetrics" JSONB,
ADD COLUMN     "lastRiskAssessment" TIMESTAMP(3),
ADD COLUMN     "learningPreferences" JSONB,
ADD COLUMN     "participationScore" DOUBLE PRECISION,
ADD COLUMN     "performanceHistory" JSONB,
ADD COLUMN     "riskScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingData" JSONB,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "passwordResetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiry" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."global_curricula";

-- DropTable
DROP TABLE "public"."global_curriculum_subjects";

-- DropEnum
DROP TYPE "public"."BloomLevel";

-- DropEnum
DROP TYPE "public"."CurriculumStatus";

-- DropEnum
DROP TYPE "public"."CurriculumType";

-- DropEnum
DROP TYPE "public"."ObjectiveType";

-- CreateTable
CREATE TABLE "public"."qualifications" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "yearObtained" INTEGER,
    "grade" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_snapshots" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "academicYearId" TEXT NOT NULL,
    "termId" TEXT,
    "gpa" DOUBLE PRECISION,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "subjectScores" JSONB NOT NULL,
    "classRank" INTEGER,
    "classSize" INTEGER,
    "attendanceRate" DOUBLE PRECISION NOT NULL,
    "participationRate" DOUBLE PRECISION NOT NULL,
    "assignmentsCompleted" INTEGER NOT NULL,
    "assignmentsTotal" INTEGER NOT NULL,
    "completionRate" DOUBLE PRECISION NOT NULL,
    "conductGrade" TEXT,
    "disciplinaryIncidents" INTEGER NOT NULL DEFAULT 0,
    "positiveRemarks" INTEGER NOT NULL DEFAULT 0,
    "strengthAreas" TEXT[],
    "weaknessAreas" TEXT[],
    "riskLevel" TEXT,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "performance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."learning_activities" (
    "id" TEXT NOT NULL,
    "activityType" "public"."LearningActivityType" NOT NULL,
    "studentId" TEXT,
    "staffId" TEXT,
    "subjectId" TEXT,
    "classId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "timeSpent" INTEGER,
    "interactionData" JSONB,
    "difficultyLevel" TEXT,
    "completionStatus" TEXT NOT NULL,
    "deviceType" TEXT,
    "location" JSONB,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "termId" TEXT,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "passingScore" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
    "latePenalty" DOUBLE PRECISION,
    "maxAttempts" INTEGER,
    "allowedFileTypes" TEXT[],
    "maxFileSize" INTEGER,
    "maxFiles" INTEGER NOT NULL DEFAULT 5,
    "autoGrade" BOOLEAN NOT NULL DEFAULT false,
    "plagiarismCheck" BOOLEAN NOT NULL DEFAULT false,
    "aiAssisted" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "rubric" JSONB,
    "gradingCriteria" JSONB,
    "status" "public"."AssignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assignment_submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "daysLate" INTEGER NOT NULL DEFAULT 0,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT,
    "files" JSONB,
    "links" TEXT[],
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,
    "grade" TEXT,
    "feedback" TEXT,
    "rubricScores" JSONB,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "gradedAt" TIMESTAMP(3),
    "gradedById" TEXT,
    "plagiarismScore" DOUBLE PRECISION,
    "plagiarismReport" JSONB,
    "aiSuggestions" JSONB,
    "autoGraded" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER,
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "lastEditedAt" TIMESTAMP(3),
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."data_consents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT,
    "consentType" "public"."ConsentType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "data_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationType" "public"."ConversationType" NOT NULL DEFAULT 'FAQ',
    "status" "public"."ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "title" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "public"."MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "intentDetected" TEXT,
    "confidence" DOUBLE PRECISION,
    "suggestedActions" JSONB,
    "metadata" JSONB,
    "wasHelpful" BOOLEAN,
    "feedbackText" TEXT,
    "aiModel" TEXT,
    "tokensUsed" INTEGER,
    "responseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."knowledge_base" (
    "id" TEXT NOT NULL,
    "category" "public"."KnowledgeCategory" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT[],
    "relatedQuestions" TEXT[],
    "metadata" JSONB,
    "views" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "schoolId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatbot_analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION,
    "satisfactionRate" DOUBLE PRECISION,
    "topIntents" JSONB,
    "topQuestions" JSONB,
    "unhandledQueries" JSONB,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" "public"."NotificationRuleType" NOT NULL,
    "conditions" JSONB NOT NULL,
    "priority" "public"."NotificationPriority" NOT NULL,
    "channels" "public"."NotificationChannel"[],
    "template" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "lastTriggered" TIMESTAMP(3),
    "schoolId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_intelligence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredTime" JSONB,
    "preferredChannels" TEXT[],
    "readRate" DOUBLE PRECISION,
    "avgResponseTime" INTEGER,
    "topicPreferences" JSONB,
    "mutedTopics" TEXT[],
    "lastAnalyzed" TIMESTAMP(3),
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_digests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "digestType" "public"."DigestType" NOT NULL,
    "frequency" "public"."DigestFrequency" NOT NULL,
    "content" JSONB NOT NULL,
    "notificationIds" TEXT[],
    "sentAt" TIMESTAMP(3),
    "status" "public"."DigestStatus" NOT NULL DEFAULT 'PENDING',
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_digests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_patterns" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "patternType" "public"."PatternType" NOT NULL,
    "severity" "public"."PatternSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "dayPattern" JSONB,
    "timePattern" JSONB,
    "subjectPattern" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL,
    "recommendations" JSONB,
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "alertSentAt" TIMESTAMP(3),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "notes" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_insights" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "classId" TEXT,
    "insightType" "public"."InsightType" NOT NULL,
    "insight" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "actionable" BOOLEAN NOT NULL DEFAULT false,
    "actions" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP(3),
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."performance_predictions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT,
    "predictionType" "public"."PredictionType" NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "predictedValue" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timeframe" TEXT NOT NULL,
    "factors" JSONB NOT NULL,
    "recommendations" JSONB,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "actualValue" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "modelVersion" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."risk_assessments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "riskType" "public"."RiskType" NOT NULL,
    "riskLevel" "public"."RiskLevel" NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "factors" JSONB NOT NULL,
    "indicators" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "interventions" JSONB,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."topics" (
    "id" TEXT NOT NULL,
    "curriculumSubjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "parentTopicId" TEXT,
    "estimatedHours" INTEGER,
    "difficultyLevel" TEXT,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."concepts" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bloomsLevel" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isCore" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_topic_coverage" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termId" TEXT,
    "academicYearId" TEXT NOT NULL,
    "teacherId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "plannedHours" INTEGER,
    "actualHours" DOUBLE PRECISION,
    "notes" TEXT,
    "resources" JSONB,

    CONSTRAINT "class_topic_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_topic_progress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3),
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "student_topic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_concept_mastery" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "topicProgressId" TEXT,
    "masteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NOVICE',
    "lastAssessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,
    "trend" TEXT,

    CONSTRAINT "student_concept_mastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mastery_evidence" (
    "id" TEXT NOT NULL,
    "masteryId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "aiAnalysis" JSONB,

    CONSTRAINT "mastery_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fee_structures" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "frequency" "public"."FeeFrequency" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gradeLevel" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_invoices" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "academicYearId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "gradeLevel" TEXT,
    "classId" TEXT,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."master_invoice_items" (
    "id" TEXT NOT NULL,
    "masterInvoiceId" TEXT NOT NULL,
    "feeStructureId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "master_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "masterInvoiceId" TEXT,
    "academicYear" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(10,2) NOT NULL,
    "hasCustomItems" BOOLEAN NOT NULL DEFAULT false,
    "discountReason" TEXT,
    "lastReminderDate" TIMESTAMP(3),
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "feeStructureId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "referenceNumber" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "processedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_reminders" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "sentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "public"."ReminderMethod" NOT NULL,
    "status" "public"."ReminderStatus" NOT NULL,

    CONSTRAINT "payment_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounting_categories" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."AccountingType" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."income_transactions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "paymentId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "totalAmount" DECIMAL(10,2),
    "platformFee" DECIMAL(10,2),
    "platformFeePercentage" DECIMAL(5,2),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "income_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expenditure_transactions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "payee" TEXT NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "receiptUrl" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" "public"."ExpenditureStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenditure_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "performance_snapshots_studentId_snapshotDate_key" ON "public"."performance_snapshots"("studentId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignmentId_studentId_attemptNumber_key" ON "public"."assignment_submissions"("assignmentId", "studentId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_analytics_schoolId_date_key" ON "public"."chatbot_analytics"("schoolId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "notification_intelligence_userId_schoolId_key" ON "public"."notification_intelligence"("userId", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "class_topic_coverage_classId_topicId_academicYearId_termId_key" ON "public"."class_topic_coverage"("classId", "topicId", "academicYearId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "student_topic_progress_studentId_topicId_classId_key" ON "public"."student_topic_progress"("studentId", "topicId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "student_concept_mastery_studentId_conceptId_key" ON "public"."student_concept_mastery"("studentId", "conceptId");

-- CreateIndex
CREATE INDEX "fee_structures_schoolId_idx" ON "public"."fee_structures"("schoolId");

-- CreateIndex
CREATE INDEX "fee_structures_academicYearId_idx" ON "public"."fee_structures"("academicYearId");

-- CreateIndex
CREATE INDEX "fee_structures_isActive_idx" ON "public"."fee_structures"("isActive");

-- CreateIndex
CREATE INDEX "fee_structures_gradeLevel_idx" ON "public"."fee_structures"("gradeLevel");

-- CreateIndex
CREATE INDEX "master_invoices_schoolId_idx" ON "public"."master_invoices"("schoolId");

-- CreateIndex
CREATE INDEX "master_invoices_academicYearId_idx" ON "public"."master_invoices"("academicYearId");

-- CreateIndex
CREATE INDEX "master_invoices_classId_idx" ON "public"."master_invoices"("classId");

-- CreateIndex
CREATE INDEX "master_invoices_isActive_idx" ON "public"."master_invoices"("isActive");

-- CreateIndex
CREATE INDEX "master_invoice_items_masterInvoiceId_idx" ON "public"."master_invoice_items"("masterInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "public"."invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_schoolId_studentId_idx" ON "public"."invoices"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "invoices_masterInvoiceId_idx" ON "public"."invoices"("masterInvoiceId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "public"."invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_dueDate_idx" ON "public"."invoices"("dueDate");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "public"."invoice_items"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentNumber_key" ON "public"."payments"("paymentNumber");

-- CreateIndex
CREATE INDEX "payments_schoolId_studentId_idx" ON "public"."payments"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "public"."payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "public"."payments"("paymentDate");

-- CreateIndex
CREATE INDEX "payment_reminders_invoiceId_idx" ON "public"."payment_reminders"("invoiceId");

-- CreateIndex
CREATE INDEX "accounting_categories_schoolId_type_idx" ON "public"."accounting_categories"("schoolId", "type");

-- CreateIndex
CREATE INDEX "income_transactions_schoolId_date_idx" ON "public"."income_transactions"("schoolId", "date");

-- CreateIndex
CREATE INDEX "income_transactions_categoryId_idx" ON "public"."income_transactions"("categoryId");

-- CreateIndex
CREATE INDEX "income_transactions_paymentId_idx" ON "public"."income_transactions"("paymentId");

-- CreateIndex
CREATE INDEX "expenditure_transactions_schoolId_date_idx" ON "public"."expenditure_transactions"("schoolId", "date");

-- CreateIndex
CREATE INDEX "expenditure_transactions_categoryId_idx" ON "public"."expenditure_transactions"("categoryId");

-- CreateIndex
CREATE INDEX "expenditure_transactions_status_idx" ON "public"."expenditure_transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_progress_trackers_studentId_curriculumId_classId_key" ON "public"."curriculum_progress_trackers"("studentId", "curriculumId", "classId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_paystackSubaccountCode_key" ON "public"."schools"("paystackSubaccountCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "public"."users"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "public"."users"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_refreshToken_key" ON "public"."users"("refreshToken");

-- AddForeignKey
ALTER TABLE "public"."qualifications" ADD CONSTRAINT "qualifications_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_snapshots" ADD CONSTRAINT "performance_snapshots_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_snapshots" ADD CONSTRAINT "performance_snapshots_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_snapshots" ADD CONSTRAINT "performance_snapshots_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_snapshots" ADD CONSTRAINT "performance_snapshots_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_activities" ADD CONSTRAINT "learning_activities_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_activities" ADD CONSTRAINT "learning_activities_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_activities" ADD CONSTRAINT "learning_activities_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_activities" ADD CONSTRAINT "learning_activities_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_activities" ADD CONSTRAINT "learning_activities_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignments" ADD CONSTRAINT "assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignments" ADD CONSTRAINT "assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignments" ADD CONSTRAINT "assignments_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignments" ADD CONSTRAINT "assignments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignments" ADD CONSTRAINT "assignments_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignments" ADD CONSTRAINT "assignments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_submissions" ADD CONSTRAINT "assignment_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_submissions" ADD CONSTRAINT "assignment_submissions_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_submissions" ADD CONSTRAINT "assignment_submissions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_consents" ADD CONSTRAINT "data_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_consents" ADD CONSTRAINT "data_consents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."data_consents" ADD CONSTRAINT "data_consents_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_conversations" ADD CONSTRAINT "chat_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_conversations" ADD CONSTRAINT "chat_conversations_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."knowledge_base" ADD CONSTRAINT "knowledge_base_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatbot_analytics" ADD CONSTRAINT "chatbot_analytics_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_rules" ADD CONSTRAINT "notification_rules_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_rules" ADD CONSTRAINT "notification_rules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_intelligence" ADD CONSTRAINT "notification_intelligence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_intelligence" ADD CONSTRAINT "notification_intelligence_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_digests" ADD CONSTRAINT "notification_digests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_digests" ADD CONSTRAINT "notification_digests_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_patterns" ADD CONSTRAINT "attendance_patterns_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_patterns" ADD CONSTRAINT "attendance_patterns_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_insights" ADD CONSTRAINT "attendance_insights_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_insights" ADD CONSTRAINT "attendance_insights_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_insights" ADD CONSTRAINT "attendance_insights_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_predictions" ADD CONSTRAINT "performance_predictions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_predictions" ADD CONSTRAINT "performance_predictions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."performance_predictions" ADD CONSTRAINT "performance_predictions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_assessments" ADD CONSTRAINT "risk_assessments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_assessments" ADD CONSTRAINT "risk_assessments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curricula" ADD CONSTRAINT "curricula_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topics" ADD CONSTRAINT "topics_curriculumSubjectId_fkey" FOREIGN KEY ("curriculumSubjectId") REFERENCES "public"."curriculum_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."topics" ADD CONSTRAINT "topics_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "public"."topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."concepts" ADD CONSTRAINT "concepts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_topic_coverage" ADD CONSTRAINT "class_topic_coverage_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_topic_coverage" ADD CONSTRAINT "class_topic_coverage_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_topic_coverage" ADD CONSTRAINT "class_topic_coverage_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_topic_coverage" ADD CONSTRAINT "class_topic_coverage_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_topic_coverage" ADD CONSTRAINT "class_topic_coverage_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_topic_coverage" ADD CONSTRAINT "class_topic_coverage_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_topic_progress" ADD CONSTRAINT "student_topic_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_topic_progress" ADD CONSTRAINT "student_topic_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "public"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_topic_progress" ADD CONSTRAINT "student_topic_progress_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_concept_mastery" ADD CONSTRAINT "student_concept_mastery_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_concept_mastery" ADD CONSTRAINT "student_concept_mastery_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "public"."concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_concept_mastery" ADD CONSTRAINT "student_concept_mastery_topicProgressId_fkey" FOREIGN KEY ("topicProgressId") REFERENCES "public"."student_topic_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mastery_evidence" ADD CONSTRAINT "mastery_evidence_masteryId_fkey" FOREIGN KEY ("masteryId") REFERENCES "public"."student_concept_mastery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" ADD CONSTRAINT "curriculum_progress_trackers_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" ADD CONSTRAINT "curriculum_progress_trackers_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_progress_trackers" ADD CONSTRAINT "curriculum_progress_trackers_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_structures" ADD CONSTRAINT "fee_structures_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fee_structures" ADD CONSTRAINT "fee_structures_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."master_invoices" ADD CONSTRAINT "master_invoices_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."master_invoices" ADD CONSTRAINT "master_invoices_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."master_invoices" ADD CONSTRAINT "master_invoices_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."master_invoice_items" ADD CONSTRAINT "master_invoice_items_masterInvoiceId_fkey" FOREIGN KEY ("masterInvoiceId") REFERENCES "public"."master_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."master_invoice_items" ADD CONSTRAINT "master_invoice_items_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "public"."fee_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_masterInvoiceId_fkey" FOREIGN KEY ("masterInvoiceId") REFERENCES "public"."master_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice_items" ADD CONSTRAINT "invoice_items_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "public"."fee_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_reminders" ADD CONSTRAINT "payment_reminders_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_reminders" ADD CONSTRAINT "payment_reminders_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounting_categories" ADD CONSTRAINT "accounting_categories_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."income_transactions" ADD CONSTRAINT "income_transactions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."income_transactions" ADD CONSTRAINT "income_transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."accounting_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."income_transactions" ADD CONSTRAINT "income_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenditure_transactions" ADD CONSTRAINT "expenditure_transactions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenditure_transactions" ADD CONSTRAINT "expenditure_transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."accounting_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
