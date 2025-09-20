# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Recent Updates (August 2025)

### Comprehensive Notification System Implementation ⭐
A complete multi-channel notification system has been implemented with enterprise-grade features:

- **Multi-Channel Support**: Email (SendGrid + Nodemailer), SMS (Twilio/AWS SNS/Vonage), Push (Firebase/OneSignal), WebSocket (In-App), and Webhooks
- **Template Engine**: Handlebars-based templates with multi-channel content and role-specific defaults
- **User Preferences**: Granular control over notification channels, quiet hours, and category-based filtering
- **Real-time Delivery**: WebSocket integration with Socket.IO for instant in-app notifications
- **Analytics & Tracking**: Comprehensive delivery logs, read receipts, and notification statistics
- **Queue System**: Redis-based job queues for reliable delivery with retry mechanisms

### Key Notification Files Added
- `backend/services/notificationService.js` - Main orchestration service
- `backend/services/templateService.js` - Handlebars template engine with helpers
- `backend/services/notificationPreferencesService.js` - User preference management
- `backend/services/socketService.js` - WebSocket real-time communication
- `backend/services/channels/` - Individual channel implementations (email, SMS, push, in-app, webhook)
- `backend/controllers/notificationController.js` - REST API endpoints
- `backend/routes/notificationRoutes.js` - API route definitions
- `frontend/src/hooks/useNotifications.ts` - React hook for notification management
- `frontend/src/components/notifications/NotificationCenter.tsx` - UI component

### Notification System Features

#### **For School Administrators:**
- Send targeted notifications (users, roles, classes, or school-wide)
- Schedule notifications for future delivery
- Create and manage notification templates with dynamic variables
- View delivery analytics and read receipts
- Configure school-wide notification settings
- Webhook integration for external systems

#### **For End Users (Teachers, Students, Parents):**
- Granular notification preferences by channel and category
- Quiet hours configuration (time-based and day-based)
- Real-time in-app notifications with WebSocket
- Browser push notifications support
- Notification history and management
- Mark as read functionality

#### **Technical Implementation:**
- **Database Models**: 7 new models in Prisma schema for notifications, templates, preferences, delivery logs, device tokens, and webhooks
- **Environment Configuration**: 50+ environment variables for comprehensive configuration control
- **Service Architecture**: Clean separation of concerns with channel abstractions
- **Error Handling**: Comprehensive error handling with fallback mechanisms
- **Security**: JWT-based WebSocket authentication, webhook signature verification
- **Performance**: Redis queuing, batch processing, and connection pooling

### School Registration Enhancement
The school registration system has been completely overhauled with improved UX:

- **Two-step Form**: Multi-step registration with proper validation flow
- **Visual Error Indicators**: Red dot pattern for consistent error messaging
- **Data Protection**: No data saved until final validation passes
- **Real-time Validation**: Subdomain availability checking with loading states
- **Enhanced Success Page**: Redesigned confirmation with better content alignment
- **Disabled Button Feedback**: Clear reasons shown when buttons are disabled

### Development Notes for Registration Flow

- Form uses native React state management (Formik removed)
- Validation occurs on both steps before data submission  
- Success page shows comprehensive school details with proper alignment
- Auto-login functionality removed per security requirements
- Subdomain format clearly displayed throughout flow

## Project Overview

KOKOKA is a comprehensive school management system built with Node.js/Express backend and React/TypeScript frontend. The system supports multi-tenant architecture using subdomain-based school isolation.

## Commands

### Backend (from /backend directory)
- `npm run dev` - Start backend development server with nodemon
- `npm start` - Start production server
- `npm test` - Run Jest tests
- Server runs on port 5000 by default

### Frontend (from /frontend directory)  
- `npm run dev` or `npm start` - Start Vite development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture

### Multi-tenant Structure
- Schools are isolated by subdomain (e.g., `demo.domain.com`)
- Frontend detects subdomain and adds `X-School-Subdomain` header
- Backend middleware (`schoolMiddleware.js`) extracts school context
- Development uses localStorage for subdomain simulation

### Backend Architecture
- **MVC Pattern**: Controllers handle business logic, routes define endpoints
- **Database**: PostgreSQL with Prisma ORM (migrated from MongoDB)
- **Caching & Sessions**: Redis for sessions, caching, pub/sub, and job queues
- **Authentication**: JWT tokens with role-based access control + Redis sessions
- **Middleware**: Auth, school context, error handling, rate limiting
- **Services**: Business logic for AI, grading, timetables, and **comprehensive notification system**
- **Key Models**: School, User, Student, Teacher, Class, Subject, Assessment, Grade, Attendance, **Notification, NotificationTemplate, UserNotificationPreferences**
- **Infrastructure**: Docker containers for PostgreSQL, Redis, and application services
- **Real-time**: Socket.IO for WebSocket connections and live notifications

