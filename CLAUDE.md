# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

KOKOKA is a comprehensive school management system built with Node.js/Express backend and React/TypeScript frontend. The system supports multi-tenant architecture using subdomain-based school isolation.

## Quick Commands

### Backend (from /backend directory)
- `npm run dev` - Start backend development server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Frontend (from /frontend directory)
- `npm run dev` - Start Vite development server
- `npm run lint` - Run ESLint

## Key Architecture

### Multi-tenant Structure
- Schools are isolated by subdomain (e.g., `demo.domain.com`)
- Frontend adds `X-School-Subdomain` header to API requests
- Backend middleware extracts school context via `req.school`

### Database
- **PostgreSQL** with Prisma ORM
- **Redis** for sessions, caching, and job queues
- Start services: `docker-compose up -d`

### Sample Login Credentials (after seeding)
- **Admin**: `admin@greenwood.com` / `admin123`
- **Teacher**: `john.doe@greenwood.com` / `teacher123`
- **Student**: `jane.smith@greenwood.com` / `student123`

## UI Component Standards

### Button Usage
```tsx
// Use intent-based variants
<Button intent="primary">Save</Button>        // Main actions
<Button intent="cancel">Cancel</Button>       // Cancel operations
<Button intent="action">View</Button>         // Table/card actions
<Button intent="danger">Delete</Button>       // Destructive actions

// Form button layout (ALWAYS use this pattern)
<div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
  <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
  <Button intent="primary" className="w-full sm:w-auto">Save Changes</Button>
</div>
```

### Component Imports
```tsx
// Always import from unified system
import { Button, Form, FormField, Input, Card } from '@/components/ui';
```

### Page Structure
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

## Key Rules

### Database Changes
**⚠️ CRITICAL**: Always update `backend/prisma/seed.js` when adding new models or fields

### Button Standards
- **Cancel buttons**: White background with red text/border (`intent="cancel"`)
- **Submit buttons**: Blue background (`intent="primary"`)
- **Button order**: Cancel first, Submit last
- **Position**: Right-aligned in forms (`justify-end`)

### Development Workflow
1. Use TodoWrite tool to plan tasks
2. Run lint/typecheck commands after code changes
3. Never commit unless explicitly asked

## Important File Locations
- `backend/prisma/schema.prisma` - Database schema
- `frontend/src/components/ui/` - Design system components
- `backend/controllers/` - Business logic
- `frontend/src/services/` - API services

---

**Remember**: Follow established patterns, use design system components, and maintain consistency across the application.