# KOKOKA School Management System - AI Copilot Instructions

## Architecture Overview

**Multi-Tenant School Management System** with subdomain-based isolation (`school1.domain.com`):
- **Backend**: Node.js + Express + PostgreSQL + Prisma ORM + Redis
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Radix UI
- **Development**: Docker Compose for local services
- **Multi-tenancy**: School isolation via subdomains and middleware

## Critical Development Patterns

### Multi-Tenant Request Flow
```javascript
// Backend: School context extracted via middleware
req.headers['x-school-subdomain'] = 'demo' // Frontend sets this
req.school = { id: 'uuid', name: 'Demo School' } // Middleware populates this
```

**Frontend Request Pattern:**
```typescript
// Always include school header in API calls
headers: {
  'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
}
```

### Database Operations with School Scoping
All database queries must include `schoolId` filter:
```javascript
// Controller pattern - ALWAYS include school scoping
const students = await prisma.student.findMany({
  where: { 
    schoolId: req.school.id, // Critical: Always scope to school
    // other filters...
  }
});
```

### Authentication & Authorization
- JWT tokens with role-based access (`admin`, `teacher`, `student`, `parent`)
- Multi-layer auth: `protect` middleware → `authorize(['admin'])` → school scoping
- School context always available as `req.school` after middleware

## Essential Development Workflows

### Database Workflow
```bash
# From backend/ directory
npm run db:migrate      # Apply schema changes
npm run db:generate     # Regenerate Prisma client  
npm run db:seed         # Seed with sample data
npm run db:studio       # Open Prisma Studio GUI
```

### Development Stack (Docker)
```bash
docker-compose -f docker-compose.dev.yml up -d  # Start all services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000  
# API Docs: http://localhost:5000/api-docs
```

### Sample Credentials (after seeding)
- Admin: `admin@greenwood.com` / `admin123`
- Teacher: `john.doe@greenwood.com` / `teacher123`
- Student: `jane.smith@greenwood.com` / `student123`

## Component System Standards

### Modern UI Components (ALWAYS use these)
```tsx
// Import from unified system
import { Button, Form, FormField, Input, Card, StatusBadge } from '@/components/ui';

// Intent-based button variants
<Button intent="primary">Save</Button>     // Main actions (blue)
<Button intent="cancel">Cancel</Button>    // Cancel (white/red border)  
<Button intent="action">View</Button>      // Table actions
<Button intent="danger">Delete</Button>    // Destructive actions

// Standard form button layout - ALWAYS use this pattern
<div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
  <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
  <Button intent="primary" className="w-full sm:w-auto">Save Changes</Button>
</div>
```

### Page Layout Pattern
```tsx
<PageContainer>
  <PageHeader>
    <PageTitle>Page Name</PageTitle>
    <PageDescription>Brief description</PageDescription>
  </PageHeader>
  <PageContent>
    {/* Main content */}
  </PageContent>
</PageContainer>
```

### Status Indicators
```tsx
<StatusBadge variant="success">Active</StatusBadge>
<StatusBadge variant="warning">Pending</StatusBadge>
<StatusBadge variant="danger">Suspended</StatusBadge>
```

## File Structure & Key Locations

### Backend Structure
```
backend/
├── controllers/         # Business logic (30+ controllers)
├── middlewares/        # Auth, school scoping, error handling  
├── prisma/schema.prisma # Database schema (comprehensive)
├── routes/             # Express routes
├── config/             # Database, JWT, Swagger setup
└── utils/prismaHelpers.js # Database query helpers
```

### Frontend Structure  
```
frontend/src/
├── components/ui/      # Modern design system (use index.ts exports)
├── pages/             # Route components
├── services/          # API service functions
├── utils/             # Utilities, error handling
└── context/           # React Context providers
```

## Critical Rules

### Database Schema Changes
**⚠️ CRITICAL**: Always update `backend/prisma/seed.js` when adding new models or fields - the seed file must stay synchronized with schema changes.

### School Context Requirements
- Backend controllers: Always access `req.school.id` for data scoping
- Frontend API calls: Always include `X-School-Subdomain` header
- Database queries: Always filter by `schoolId` to prevent data leakage

### Design System Compliance
- Use `intent` prop on buttons (not `variant`)
- Import components from `@/components/ui` (unified exports)
- Follow button ordering: Cancel → Primary action
- Position form buttons right-aligned (`justify-end`)

### API Response Pattern
```javascript
// Standard success response
res.json({
  success: true,
  data: result,
  message: 'Operation successful'
});

// Standard error response  
res.status(400).json({
  success: false,
  message: 'Error description'
});
```

## Integration Points

### Prisma Client Usage
```javascript
// Import centralized database connection
const { prisma } = require('../config/database');

// Use helpers for common patterns
const { userHelpers, studentHelpers } = require('../utils/prismaHelpers');
```

### External APIs
- **AI Integration**: OpenAI API for educational features
- **Email**: Nodemailer with SendGrid/AWS SES
- **File Upload**: Multer for local storage
- **Real-time**: Socket.io ready for live features

### Error Handling
- Winston logger for structured logging
- Global error handler middleware catches all exceptions
- Frontend: Centralized error handler with user-friendly messages

## Performance & Security

### Multi-tenancy Security
- All data queries MUST include school scoping
- School middleware validates subdomain access
- Role-based permissions within school context

### Caching Strategy  
- Redis for session storage and API caching
- Prisma query optimization with proper indexing
- Frontend uses TanStack Query for API state management

## Testing & Quality

### Development Commands
```bash
# Backend linting & testing
npm run lint           # ESLint check
npm run test          # Jest test suite  

# Frontend development
npm run dev           # Vite dev server
npm run lint          # ESLint + TypeScript check
```

This system requires understanding multi-tenant architecture, school-scoped data access, and the modern component system. Always consider school context in backend operations and use the established design patterns in frontend development.