### Frontend Architecture
- **React 18** with TypeScript and Vite
- **UI Framework**: Modern Design System built on Radix UI with Tailwind CSS
- **Component System**: Unified architecture with tree-shakeable exports and perfect icon alignment
- **Design Tokens**: Comprehensive design system with 200+ tokens for consistent styling
- **State Management**: React Context (AuthContext, ThemeContext) + **Real-time notification state**
- **API Layer**: Axios with interceptors for auth and error handling
- **Routing**: React Router v6 with protected routes
- **Real-time**: Socket.IO client integration with **useNotifications hook**
- **Notifications**: Native browser notifications + in-app notification center

### School Context Flow
1. Frontend extracts subdomain from URL or localStorage
2. `X-School-Subdomain` header added to all API requests
3. Backend middleware resolves school and adds to `req.school`
4. Controllers filter data by school context

### Key Directories
- `backend/prisma/schema.prisma` - PostgreSQL database schema with relationships
- `backend/controllers/` - Business logic with school filtering (migrated to Prisma)
- `backend/config/database.js` - Prisma client and Redis connections
- `backend/utils/prismaHelpers.js` - Migration utilities and common operations
- `frontend/src/services/` - API service layers per domain
- `frontend/src/pages/` - Page components organized by feature
- `frontend/src/components/ui/` - Modern design system components
- `frontend/src/lib/design-system.ts` - Design tokens and color system
- `frontend/src/lib/icon-utils.tsx` - Icon alignment utilities

## Database Setup & Migration

### PostgreSQL + Redis Setup
The system has been migrated from MongoDB to PostgreSQL with Redis for caching and sessions:

1. **Start Services**: `docker-compose up -d` (starts PostgreSQL, Redis, and application)
2. **Database Migration**: `npm run db:migrate` (creates tables from Prisma schema)
3. **Generate Client**: `npm run db:generate` (generates Prisma client)
4. **Seed Database**: `npm run db:seed` (optional - populate with sample data)

### Available Database Commands
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:migrate:prod` - Deploy migrations to production
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (dev only)

### Database Configuration
- **PostgreSQL**: Primary database with ACID compliance and complex relationships
- **Redis**: Sessions, caching, pub/sub messaging, and background jobs
- **Connection**: Environment-based connection strings for Docker and local development
- **Schema**: 20+ models with proper foreign keys, indexes, and constraints

### Database Seeding & Sample Data

#### **Comprehensive Seeder Script**
A complete seeder script is available at `backend/prisma/seed.js` that creates a full working school environment:

- **School**: Greenwood International School with complete configuration
- **Users**: Admin, Principal, Teachers, Students, and Parents with working credentials
- **Academic Structure**: Academic year, terms, and calendar with holidays
- **Organizational Structure**: Houses (Phoenix, Dragon, Eagle, Lion) and Sections
- **Classes**: Grade 1A through Grade 8A with appropriate capacities
- **Subjects**: Complete curriculum including Math, ELA, Science, Social Studies, PE, Arts, Music, CS, Spanish
- **Teachers**: 3 teachers with different specializations and grade assignments
- **Students**: Sample students assigned to classes and houses with parent relationships
- **Class-Subject Mappings**: Proper subject assignments based on grade levels
- **Teacher Assignments**: Class teachers and subject teachers properly assigned
- **Guardians**: Parent-child relationships with proper permissions
- **Curriculum**: Sample school curriculum with global curriculum templates

#### **Seeder Usage**
```bash
# Run the comprehensive seeder
npm run db:seed

# Reset database and reseed (development only)
npm run db:reset
```

#### **Sample Login Credentials**
After seeding, you can log in with:
- **Admin**: `admin@greenwood.com` / `admin123`
- **Principal**: `principal@greenwood.com` / `principal123`
- **Teacher**: `john.doe@greenwood.com` / `teacher123`
- **Student**: `jane.smith@greenwood.com` / `student123`
- **Parent**: `robert.smith@greenwood.com` / `parent123`

#### **⚠️ CRITICAL SEEDER MAINTENANCE RULE**

**ALWAYS UPDATE THE SEEDER WHEN ADDING NEW MODELS OR FIELDS:**

When you add new database models, modify existing models, or add required fields:

1. **Update `backend/prisma/seed.js`** immediately to include the new entities
2. **Add realistic sample data** for all new fields and relationships
3. **Maintain referential integrity** - ensure all foreign keys have valid references
4. **Test the seeder** - run `npm run db:reset` to verify it works completely
5. **Update login credentials list** if new user types are added
6. **Document any new entity relationships** in the seeder comments

**Why this is critical:**
- New developers need working sample data to understand the system
- Testing requires consistent, realistic data
- Demo environments depend on the seeder for presentations
- CI/CD pipelines may use seeded data for automated testing
- Missing seeder updates break the development workflow

**Example workflow when adding a new model:**
```bash
# 1. Add new model to schema.prisma
# 2. Run migration
npm run db:migrate

# 3. Update backend/prisma/seed.js with new model data
# 4. Test the seeder
npm run db:reset

