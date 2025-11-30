# Phase 1 Implementation Plan: AI Foundation (Months 1-3)

## Overview
Build the data foundation and infrastructure necessary for AI-powered features, focusing on metadata enrichment, analytics infrastructure, and initial assignment submission system.

---

## Progress Tracker

### Milestone 1: Enhanced Student/Teacher Profiles with Metadata (Weeks 1-4)
- [ ] Update Student model with AI/Analytics metadata
- [ ] Update Staff model with teaching analytics
- [ ] Create PerformanceSnapshot model
- [ ] Create LearningActivity model
- [ ] Run database migrations
- [ ] Update seed.js with sample analytics data
- [ ] Update TypeScript types in frontend

### Milestone 2: Assignment Submission System (Weeks 3-6)
- [ ] Create Assignment model
- [ ] Create AssignmentSubmission model
- [ ] Build backend APIs for assignments
- [ ] Build assignment creation form (frontend)
- [ ] Build assignment list views
- [ ] Build submission interface
- [ ] Build grading interface

### Milestone 3: Analytics Dashboard Infrastructure (Weeks 5-8)
- [ ] Create AnalyticsService
- [ ] Create PerformanceCalculator
- [ ] Create SnapshotGenerator
- [ ] Create DataAggregator
- [ ] Build analytics API endpoints
- [ ] Create analytics dashboard UI
- [ ] Add charts and visualizations

### Milestone 4: Historical Data & Reporting (Weeks 7-10)
- [ ] Create data enrichment scripts
- [ ] Set up scheduled jobs (node-cron/bull)
- [ ] Build reporting API endpoints
- [ ] Create export functionality (PDF/CSV)
- [ ] Generate historical snapshots

### Milestone 5: Parent Portal Enhancement (Weeks 9-11)
- [ ] Build parent dashboard UI
- [ ] Create parent-specific APIs
- [ ] Implement notification system
- [ ] Add email digest feature

### Milestone 6: Data Quality & Privacy (Weeks 10-12)
- [ ] Create DataConsent model
- [ ] Implement privacy controls
- [ ] Create data export functionality
- [ ] Add audit logging
- [ ] Build consent management UI

---

## Milestone 1: Enhanced Student/Teacher Profiles with Metadata (Weeks 1-4)

### 1.1 Database Schema Updates

#### Student Profile Enhancements
```prisma
model Student {
  // ... existing fields ...

  // AI/Analytics Metadata
  learningPreferences     Json?          // learning style, pace, preferred subjects
  engagementMetrics       Json?          // participation rate, assignment completion, etc.
  performanceHistory      Json?          // historical trends, strengths, weaknesses
  behavioralPatterns      Json?          // attendance patterns, conduct trends
  aiRecommendations       Json?          // AI-generated recommendations
  riskScore               Float?         // dropout/failure risk score (0-100)
  lastRiskAssessment      DateTime?

  // Learning Analytics
  averageGradePoint       Float?
  attendancePercentage    Float?
  assignmentCompletionRate Float?
  participationScore      Float?

  // Relations for new features
  assignmentSubmissions   AssignmentSubmission[]
  learningActivities      LearningActivity[]
  performanceSnapshots    PerformanceSnapshot[]
}
```

#### Staff/Teacher Profile Enhancements
```prisma
model Staff {
  // ... existing fields ...

  // Teaching Analytics
  teachingMetrics         Json?          // effectiveness ratings, student outcomes
  specializations         String[]       // subject expertise
  teachingStyle           Json?          // methods, preferences
  professionalDevelopment Json?          // certifications, training
  performanceMetrics      Json?          // student pass rates, engagement

  // Relations
  assignmentsCreated      Assignment[]
  learningActivities      LearningActivity[]
}
```

#### New Analytics Models

