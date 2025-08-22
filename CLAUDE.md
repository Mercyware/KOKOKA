# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Services**: Business logic for AI, grading, timetables
- **Key Models**: School, User, Student, Teacher, Class, Subject, Assessment, Grade, Attendance
- **Infrastructure**: Docker containers for PostgreSQL, Redis, and application services

### Frontend Architecture
- **React 18** with TypeScript and Vite
- **UI Framework**: Radix UI components with Tailwind CSS
- **State Management**: React Context (AuthContext, ThemeContext)
- **API Layer**: Axios with interceptors for auth and error handling
- **Routing**: React Router v6 with protected routes

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
- `frontend/src/components/ui/` - Reusable Radix UI components

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