# 5. Verify all relationships work correctly
# 6. Document the new model in CLAUDE.md if necessary
```

### Development Notes
- API endpoints documented at `/api-docs` (Swagger)
- Development subdomain defaults to 'demo' 
- Both frontend and backend use comprehensive error handling
- All API responses follow standardized format with success flags
- Database health checks available at `/api/health`

## Component Development Guidelines

### Modern Component System Usage

#### 1. Component Import Strategy
```tsx
// Always import from the unified system
import { 
  Button, 
  Form, 
  FormField, 
  Input, 
  StatusBadge,
  Card,
  Navigation 
} from '@/components/ui';

// Import design tokens when needed
import { colors, spacing } from '@/lib/design-system';

// Import icon utilities for custom alignment
import { normalizeIcon, IconContainer } from '@/lib/icon-utils';
```

#### 2. Button Usage Patterns
```tsx
// Use intent-based variants for different purposes
<Button intent="primary">Submit Form</Button>        // Main submit/save actions
<Button intent="secondary">Edit</Button>             // Secondary actions
<Button intent="cancel">Cancel</Button>              // Cancel operations
<Button intent="action">View Details</Button>        // Table/card actions
<Button intent="success">Approve</Button>            // Success confirmations
<Button intent="danger">Delete</Button>              // Destructive actions
<Button intent="ghost">More Options</Button>         // Subtle actions

// Icons automatically align with button size
<Button intent="action" leftIcon={<Eye />} size="sm">View</Button>
<Button intent="cancel" leftIcon={<X />}>Cancel</Button>

// Loading states with proper alignment
<Button intent="primary" loading loadingText="Saving...">Save</Button>

// Button hierarchy in forms
<div className="flex gap-3 justify-end">
  <Button intent="cancel">Cancel</Button>
  <Button intent="primary">Save Changes</Button>
</div>

// Table/card actions
<div className="flex gap-2">
  <Button intent="action" size="sm" leftIcon={<Eye />}>View</Button>
  <Button intent="secondary" size="sm" leftIcon={<Edit />}>Edit</Button>
  <Button intent="danger" size="sm" leftIcon={<Trash />}>Delete</Button>
</div>
```

### Button Intent Guidelines & Colors

**Primary Intent (Blue)**: Use for main submit/save actions in forms
- Color: Blue background (`bg-blue-600`)
- Usage: Form submissions, main CTAs

**Secondary Intent (Light Gray)**: Use for edit, update, or secondary actions  
- Color: White/Light gray background (`bg-white border-gray-300`)
- Usage: Edit buttons, secondary actions

**Cancel Intent (Red Text with Gray Background)**: Use exclusively for cancel operations
- Color: Light gray background with red text (`bg-gray-100 border-gray-300 text-red-600`)
- Hover: Darker red text with subtle red background (`hover:bg-red-50 hover:text-red-700 hover:border-red-300`)
- Usage: Cancel buttons, dismiss actions, close modals
- Visual Treatment: Less prominent than primary actions but clearly indicates cancellation

**Action Intent (Indigo)**: Use for table actions, card actions, and general operations
- Color: Indigo background (`bg-indigo-600`)
- Usage: View, table actions, card operations

**Success Intent (Green)**: Use for approval, confirmation, or positive actions
- Color: Green background (`bg-green-600`)
- Usage: Approve, confirm, positive actions

**Danger Intent (Red)**: Use for delete, remove, or destructive actions  
- Color: Red background (`bg-red-600`)
- Usage: Delete, remove, destructive operations

**Ghost/Link**: Use for subtle or less important actions
- Color: Transparent with colored text
- Usage: Minimal actions, links

#### 3. Navigation Component Usage
```tsx
// Use proper navigation components (NOT buttons for navigation)
<Navigation>
  <NavigationHeader>
    <h1>School Name</h1>
  </NavigationHeader>
  
  <NavigationContent>
    <NavigationGroup title="Academic">
      <NavigationItem icon={<Users />} active={activeTab === 'students'}>
        Students
      </NavigationItem>
      <NavigationSubmenu open={expanded}>
        <NavigationSubitem icon={<Plus />}>Add Student</NavigationSubitem>
      </NavigationSubmenu>
    </NavigationGroup>
  </NavigationContent>
</Navigation>

// For top navigation
<TopNavigation>
  <TopNavigationList>
    <TopNavigationItem active={true}>Dashboard</TopNavigationItem>
    <TopNavigationItem hasDropdown>Students</TopNavigationItem>
  </TopNavigationList>
</TopNavigation>
```

#### 4. Form Components Best Practices
```tsx
// Use compound form components for consistency
<Form spacing="md">
  <FormSection title="Student Information" description="Basic student details">
    <FormField label="Full Name" required error={errors.name}>
      <Input placeholder="Enter full name" />
    </FormField>
    
    <FormField label="Email" description="Student email address">
      <Input type="email" leftIcon={<Mail />} />
    </FormField>
  </FormSection>
</Form>
```

#### 5. Status & Feedback Components
```tsx
// Use status components for consistent feedback
<StatusBadge variant="success" icon={<Check />}>Active</StatusBadge>
<StatusIndicator status="warning" pulse>Pending Review</StatusIndicator>
<StatusCard title="Student Status" status="success" value="Enrolled" />