**PerformanceSnapshot Model**
```prisma
model PerformanceSnapshot {
  id                String    @id @default(uuid())
  studentId         String
  snapshotDate      DateTime  @default(now())
  academicYearId    String
  termId            String?

  // Academic Metrics
  gpa               Float?
  averageScore      Float
  subjectScores     Json      // { subjectId: { score, grade, trend } }
  classRank         Int?
  classSize         Int?

  // Engagement Metrics
  attendanceRate    Float
  participationRate Float
  assignmentsCompleted Int
  assignmentsTotal  Int
  completionRate    Float

  // Behavioral Metrics
  conductGrade      String?
  disciplinaryIncidents Int @default(0)
  positiveRemarks   Int @default(0)

  // AI Insights
  strengthAreas     String[]  // subject IDs or topics
  weaknessAreas     String[]
  riskLevel         String?   // LOW, MODERATE, HIGH, CRITICAL
  recommendations   Json?

  // Timestamps
  createdAt         DateTime  @default(now())

  // Relations
  student           Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  academicYear      AcademicYear @relation(fields: [academicYearId], references: [id])
  term              Term?     @relation(fields: [termId], references: [id])
  schoolId          String
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  @@unique([studentId, snapshotDate])
  @@map("performance_snapshots")
}
```

**LearningActivity Model**
```prisma
model LearningActivity {
  id                String              @id @default(uuid())
  activityType      LearningActivityType
  studentId         String?
  staffId           String?
  subjectId         String?
  classId           String?

  // Activity Details
  title             String
  description       String?
  duration          Int?                // minutes
  startedAt         DateTime?
  completedAt       DateTime?

  // Performance Data
  score             Float?
  maxScore          Float?
  attempts          Int                 @default(1)
  timeSpent         Int?                // seconds

  // Analytics
  interactionData   Json?               // clicks, scrolls, pauses
  difficultyLevel   String?             // EASY, MEDIUM, HARD
  completionStatus  String              // STARTED, IN_PROGRESS, COMPLETED, ABANDONED

  // Metadata
  deviceType        String?
  location          Json?
  schoolId          String
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // Relations
  student           Student?            @relation(fields: [studentId], references: [id])
  staff             Staff?              @relation(fields: [staffId], references: [id])
  subject           Subject?            @relation(fields: [subjectId], references: [id])
  class             Class?              @relation(fields: [classId], references: [id])
  school            School              @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  @@map("learning_activities")
}

enum LearningActivityType {
  ASSIGNMENT_SUBMISSION
  ASSESSMENT_ATTEMPT
  CONTENT_VIEW
  RESOURCE_DOWNLOAD
  DISCUSSION_POST
  VIDEO_WATCH
  PRACTICE_EXERCISE
  QUIZ_ATTEMPT
  READING_ACTIVITY
  PROJECT_WORK
}
```

---

## Milestone 2: Assignment Submission System (Weeks 3-6)

