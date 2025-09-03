-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('SYSTEM', 'ACADEMIC', 'ATTENDANCE', 'EXAM_RESULT', 'FEE_REMINDER', 'ANNOUNCEMENT', 'EVENT', 'EMERGENCY', 'WELCOME', 'PASSWORD_RESET', 'GRADE_UPDATE', 'ASSIGNMENT', 'TIMETABLE_CHANGE', 'DISCIPLINARY', 'HEALTH', 'TRANSPORT', 'LIBRARY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."NotificationCategory" AS ENUM ('GENERAL', 'ACADEMIC', 'ADMINISTRATIVE', 'FINANCIAL', 'HEALTH', 'SAFETY', 'EVENTS', 'SYSTEM', 'PERSONAL');

-- CreateEnum
CREATE TYPE "public"."NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "public"."NotificationTargetType" AS ENUM ('ALL_USERS', 'SPECIFIC_USERS', 'ROLE_BASED', 'CLASS_BASED', 'COMBINED');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('DRAFT', 'PENDING', 'SCHEDULED', 'SENDING', 'SENT', 'PARTIALLY_SENT', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'REJECTED', 'RETRYING');

-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('ANDROID', 'IOS', 'WEB', 'WINDOWS', 'MACOS', 'LINUX');

-- CreateEnum
CREATE TYPE "public"."WebhookDeliveryStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'RETRYING');

-- CreateEnum
CREATE TYPE "public"."CurriculumType" AS ENUM ('STANDARD', 'CAMBRIDGE', 'IB', 'NATIONAL', 'STEM', 'ARTS', 'VOCATIONAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."CurriculumStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "public"."ObjectiveType" AS ENUM ('KNOWLEDGE', 'COMPREHENSION', 'APPLICATION', 'ANALYSIS', 'SYNTHESIS', 'EVALUATION', 'SKILL', 'ATTITUDE');

-- CreateEnum
CREATE TYPE "public"."BloomLevel" AS ENUM ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE');

-- CreateEnum
CREATE TYPE "public"."ImplementationStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."curricula" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "type" "public"."CurriculumType" NOT NULL DEFAULT 'STANDARD',
    "status" "public"."CurriculumStatus" NOT NULL DEFAULT 'DRAFT',
    "schoolId" TEXT NOT NULL,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "curricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."curriculum_subjects" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "gradeLevel" INTEGER NOT NULL,
    "term" INTEGER,
    "hoursPerWeek" INTEGER,
    "isCore" BOOLEAN NOT NULL DEFAULT true,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites" TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."learning_objectives" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."ObjectiveType" NOT NULL DEFAULT 'KNOWLEDGE',
    "bloomLevel" "public"."BloomLevel" NOT NULL DEFAULT 'REMEMBER',
    "curriculumSubjectId" TEXT NOT NULL,
    "expectedOutcome" TEXT,
    "assessmentCriteria" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "duration" INTEGER,
    "curriculumSubjectId" TEXT NOT NULL,
    "unit" TEXT,
    "chapter" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "resources" JSONB,
    "activities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_curricula" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "status" "public"."ImplementationStatus" NOT NULL DEFAULT 'PLANNED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_curricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "category" "public"."NotificationCategory" NOT NULL DEFAULT 'GENERAL',
    "channels" "public"."NotificationChannel"[],
    "templateId" TEXT,
    "templateData" JSONB,
    "targetType" "public"."NotificationTargetType" NOT NULL,
    "targetUsers" TEXT[],
    "targetRoles" TEXT[],
    "targetClasses" TEXT[],
    "scheduledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "totalTargets" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "schoolId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."NotificationType" NOT NULL,
    "category" "public"."NotificationCategory" NOT NULL,
    "emailSubject" TEXT,
    "emailContent" TEXT,
    "emailHtml" TEXT,
    "smsContent" TEXT,
    "pushTitle" TEXT,
    "pushContent" TEXT,
    "inAppContent" TEXT,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "schoolId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isDelivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "channelData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification_delivery_logs" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" "public"."NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "public"."DeliveryStatus" NOT NULL,
    "providerId" TEXT,
    "providerResponse" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "preferences" JSONB,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "quietHoursDays" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."device_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "deviceInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "schoolId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'POST',
    "headers" TEXT,
    "events" TEXT[],
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_delivery_logs" (
    "id" TEXT NOT NULL,
    "webhookSubscriptionId" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" "public"."WebhookDeliveryStatus" NOT NULL,
    "statusCode" INTEGER,
    "responseData" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "responseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "curricula_schoolId_name_version_key" ON "public"."curricula"("schoolId", "name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_subjects_curriculumId_subjectId_gradeLevel_key" ON "public"."curriculum_subjects"("curriculumId", "subjectId", "gradeLevel");

-- CreateIndex
CREATE UNIQUE INDEX "class_curricula_classId_curriculumId_academicYearId_key" ON "public"."class_curricula"("classId", "curriculumId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_schoolId_name_key" ON "public"."notification_templates"("schoolId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_userId_notificationId_key" ON "public"."user_notifications"("userId", "notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_userId_key" ON "public"."user_notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "public"."device_tokens"("token");

-- AddForeignKey
ALTER TABLE "public"."curricula" ADD CONSTRAINT "curricula_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curricula" ADD CONSTRAINT "curricula_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."learning_objectives" ADD CONSTRAINT "learning_objectives_curriculumSubjectId_fkey" FOREIGN KEY ("curriculumSubjectId") REFERENCES "public"."curriculum_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_modules" ADD CONSTRAINT "content_modules_curriculumSubjectId_fkey" FOREIGN KEY ("curriculumSubjectId") REFERENCES "public"."curriculum_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_curricula" ADD CONSTRAINT "class_curricula_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_curricula" ADD CONSTRAINT "class_curricula_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "public"."curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_curricula" ADD CONSTRAINT "class_curricula_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."notification_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_templates" ADD CONSTRAINT "notification_templates_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_templates" ADD CONSTRAINT "notification_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_notifications" ADD CONSTRAINT "user_notifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification_delivery_logs" ADD CONSTRAINT "notification_delivery_logs_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."device_tokens" ADD CONSTRAINT "device_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webhook_delivery_logs" ADD CONSTRAINT "webhook_delivery_logs_webhookSubscriptionId_fkey" FOREIGN KEY ("webhookSubscriptionId") REFERENCES "public"."webhook_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