// Form messages with proper types
<FormMessage type="error" message="Please fill in all required fields" />
<FormMessage type="success" message="Student saved successfully" />
```

#### 6. Icon Alignment Guidelines
```tsx
// For custom icon usage, always use utilities
const icon = normalizeIcon(<CustomIcon />, 'md');

// Use IconContainer for perfect centering
<IconContainer icon={<Settings />} size="lg" center />

// Get predefined patterns for consistency
const buttonConfig = iconPatterns.button.lg; // { size: 'md', className: 'flex-shrink-0' }
```

### Component Architecture Principles

1. **No Backward Compatibility**: This is a fresh, modern system - don't worry about legacy patterns
2. **Composition Over Configuration**: Use compound components for flexibility
3. **Consistent Styling**: Always use design tokens and predefined patterns
4. **Icon Alignment**: Use the icon utilities for perfect alignment
5. **Accessibility First**: All components include proper ARIA attributes and keyboard navigation
6. **Type Safety**: Leverage TypeScript variants for compile-time safety

### Common Anti-Patterns to Avoid

❌ **Don't use buttons for navigation:**
```tsx
// Bad
<Button onClick={() => navigate('/students')}>Students</Button>

// Good  
<NavigationItem onClick={() => navigate('/students')}>Students</NavigationItem>
```

❌ **Don't manually style icons:**
```tsx
// Bad
<User className="w-4 h-4" />

// Good
{normalizeIcon(<User />, 'sm')}
```

❌ **Don't mix old and new components:**
```tsx
// Bad - mixing legacy with modern
<LegacyCard>
  <Button intent="primary">New Button</Button>
</LegacyCard>

// Good - use modern components consistently
<Card>
  <CardContent>
    <Button intent="primary">Modern Button</Button>
  </CardContent>
</Card>
```

### Recommended Component Patterns

- **Dashboard Layout**: `StatsCard + StatusCard + ActionCard`
- **Form Layout**: `Form + FormSection + FormField + Input/Select`
- **Data Display**: `Card + Table + StatusBadge + DropdownMenu`
- **Settings Page**: `FormSection + Switch/Checkbox + Button`
- **User Profile**: `Card + Avatar + StatusBadge + ButtonGroup`
- **Notification Center**: `NotificationCenter + useNotifications hook`

## Notification System Usage

### Sending Notifications (Backend)
```javascript
// Send notification using the service
const notificationService = require('../services/notificationService');

await notificationService.sendNotification({
  schoolId: req.school.id,
  title: 'Grade Published',
  message: 'Your math exam results are now available',
  type: 'GRADE_UPDATE',
  priority: 'HIGH',
  category: 'ACADEMIC',
  channels: ['EMAIL', 'PUSH', 'IN_APP'],
  targetType: 'SPECIFIC_USERS',
  targetUsers: [studentUserId],
  templateId: 'grade-published', // Optional: use template
  templateData: { student, grade, exam }, // Template variables
  createdById: req.user.id
});
```

### Frontend Notification Integration
```typescript
// Use the notification hook in React components
import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const { 
    notifications, 
    unreadCount, 
    connected, 
    markAsRead,
    preferences,
    updatePreferences 
  } = useNotifications();

  return (
    <div>
      {/* Show notification count */}
      <span>Unread: {unreadCount}</span>
      
      {/* Include notification center */}
      <NotificationCenter />
      
      {/* Connection status */}
      {connected && <span>🟢 Live</span>}
    </div>
  );
};
```

### Template Usage
```javascript
// Create notification template with Handlebars
const templateService = require('../services/templateService');

await templateService.createTemplate({
  schoolId: req.school.id,
  name: 'Grade Published',
  type: 'GRADE_UPDATE',
  category: 'ACADEMIC',
  emailSubject: 'Grade Published - {{exam.title}}',
  emailContent: `Dear {{userDisplayName user}},
    
Your grade for {{exam.title}} is now available:
- Score: {{grade.marksObtained}}/{{grade.totalMarks}}
- Percentage: {{formatPercentage grade.marksObtained grade.totalMarks}}
- Grade: {{grade.letterGrade}}

Best regards,
{{school.name}}`,
  smsContent: 'Grade available: {{exam.title}} - {{grade.letterGrade}} ({{formatPercentage grade.marksObtained grade.totalMarks}})',
  createdById: req.user.id
});
```

### Environment Configuration
Key environment variables to configure:
```bash
# Global toggle
NOTIFICATIONS_ENABLED=true
WEBSOCKET_NOTIFICATIONS_ENABLED=true

# Email providers
EMAIL_NOTIFICATIONS_ENABLED=true
SENDGRID_API_KEY=your-sendgrid-key

# SMS providers  
SMS_NOTIFICATIONS_ENABLED=true
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Push notifications
PUSH_NOTIFICATIONS_ENABLED=true
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-key