### 2.1 Assignment Model
```prisma
model Assignment {
  id                String              @id @default(uuid())
  title             String
  description       String?
  instructions      String?

  // Assignment Details
  subjectId         String
  classId           String
  staffId           String              // creator
  academicYearId    String
  termId            String?

  // Scheduling
  assignedDate      DateTime            @default(now())
  dueDate           DateTime
  availableFrom     DateTime?
  availableUntil    DateTime?

  // Configuration
  maxScore          Float               @default(100)
  passingScore      Float?
  weight            Float               @default(1.0)
  allowLateSubmission Boolean           @default(false)
  latePenalty       Float?              // percentage deduction per day
  maxAttempts       Int?

  // File Settings
  allowedFileTypes  String[]
  maxFileSize       Int?                // in MB
  maxFiles          Int                 @default(5)

  // AI Features
  autoGrade         Boolean             @default(false)
  plagiarismCheck   Boolean             @default(false)
  aiAssisted        Boolean             @default(false)

  // Metadata
  attachments       Json?
  rubric            Json?
  gradingCriteria   Json?
  status            AssignmentStatus    @default(DRAFT)

  schoolId          String
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // Relations
  subject           Subject             @relation(fields: [subjectId], references: [id])
  class             Class               @relation(fields: [classId], references: [id])
  staff             Staff               @relation(fields: [staffId], references: [id])
  academicYear      AcademicYear        @relation(fields: [academicYearId], references: [id])
  term              Term?               @relation(fields: [termId], references: [id])
  school            School              @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  submissions       AssignmentSubmission[]

  @@map("assignments")
}

model AssignmentSubmission {
  id                String              @id @default(uuid())
  assignmentId      String
  studentId         String

  // Submission Details
  submittedAt       DateTime            @default(now())
  isLate            Boolean             @default(false)
  daysLate          Int                 @default(0)
  attemptNumber     Int                 @default(1)

  // Content
  content           String?             // text submission
  files             Json?               // array of file metadata
  links             String[]            // external links

  // Grading
  score             Float?
  maxScore          Float
  percentage        Float?
  grade             String?
  feedback          String?
  rubricScores      Json?

  // Status
  status            SubmissionStatus    @default(SUBMITTED)
  gradedAt          DateTime?
  gradedById        String?

  // AI Features
  plagiarismScore   Float?
  plagiarismReport  Json?
  aiSuggestions     Json?
  autoGraded        Boolean             @default(false)

  // Analytics
  timeSpent         Int?                // seconds
  editCount         Int                 @default(0)
  lastEditedAt      DateTime?

  schoolId          String
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // Relations
  assignment        Assignment          @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student           Student             @relation(fields: [studentId], references: [id], onDelete: Cascade)
  gradedBy          User?               @relation("SubmissionGradedBy", fields: [gradedById], references: [id])
  school            School              @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  @@unique([assignmentId, studentId, attemptNumber])
  @@map("assignment_submissions")
}

enum AssignmentStatus {
  DRAFT
  PUBLISHED
  ACTIVE
  CLOSED
  ARCHIVED
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  GRADING
  GRADED
  RETURNED
  RESUBMITTED
  LATE
  MISSING
}
```

### 2.2 Backend API Endpoints
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - List assignments (filtered by role)
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment
- `POST /api/assignments/:id/publish` - Publish assignment
- `POST /api/assignments/:id/submit` - Submit assignment
- `GET /api/assignments/:id/submissions` - Get all submissions
- `PUT /api/assignments/:assignmentId/submissions/:id/grade` - Grade submission

### 2.3 Frontend Components
- `AssignmentForm.tsx` - Create/edit assignments
- `AssignmentList.tsx` - List view for teachers/students
- `AssignmentDetails.tsx` - View assignment details
- `SubmissionForm.tsx` - Student submission interface
- `SubmissionList.tsx` - Teacher view of submissions
- `GradingInterface.tsx` - Grade submissions

---

## Milestone 3: Analytics Dashboard Infrastructure (Weeks 5-8)

### 3.1 Backend Service Structure
```
backend/
  services/
    analytics/
      AnalyticsService.js       // Main service
      PerformanceCalculator.js  // Calculate metrics
      SnapshotGenerator.js      // Generate snapshots
      DataAggregator.js         // Aggregate data
```

### 3.2 Key Service Functions
```javascript
// AnalyticsService.js
class AnalyticsService {
  // Generate student performance snapshot
  async generateStudentSnapshot(studentId, termId)

  // Calculate student risk score
  async calculateRiskScore(studentId)

  // Get student performance trends
  async getPerformanceTrends(studentId, period)

  // Get class analytics
  async getClassAnalytics(classId, subjectId)

  // Get teacher effectiveness metrics
  async getTeacherMetrics(staffId)

  // Get subject performance distribution
  async getSubjectAnalytics(subjectId, classId)
}
```

### 3.3 Analytics API Endpoints
- `GET /api/analytics/student/:id` - Student analytics
- `GET /api/analytics/student/:id/trends` - Performance trends
- `GET /api/analytics/student/:id/risk` - Risk assessment
- `GET /api/analytics/class/:id` - Class analytics
- `GET /api/analytics/subject/:id` - Subject analytics
- `GET /api/analytics/teacher/:id` - Teacher metrics
- `POST /api/analytics/snapshots/generate` - Trigger snapshot generation

