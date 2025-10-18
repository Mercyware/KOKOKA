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

### Button Design System

#### Intent-Based Button Variants
```tsx
// Primary actions (main CTAs, submit buttons)
<Button intent="primary">Save</Button>
<Button intent="primary">Create</Button>
<Button intent="primary">Submit</Button>

// Cancel operations (white background, red text/border)
<Button intent="cancel">Cancel</Button>
<Button intent="cancel">Discard</Button>

// Table/card actions (blue/default actions)
<Button intent="action">View</Button>
<Button intent="action">Edit</Button>
<Button intent="action">Manage</Button>

// Destructive actions (red background)
<Button intent="danger">Delete</Button>
<Button intent="danger">Remove</Button>
```

#### Button Variants for Special Cases
```tsx
// Ghost variant (transparent/white background with subtle hover)
// Use for: Dropdown triggers, icon-only buttons in tables, less prominent actions
<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
  <MoreVertical className="h-4 w-4" />
</Button>

// Outline variant (border with transparent background)
<Button variant="outline">Secondary Action</Button>
```

#### Action Buttons in Tables/Lists
```tsx
// ✅ PREFERRED: Dropdown menu for multiple actions
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <MoreVertical className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuItem onClick={handleEdit}>
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleView}>
      <Eye className="h-4 w-4 mr-2" />
      View
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      onClick={handleDelete}
      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// ❌ AVOID: Multiple separate buttons in table rows (clutters UI)
<div className="flex space-x-2">
  <Button intent="action" size="sm"><Edit /></Button>
  <Button intent="danger" size="sm"><Trash2 /></Button>
</div>
```

#### Form Button Layout
```tsx
// ALWAYS use this pattern for forms
<div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
  <Button intent="cancel" className="w-full sm:w-auto">Cancel</Button>
  <Button intent="primary" className="w-full sm:w-auto">Save Changes</Button>
</div>
```

#### Export/Print/Share Button Pattern
```tsx
// Use dropdown menus for grouped utility actions
<div className="flex space-x-2">
  {/* Export Dropdown */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button intent="action" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={handleExportPDF}>
        <FileText className="h-4 w-4 mr-2" />
        Export as PDF
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleExportJSON}>
        <FileJson className="h-4 w-4 mr-2" />
        Export as JSON
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  {/* Print Button */}
  <Button intent="action" size="sm" onClick={handlePrint}>
    <Printer className="h-4 w-4 mr-2" />
    Print
  </Button>

  {/* Share Dropdown */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button intent="action" size="sm">
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={handleCopyLink}>
        <Copy className="h-4 w-4 mr-2" />
        Copy Link
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleShareEmail}>
        <Mail className="h-4 w-4 mr-2" />
        Share via Email
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
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

#### Core Principles
- **Always use intent-based variants** (`intent="primary"`, `intent="cancel"`, `intent="action"`, `intent="danger"`)
- **Use `variant="ghost"` for dropdown triggers** and icon-only action buttons in tables
- **Group multiple actions in dropdown menus** instead of showing multiple buttons
- **Separate destructive actions** with `<DropdownMenuSeparator />` and style with red text

#### Form Buttons
- **Cancel buttons**: White background with red text/border (`intent="cancel"`)
- **Submit buttons**: Blue background (`intent="primary"`)
- **Button order**: Cancel first, Submit last
- **Position**: Right-aligned in forms (`justify-end`)
- **Responsive**: Full width on mobile (`w-full sm:w-auto`)

#### Table/List Action Buttons
- **Single action dropdown**: Use ghost variant with `MoreVertical` icon
- **Icon sizing**: `h-8 w-8` for button, `h-4 w-4` for icons
- **Alignment**: `align="end"` for dropdown content
- **Destructive actions**: Red text with `text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950`

#### Page Header Actions (Export/Print/Share)
- **Use labeled buttons** with icons (`intent="action"`)
- **Group related actions** in dropdown menus (e.g., Export → PDF/JSON)
- **Icon position**: Icon first, text after (`mr-2` spacing)

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