# Templates and preferences
TEMPLATES_AUTO_CREATE=true
USER_PREFERENCES_ENABLED=true
QUIET_HOURS_ENABLED=true
```

### Important Implementation Notes
1. **Always use the notification service** rather than sending emails/SMS directly
2. **Templates are preferred** over hardcoded messages for consistency
3. **User preferences are automatically respected** - no need to check manually
4. **WebSocket connections are automatically managed** by the useNotifications hook
5. **All notification channels support fallback** - if one fails, others continue
6. **Queue system handles retries** automatically for failed deliveries
7. **Analytics and delivery logs** are automatically tracked for all notifications

## UI Design Constitution 🎨

This section establishes the fundamental principles and standards for designing all user interfaces in the KOKOKA school management system. These guidelines ensure consistency, accessibility, and excellent user experience across all pages and components.

### Core Design Principles

#### 1. **Consistency First**
- Every page should feel part of the same cohesive system
- Use established patterns and components from our design system
- Maintain consistent spacing, colors, typography, and behavior
- Follow the same layout patterns across similar page types

#### 2. **User-Centric Design**
- Design for the primary user workflow, not edge cases
- Prioritize common tasks and make them easily accessible
- Consider the cognitive load on users (teachers, students, parents, administrators)
- Design for different screen sizes and devices (responsive design)

#### 3. **Clear Information Hierarchy**
- Most important information should be immediately visible
- Use typography, spacing, and color to guide user attention
- Group related information together
- Use progressive disclosure for complex features

#### 4. **Accessible & Inclusive**
- All interactions must be keyboard accessible
- Maintain proper color contrast ratios (4.5:1 minimum)
- Provide clear focus indicators
- Use semantic HTML and proper ARIA labels
- Support screen readers and assistive technologies

### Page Layout Standards

#### **Page Structure**
Every page must follow this consistent structure:

```tsx
<PageContainer>
  <PageHeader>
    <PageTitle>Page Name</PageTitle>
    <PageDescription>Brief description of page purpose</PageDescription>
    <PageActions>
      {/* Primary actions for this page */}
    </PageActions>
  </PageHeader>

  <PageContent>
    {/* Main content area with proper spacing */}
  </PageContent>
</PageContainer>
```

#### **Layout Patterns by Page Type**

**1. List/Table Pages (Students, Teachers, Classes)**
```tsx
<PageContainer>
  <PageHeader>
    <div className="flex justify-between items-start">
      <div>
        <PageTitle>Students</PageTitle>
        <PageDescription>Manage student records and information</PageDescription>
      </div>
      <Button intent="primary" leftIcon={<Plus />}>Add Student</Button>
    </div>
  </PageHeader>

  <PageContent>
    <div className="space-y-6">
      {/* Search and filters */}
      <SearchAndFilters />

      {/* Data table/grid */}
      <DataTable />

      {/* Pagination */}
      <Pagination />
    </div>
  </PageContent>
</PageContainer>
```

**2. Form Pages (Add/Edit Student, Teacher)**
```tsx
<PageContainer>
  <PageHeader>
    <PageTitle>Add New Student</PageTitle>
    <PageDescription>Create a new student record</PageDescription>
  </PageHeader>

  <PageContent>
    <div className="max-w-4xl mx-auto">
      <Form spacing="lg">
        <FormSection title="Basic Information">
          {/* Form fields */}
        </FormSection>

        <FormSection title="Contact Information">
          {/* Form fields */}
        </FormSection>

        <FormActions className="flex justify-end gap-3 pt-6">
          <Button intent="cancel">Cancel</Button>
          <Button intent="primary">Save Student</Button>
        </FormActions>
      </Form>
    </div>
  </PageContent>
</PageContainer>
```

**3. Dashboard Pages**
```tsx
<PageContainer>
  <PageHeader>
    <PageTitle>Dashboard</PageTitle>
    <PageDescription>School overview and key metrics</PageDescription>
  </PageHeader>

  <PageContent>
    <div className="space-y-8">
      {/* Key metrics cards */}
      <StatsCardGrid>
        <StatsCard title="Total Students" value="1,247" trend="+5%" />
        <StatsCard title="Total Teachers" value="68" trend="+2%" />
        <StatsCard title="Active Classes" value="45" trend="0%" />
      </StatsCardGrid>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity />
        <UpcomingEvents />
      </div>
    </div>
  </PageContent>
</PageContainer>
```

**4. Detail/Profile Pages**
```tsx
<PageContainer>
  <PageHeader>
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        <Avatar size="lg" src={student.photo} />
        <div>
          <PageTitle>{student.fullName}</PageTitle>
          <PageDescription>Student ID: {student.studentId}</PageDescription>
        </div>
      </div>
      <div className="flex gap-2">
        <Button intent="secondary" leftIcon={<Edit />}>Edit</Button>
        <Button intent="action" leftIcon={<Mail />}>Contact</Button>
      </div>
    </div>
  </PageHeader>

  <PageContent>
    <TabContainer>
      <TabList>
        <Tab active>Overview</Tab>
        <Tab>Academic</Tab>
        <Tab>Attendance</Tab>
      </TabList>

      <TabContent>
        {/* Tab content */}
      </TabContent>
    </TabContainer>
  </PageContent>