### 3.4 Frontend Components
```
frontend/src/
  pages/
    analytics/
      AnalyticsDashboard.tsx        // Main dashboard
      StudentAnalytics.tsx          // Individual student view
      ClassAnalytics.tsx            // Class performance
      SubjectAnalytics.tsx          // Subject-wise analysis
      TeacherAnalytics.tsx          // Teacher effectiveness
  components/
    analytics/
      PerformanceChart.tsx          // Line/bar charts
      RiskIndicator.tsx             // Risk visualization
      TrendAnalysis.tsx             // Trend display
      ComparativeAnalysis.tsx       // Student vs class
      MetricsCard.tsx               // Key metric cards
```

### 3.5 Dashboard Features
- Real-time performance metrics
- Grade trends over time
- Attendance patterns
- Assignment completion rates
- Risk indicators
- Subject-wise breakdown
- Comparative analysis (student vs. class average)

---

## Milestone 4: Historical Data & Reporting (Weeks 7-10)

### 4.1 Data Migration & Enrichment
```javascript
// backend/scripts/enrichHistoricalData.js
async function enrichHistoricalData() {
  // 1. Generate performance snapshots from existing grades
  // 2. Calculate engagement metrics from attendance
  // 3. Populate learning preferences from subject performance
  // 4. Calculate risk scores for at-risk students
}
```

### 4.2 Scheduled Jobs
```javascript
// backend/jobs/analyticsJobs.js
export const scheduledJobs = [
  {
    name: 'daily-snapshot',
    schedule: '0 2 * * *', // 2 AM daily
    job: generateDailySnapshots
  },
  {
    name: 'weekly-analytics',
    schedule: '0 3 * * 0', // 3 AM Sunday
    job: generateWeeklyAnalytics
  },
  {
    name: 'risk-assessment',
    schedule: '0 4 * * 1', // 4 AM Monday
    job: assessStudentRisks
  }
]
```

### 4.3 Reporting APIs
- `GET /api/reports/performance` - Performance reports
- `GET /api/reports/attendance` - Attendance reports
- `GET /api/reports/class/:id` - Class reports
- `POST /api/reports/export` - Export reports (PDF/CSV)

---

## Milestone 5: Parent Portal Enhancement (Weeks 9-11)

### 5.1 Parent Dashboard Features
- Student performance overview
- Recent grades and assignments
- Attendance summary
- Upcoming assignments/assessments
- Teacher feedback
- Progress trends

### 5.2 Components
```
frontend/src/
  pages/
    parent/
      ParentDashboard.tsx
      StudentProgress.tsx
      AttendanceView.tsx
      AssignmentTracking.tsx
      TeacherCommunication.tsx
```

### 5.3 Notification Triggers
- Assignment submission
- Grade posted
- Attendance marked (absent/late)
- Low performance alert
- Upcoming due dates
- Teacher comments

### 5.4 Parent APIs
- `GET /api/parent/dashboard` - Parent dashboard data
- `GET /api/parent/students/:id/progress` - Student progress
- `GET /api/parent/students/:id/assignments` - Student assignments
- `GET /api/parent/notifications` - Parent notifications

---

## Milestone 6: Data Quality & Privacy (Weeks 10-12)

### 6.1 Data Consent Model
```prisma
model DataConsent {
  id              String      @id @default(uuid())
  userId          String
  studentId       String?
  consentType     ConsentType
  purpose         String
  granted         Boolean     @default(false)
  grantedAt       DateTime?
  revokedAt       DateTime?
  expiresAt       DateTime?
  metadata        Json?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User        @relation(fields: [userId], references: [id])
  student         Student?    @relation(fields: [studentId], references: [id])
  schoolId        String
  school          School      @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  @@map("data_consents")
}

enum ConsentType {
  AI_ANALYTICS
  PERFORMANCE_TRACKING
  PERSONALIZED_LEARNING
  PARENT_DATA_SHARING
  RESEARCH_PARTICIPATION
}
```

