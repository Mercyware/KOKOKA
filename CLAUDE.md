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

**Cancel Intent (Medium Gray)**: Use exclusively for cancel operations
- Color: Medium gray background (`bg-gray-200`)  
- Usage: Cancel buttons, dismiss actions (less prominent than other buttons)

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

- "Always use descriptive names"
- - "Always make a todo of work items before implementation"