</PageContainer>
```

### Component Usage Guidelines

#### **Data Display Standards**

**1. Tables**
- Always include proper headers with sort indicators
- Use consistent row heights (48px minimum for touch targets)
- Implement zebra striping for readability
- Include loading states and empty states
- Use StatusBadge for status columns
- Actions should be right-aligned in last column

**2. Cards**
- Use cards for grouped information or previews
- Maintain consistent padding (16px minimum)
- Include clear hierarchy with proper headings
- Use subtle shadows for depth (shadow-sm)

**3. Forms**
- Group related fields using FormSection
- Use consistent spacing between fields (16px)
- Include clear labels and help text
- Show validation errors immediately below fields
- Use proper input types (email, tel, number, etc.)

#### **Interactive Element Standards**

**1. Buttons**
- Follow the established intent system (primary, secondary, action, etc.)
- Use consistent sizing (sm, md, lg)
- Include proper loading states
- Ensure 44px minimum touch target
- Use icons appropriately (left for actions, right for navigation)

**Button Positioning Standards:**
- **Form Actions**: Always position on the right side using `justify-end`
- **Button Order**: Cancel/Secondary button first, Primary action button last
- **Spacing**: Use `gap-3` (12px) between buttons in button groups
- **Top Spacing**: Add `pt-6` (24px) above form action buttons
- **Full Width on Mobile**: Stack vertically with full width on mobile screens

## Submit and Cancel Button Standards 🎯

### Visual Specifications

**Submit/Save Buttons (Primary Intent)**
- **Background**: Blue (`bg-blue-600`)
- **Text**: White (`text-white`)
- **Hover**: Darker blue (`hover:bg-blue-700`)
- **Size**: Standard medium (`size="md"`) - 40px height
- **Font Weight**: Medium (`font-medium`)
- **Border Radius**: 6px (`rounded-md`)
- **Padding**: 12px horizontal, 8px vertical
- **Shadow**: Subtle (`shadow-sm`)

**Cancel Buttons (Cancel Intent)**
- **Background**: White with subtle border (`bg-white`)
- **Border**: Red border (`border border-red-300`)
- **Text**: Red (`text-red-600`)
- **Hover**: Light red background (`hover:bg-red-50`) with darker red text (`hover:text-red-700`) and darker red border (`hover:border-red-400`)
- **Focus**: Red focus ring (`focus:ring-2 focus:ring-red-500 focus:ring-offset-2`)
- **Size**: Standard medium (`size="md"`) - 40px height
- **Font Weight**: Medium (`font-medium`)
- **Border Radius**: 6px (`rounded-md`)
- **Visual Treatment**: Clean white background with red accents that clearly indicates cancellation action while maintaining contrast with submit buttons

**Alternative Cancel Button Style (Subtle)**
For contexts where a less prominent cancel button is preferred:
- **Background**: Light gray (`bg-gray-100`)
- **Border**: Gray border (`border border-gray-300`)
- **Text**: Gray (`text-gray-700`)
- **Hover**: Darker gray background (`hover:bg-gray-200`) with darker text (`hover:text-gray-900`)
- **Usage**: Use in contexts where cancel is a secondary concern and you want minimal visual emphasis

### Layout and Positioning Rules

**1. Standard Form Layout**
```tsx
// Always use this exact pattern for form submission buttons
<div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
  <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
  <Button intent="primary" className="w-full sm:w-auto">Save Changes</Button>
</div>
```

**2. Button Order (Left to Right)**
- **Cancel/Secondary** button always comes FIRST (left side)
- **Submit/Primary** button always comes LAST (right side)
- This follows common UI patterns where the primary action is right-aligned

**3. Spacing Requirements**
- **Between Buttons**: 12px gap (`gap-3`)
- **Above Button Group**: 24px padding top (`pt-6`)
- **From Form Content**: Clear visual separation with adequate whitespace

**4. Responsive Behavior**
- **Desktop**: Horizontal layout, buttons side-by-side
- **Mobile**: Stack vertically (`flex-col sm:flex-row`)
- **Width**: Full width on mobile (`w-full`), auto width on desktop (`sm:w-auto`)

### Button Text Standards

**Submit Button Text Options** (in order of preference):
1. **"Save"** - For simple save operations
2. **"Save Changes"** - When editing existing data
3. **"Create [Item]"** - When creating new items (e.g., "Create Student")
4. **"Submit"** - For form submissions or applications
5. **"Update"** - For updating existing records
6. **"Add [Item]"** - For adding new items (e.g., "Add Student")

**Cancel Button Text** (always use):
- **"Cancel"** - Standard text for all cancel operations

### Visual Design Comparison

**Standard Cancel Button (Recommended)**
```tsx
// White background with red text and border - clearly indicates cancellation
<Button
  intent="cancel"
  className="bg-white border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
>
  Cancel
</Button>
```

**Subtle Cancel Button (Alternative)**
```tsx
// Gray background with gray text - use when cancel needs less emphasis
<Button
  intent="secondary"
  className="bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
>
  Cancel
</Button>
```

### Loading States

```tsx
// Submit button with loading state
<Button
  intent="primary"
  loading={isSubmitting}
  disabled={isSubmitting}
  className="w-full sm:w-auto"
>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>

// Or using loadingText prop
<Button
  intent="primary"
  loading={isSubmitting}
  loadingText="Saving..."
  className="w-full sm:w-auto"