### 6.2 Privacy Features
- Opt-in for AI features
- Data anonymization for analytics
- Access logs
- Data export (GDPR compliance)
- Consent management

### 6.3 Privacy APIs
- `GET /api/privacy/consents` - Get user consents
- `POST /api/privacy/consents` - Grant consent
- `DELETE /api/privacy/consents/:id` - Revoke consent
- `GET /api/privacy/data-export` - Export user data
- `GET /api/privacy/audit-log` - Access audit log

---

## Technical Infrastructure

### Backend Technologies
- **Node.js + Express** (existing)
- **Prisma ORM** (existing)
- **PostgreSQL** (existing)
- **Redis** (existing) - for caching analytics
- **Bull Queue** - for background jobs
- **node-cron** - for scheduled tasks

### Frontend Technologies
- **React + TypeScript** (existing)
- **Recharts/Victory** - for charts
- **TanStack Query** - for data fetching
- **Zustand/Redux** - for state management

### New Dependencies

**Backend:**
```json
{
  "bull": "^4.11.0",
  "node-cron": "^3.0.0",
  "date-fns": "^2.30.0",
  "mathjs": "^11.11.0",
  "@bull-board/express": "^5.0.0"
}
```

**Frontend:**
```json
{
  "recharts": "^2.9.0",
  "@tanstack/react-query": "^5.0.0",
  "date-fns": "^2.30.0",
  "zustand": "^4.4.0"
}
```

---

## Success Metrics

### Data Quality
- ✅ 100% of active students have performance snapshots
- ✅ 90%+ assignment submission tracking
- ✅ Historical data enriched for last 2 academic years

### System Performance
- ✅ Analytics dashboard loads in <2 seconds
- ✅ Snapshot generation completes within 1 hour
- ✅ API response times <500ms

### User Adoption
- ✅ 80% of teachers use assignment system
- ✅ 60% of parents access portal monthly
- ✅ 100% of students have complete profiles

---

## Deliverables Checklist

### Database & Models
- [ ] Enhanced Student model with metadata
- [ ] Enhanced Staff model with teaching metrics
- [ ] PerformanceSnapshot model
- [ ] LearningActivity model
- [ ] Assignment & AssignmentSubmission models
- [ ] DataConsent model
- [ ] Database migrations completed
- [ ] Seed data updated

### Backend Services
- [ ] AnalyticsService implementation
- [ ] Assignment management APIs
- [ ] Submission processing APIs
- [ ] Scheduled jobs for snapshots
- [ ] Background job queue setup
- [ ] Privacy/consent APIs

### Frontend Components
- [ ] Assignment creation form
- [ ] Assignment submission interface
- [ ] Analytics dashboard
- [ ] Student performance view
- [ ] Teacher analytics view
- [ ] Parent dashboard
- [ ] Consent management UI

### Documentation
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Analytics calculation formulas
- [ ] Privacy policy updates
- [ ] User guides (teacher/parent/student)

---

## Risk Mitigation

### Data Migration Risks
- **Risk**: Data loss during migration
- **Mitigation**: Full database backup, staged migration, validation scripts

### Performance Risks
- **Risk**: Analytics queries slow down production DB
- **Mitigation**: Read replicas, caching layer, optimized queries

### Privacy Risks
- **Risk**: Unauthorized data access
- **Mitigation**: Role-based access, audit logs, encryption

### Adoption Risks
- **Risk**: Low user adoption
- **Mitigation**: Training sessions, clear documentation, gradual rollout

---

## Next Steps After Phase 1

**Phase 2 Readiness:**
- Data pipeline established ✓
- User engagement tracked ✓
- Historical trends available ✓
- Ready for AI model integration ✓

**Prepare for Phase 2:**
- Select AI/ML framework
- Set up model training environment
- Identify initial use cases (chatbot, predictions)
- Plan API integrations
