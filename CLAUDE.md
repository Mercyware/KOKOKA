# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Core Development Principles

**⚠️ IMPORTANT: NO BACKWARD COMPATIBILITY**
- Do NOT maintain backward compatibility unless explicitly requested
- Remove any legacy/deprecated code when making updates
- Replace old patterns completely with new implementations
- Break changes are acceptable and encouraged for cleaner codebase
- Focus on the best current solution, not supporting old code

## Project Overview

KOKOKA is a comprehensive school management system built with Node.js/Express backend and React/TypeScript frontend. The system supports multi-tenant architecture using subdomain-based school isolation.

## Design System - Modern Color Palette

### Color Philosophy
The system uses a modern, professional color palette designed for educational platforms:

**Primary Color**: Teal/Cyan (#0891B2) - Professional, trustworthy, calming
**Secondary Color**: Indigo (#4F46E5) - Authority, wisdom, engagement
**Accent Color**: Amber (#F59E0B) - Energy, warmth, highlights
**Success**: Emerald (#10B981) - Growth, achievement
**Neutrals**: Slate - Clean, modern gray scale

### Using Brand Colors

```tsx
// Primary actions - Teal
<Button intent="primary">Save</Button>
<div className="bg-primary text-white">Primary content</div>

// Secondary actions - Indigo
<Button intent="secondary">View Details</Button>
<div className="bg-secondary text-white">Secondary content</div>

// Accent/Action buttons - Amber
<Button intent="action">Export</Button>
<div className="bg-accent text-white">Accent content</div>

// Success states - Emerald
<Button intent="success">Complete</Button>
<StatusBadge status="success">Active</StatusBadge>

// Neutrals - Slate
<div className="text-slate-600">Body text</div>
<div className="bg-slate-100 border-slate-200">Card</div>
```

### CSS Variables
```css
--primary: Teal (#0891B2)
--secondary: Indigo (#4F46E5)
--accent: Amber (#F59E0B)
--success: Emerald (#10B981)
--brand-primary-light: Light Teal (#22D3EE) - Used for hover states and highlights
```

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

// Outline variant (neutral slate colors - NOT cyan)
// Use for: Utility buttons (filters, view toggles), neutral secondary actions
<Button variant="outline">Advanced</Button>
<Button variant="outline">Filter</Button>

// View Toggle Buttons (Cards/Table switchers)
// Use slate-900 active state, NOT cyan/teal
<button className={viewMode === 'cards'
  ? 'bg-slate-900 text-white'
  : 'bg-white text-slate-700'}>
  Cards
</button>
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