>
  Save Changes
</Button>
```

### Usage Examples

**1. Basic Form (Add/Edit Pages)**
```tsx
<FormActions className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
  <Button intent="cancel" onClick={handleCancel} className="w-full sm:w-auto">
    Cancel
  </Button>
  <Button
    intent="primary"
    type="submit"
    loading={isSubmitting}
    className="w-full sm:w-auto"
  >
    Save Student
  </Button>
</FormActions>
```

**2. Modal/Dialog Forms**
```tsx
<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
  <Button intent="cancel" onClick={onClose}>Cancel</Button>
  <Button intent="primary" onClick={handleSubmit} loading={isSubmitting}>
    Create Class
  </Button>
</div>
```

**3. Multi-Step Forms**
```tsx
<div className="flex justify-between pt-6">
  <Button intent="secondary" onClick={handlePrevious}>
    Back
  </Button>
  <div className="flex gap-3">
    <Button intent="cancel" onClick={handleCancel}>Cancel</Button>
    <Button intent="primary" onClick={handleNext}>
      {isLastStep ? 'Finish' : 'Next'}
    </Button>
  </div>
</div>
```

**4. Confirmation Dialogs**
```tsx
<div className="flex justify-end gap-3 pt-4">
  <Button intent="cancel" onClick={onCancel}>Cancel</Button>
  <Button intent="danger" onClick={onConfirm}>
    Delete Student
  </Button>
</div>
```

### Accessibility Requirements

**1. Keyboard Navigation**
- Submit button should be focusable and activated with Enter/Space
- Tab order: Cancel button first, Submit button last
- Clear focus indicators for both buttons

**2. ARIA Attributes**
```tsx
<Button
  intent="primary"
  type="submit"
  aria-describedby={hasErrors ? 'form-errors' : undefined}
  disabled={isSubmitting}
>
  Save Changes
</Button>

<Button
  intent="cancel"
  aria-label="Cancel form and return to previous page"
>
  Cancel
</Button>
```

**3. Screen Reader Support**
- Use semantic button elements (not divs)
- Provide clear button text that describes the action
- Announce loading states to screen readers

### Do's and Don'ts

**✅ DO:**
- Always use `intent="primary"` for submit buttons
- Always use `intent="cancel"` for cancel buttons (white background with red text/border)
- Position buttons on the right side of forms
- Put cancel button first, submit button last
- Use consistent spacing (`gap-3`, `pt-6`)
- Include loading states for async operations
- Make buttons full-width on mobile
- Use descriptive text ("Save Student" not just "Save")
- Use the standard cancel button style (white bg, red text/border) for clear cancellation indication
- Consider the subtle cancel style (gray) only when cancellation needs less emphasis

**❌ DON'T:**
- Mix button intents (don't use `intent="secondary"` for cancel)
- Position buttons on the left side of forms
- Put submit button before cancel button
- Use inconsistent spacing or positioning
- Forget loading states for async operations
- Use vague button text ("OK", "Done", "Submit")
- Make buttons too small (minimum 40px height)
- Use different button sizes in the same group
- Use gray cancel buttons as the default (reserve for subtle contexts only)
- Make cancel buttons too subtle that users can't easily identify the cancellation action

### Form Integration Pattern

```tsx
const MyForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await saveData(data);
      onSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      showConfirmDialog();
    } else {
      onCancel();
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Form fields */}

      <FormActions className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
        <Button
          intent="cancel"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          intent="primary"
          type="submit"
          loading={isSubmitting}
          loadingText="Saving..."
          className="w-full sm:w-auto"
        >
          Save Changes
        </Button>
      </FormActions>
    </Form>
  );
};
```

```tsx
// Standard form button layout
<div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
  <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
  <Button intent="primary" className="w-full sm:w-auto">Save Changes</Button>
</div>

// Modal/dialog button layout
<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
  <Button intent="cancel">Cancel</Button>
  <Button intent="danger">Delete</Button>
</div>

// Table/card action buttons (left aligned)
<div className="flex gap-2">
  <Button intent="action" size="sm">View</Button>
  <Button intent="secondary" size="sm">Edit</Button>
  <Button intent="danger" size="sm">Delete</Button>
</div>
```

**2. Navigation**
- Use NavigationItem components, not buttons
- Show active states clearly
- Implement proper keyboard navigation
- Include breadcrumbs for deep pages
- Use consistent grouping for related items

**3. Status Indicators**
- Use StatusBadge for user status, record status, etc.
- Use consistent color coding:
  - Green: Active, Approved, Success
  - Yellow: Pending, Warning, Review
  - Red: Inactive, Rejected, Error
  - Blue: Info, In Progress
  - Gray: Neutral, Disabled

### Typography & Content Standards

#### **Text Hierarchy**
1. **Page Titles**: `text-2xl font-bold text-gray-900`
2. **Section Headings**: `text-lg font-semibold text-gray-900`
3. **Subsection Headings**: `text-base font-medium text-gray-900`
4. **Body Text**: `text-sm text-gray-700`
5. **Helper Text**: `text-xs text-gray-500`
6. **Labels**: `text-sm font-medium text-gray-700`

#### **Content Writing Guidelines**
- Use active voice and clear, concise language
- Write in sentence case, not title case (except for proper nouns)
- Use specific terms: "Add Student" not "Add New Item"
- Keep button text short: "Save" not "Save Changes"
- Use consistent terminology throughout the system
- Provide helpful descriptions and context where needed

### Color & Visual Design Standards

#### **Color Usage**
- **Primary Actions**: Blue (`bg-blue-600`)
- **Secondary Actions**: Gray (`bg-gray-100 border-gray-300`)
- **Success States**: Green (`bg-green-600`)
- **Warning States**: Yellow (`bg-yellow-500`)
- **Error States**: Red (`bg-red-600`)
- **Info States**: Blue (`bg-blue-500`)
- **Neutral/Cancel**: Gray (`bg-gray-200`)

#### **Spacing System**
- Use Tailwind's consistent spacing scale
- Standard page padding: `p-6` (24px)
- Section spacing: `space-y-6` (24px between sections)
- Card padding: `p-4` (16px) for small cards, `p-6` (24px) for large cards
- Form field spacing: `space-y-4` (16px between fields)

#### **Shadow & Depth**
- Cards: `shadow-sm` for subtle elevation
- Dropdowns/Modals: `shadow-lg` for floating elements
- Focus states: `shadow-outline` for keyboard navigation
- Avoid excessive shadows or complex effects

### Responsive Design Requirements

#### **Breakpoint Strategy**
- **Mobile First**: Design for mobile, enhance for larger screens
- **Key Breakpoints**:
  - Mobile: < 768px (full-width, stacked layout)
  - Tablet: 768px - 1024px (mixed layout)
  - Desktop: > 1024px (side-by-side layout)

#### **Mobile Adaptations**
- Stack form fields vertically on mobile
- Use full-width buttons on mobile
- Implement mobile-friendly navigation (hamburger menu)
- Ensure touch targets are at least 44px
- Hide less important columns in tables on mobile
- Use bottom sheets for mobile modals

### Error Handling & Loading States

#### **Error States**
- Show errors inline with form fields
- Use red color and clear error messages
- Provide actionable error messages
- Include retry mechanisms where appropriate
- Show system-level errors with toast notifications

#### **Loading States**
- Show skeleton loaders for content that's loading
- Use button loading states during form submission
- Implement progressive loading for large datasets
- Show loading indicators for async operations
- Maintain layout stability during loading

#### **Empty States**
- Design helpful empty states with clear actions
- Include illustrations or icons where appropriate
- Provide context about why the state is empty
- Offer clear next steps for users

### Accessibility Checklist

For every page and component, ensure:

- [ ] **Keyboard Navigation**: All interactive elements accessible via keyboard
- [ ] **Focus Indicators**: Clear focus states for all focusable elements
- [ ] **Color Contrast**: Text meets WCAG AA standards (4.5:1 ratio)
- [ ] **Screen Reader Support**: Proper heading structure and ARIA labels
- [ ] **Form Labels**: All form inputs have associated labels
- [ ] **Error Messages**: Clear, descriptive error messages
- [ ] **Loading States**: Screen reader announcements for dynamic content
- [ ] **Button Labels**: Descriptive text, not just icons
- [ ] **Landmark Regions**: Proper page structure with main, nav, aside elements

### Quality Assurance Standards

#### **Before Implementation**
- [ ] Review design against this constitution
- [ ] Verify component usage follows established patterns
- [ ] Check responsive behavior across breakpoints
- [ ] Test keyboard navigation flows
- [ ] Validate color contrast ratios
- [ ] Ensure loading and error states are designed

#### **During Development**
- [ ] Use established components from design system
- [ ] Follow spacing and typography standards
- [ ] Implement proper ARIA attributes
- [ ] Test with screen readers
- [ ] Verify cross-browser compatibility
- [ ] Test on actual mobile devices

#### **Before Release**
- [ ] User testing with target audiences (teachers, students, administrators)
- [ ] Accessibility audit using automated tools
- [ ] Performance testing on slower devices
- [ ] Content review for clarity and consistency
- [ ] Final design review against standards

### Component Evolution Guidelines

#### **When to Create New Components**
- Pattern appears 3+ times across the system
- Component solves a unique, well-defined use case
- Existing components cannot be composed to meet the need
- Component follows established design patterns

#### **Component Naming Conventions**
- Use descriptive, specific names: `StudentCard` not `Card`
- Follow PascalCase for component names
- Use descriptive prop names: `isActive` not `active`
- Include TypeScript interfaces for all props

#### **Component Documentation Requirements**
- Include Storybook stories showing all variants
- Document when and how to use the component
- Provide examples of common usage patterns
- Include accessibility considerations
- Document any breaking changes

---

**Remember**: This constitution is a living document. When patterns emerge that aren't covered here, document them and update these guidelines. The goal is to maintain consistency while allowing for thoughtful evolution of the design system.

- "Always use descriptive names"
- - "Always make a todo of work items before implementation"