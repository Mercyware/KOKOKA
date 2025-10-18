# KOKOKA Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         KOKOKA System                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Marketing Site  │     │  Frontend App    │     │  Backend API │
│  (Website)       │────▶│  (Main App)      │────▶│  (Server)    │
│                  │     │                  │     │              │
│  localhost:5173  │     │  localhost:8080  │     │ localhost:5000
│  www.kokoka.com  │     │  app.kokoka.com  │     │ api.kokoka.com
└──────────────────┘     └──────────────────┘     └──────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
   React/Vite              React/Vite             Node/Express
   + Routing               + Auth Context         + PostgreSQL
   + Marketing UI          + Multi-tenant         + Redis
                           + Dashboard            + Prisma ORM
```

## Component Interaction Flow

### 1. User Journey: Marketing Site → App

```
User visits website
        │
        ▼
www.kokoka.com (Marketing Site)
        │
        │ User clicks "Get Started"
        ▼
getAppURL('/login') function
        │
        ▼
Environment checks:
- Dev? → http://localhost:8080/login
- Prod? → https://app.kokoka.com/login
        │
        ▼
Redirect to Frontend App
        │
        ▼
app.kokoka.com/login (Frontend)
        │
        │ User enters credentials
        ▼
POST /api/auth/login
        │
        ▼
api.kokoka.com/api/auth/login (Backend)
        │
        │ Validates credentials
        ▼
Returns JWT token
        │
        ▼
Frontend stores token & redirects to /dashboard
```

### 2. OAuth Flow

```
User clicks "Sign in with Google"
        │
        ▼
getOAuthURL('google')
        │
        ▼
Environment checks:
- Dev? → http://localhost:5000/api/auth/google
- Prod? → https://api.kokoka.com/api/auth/google
        │
        ▼
Redirect to Backend OAuth endpoint
        │
        ▼
Backend redirects to Google
        │
        │ User authorizes
        ▼
Google redirects back to Backend
        │
        ▼
Backend processes OAuth callback
        │
        ▼
Backend redirects to Frontend with token
        │
        ▼
Frontend stores token & redirects to /dashboard
```

### 3. Multi-Tenant Subdomain Flow

```
User visits school subdomain
        │
        ▼
greenwood.kokoka.com
        │
        ▼
Frontend detects subdomain:
- Dev? → localStorage.getItem('dev_subdomain')
- Prod? → Extract from hostname (greenwood)
        │
        ▼
Set X-School-Subdomain header
        │
        ▼
All API requests include:
headers: { 'X-School-Subdomain': 'greenwood' }
        │
        ▼
Backend middleware extracts subdomain
        │
        ▼
Backend queries for school:
SELECT * FROM schools WHERE subdomain = 'greenwood'
        │
        ▼
Backend attaches school to request:
req.school = { id: '...', name: 'Greenwood High', ... }
        │
        ▼
All subsequent queries scoped to this school
```

## Environment Configuration Flow

### Development Environment

```
┌──────────────────────────────────────────────────────────┐
│                    Developer's Machine                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │  Website   │  │  Frontend  │  │     Backend     │  │
│  │  :5173     │  │  :8080     │  │     :5000       │  │
│  └────────────┘  └────────────┘  └─────────────────┘  │
│       │               │                    │           │
│       │               │                    │           │
│  .env file       .env file           .env file        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ VITE_APP_URL=http://localhost:8080              │  │
│  │ VITE_BACKEND_URL=http://localhost:5000          │  │
│  │ VITE_WEBSITE_URL=http://localhost:5173          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                          │
│  Auto-detected: import.meta.env.DEV = true              │
│  Fallbacks: Use localhost URLs                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Production Environment

```
┌──────────────────────────────────────────────────────────┐
│                    Cloud Infrastructure                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │  Website   │  │  Frontend  │  │     Backend     │  │
│  │ Vercel     │  │  Vercel    │  │   Railway       │  │
│  └────────────┘  └────────────┘  └─────────────────┘  │
│       │               │                    │           │
│       │               │                    │           │
│  Platform Env    Platform Env        Platform Env     │
│  ┌─────────────────────────────────────────────────┐  │
│  │ VITE_APP_URL=https://app.kokoka.com             │  │
│  │ VITE_BACKEND_URL=https://api.kokoka.com         │  │
│  │ VITE_WEBSITE_URL=https://www.kokoka.com         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                          │
│  Auto-detected: import.meta.env.PROD = true             │
│  Uses: Production URLs from environment                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### Database Layer

```
┌─────────────────────────────────────────────────────────┐
│                    Data Persistence                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐              ┌──────────────┐       │
│  │  PostgreSQL  │              │    Redis     │       │
│  │              │              │              │       │
│  │  - Schools   │              │  - Sessions  │       │
│  │  - Students  │              │  - Cache     │       │
│  │  - Teachers  │              │  - Jobs      │       │
│  │  - Classes   │              │              │       │
│  │  - Grades    │              │              │       │
│  └──────────────┘              └──────────────┘       │
│         ▲                              ▲               │
│         │                              │               │
│         └──────────┬──────────────────┘               │
│                    │                                   │
│              ┌─────▼──────┐                           │
│              │ Prisma ORM │                           │
│              └────────────┘                           │
│                    ▲                                   │
│                    │                                   │
│              ┌─────▼──────┐                           │
│              │  Backend   │                           │
│              │   Server   │                           │
│              └────────────┘                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                  Authentication Layer                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend Request                                       │
│       │                                                 │
│       ▼                                                 │
│  JWT Token (localStorage)                              │
│       │                                                 │
│       ▼                                                 │
│  Authorization: Bearer <token>                         │
│       │                                                 │
│       ▼                                                 │
│  Backend Middleware                                     │
│       │                                                 │
│       ├─▶ Verify JWT signature                         │
│       ├─▶ Check expiration                             │
│       ├─▶ Extract user info                            │
│       └─▶ Attach to req.user                           │
│       │                                                 │
│       ▼                                                 │
│  Protected Route Handler                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### CORS Configuration

```
┌─────────────────────────────────────────────────────────┐
│                    CORS Protection                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Request from: www.kokoka.com                          │
│       │                                                 │
│       ▼                                                 │
│  Backend checks CORS_ORIGIN:                           │
│  - https://app.kokoka.com  ✅ Allowed                  │
│  - https://www.kokoka.com  ✅ Allowed                  │
│  - https://evil.com        ❌ Blocked                  │
│       │                                                 │
│       ▼                                                 │
│  If allowed:                                            │
│  - Set Access-Control-Allow-Origin                     │
│  - Set Access-Control-Allow-Credentials                │
│  - Process request                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Configuration Management

### Environment Variable Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│              Configuration Priority                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Platform Environment Variables (Highest Priority)   │
│     └─▶ Set in Vercel/Railway/etc.                     │
│                                                         │
│  2. .env Files                                          │
│     └─▶ Local development only                         │
│                                                         │
│  3. Default Values in Code (Lowest Priority)            │
│     └─▶ Fallback if nothing set                        │
│                                                         │
│  Example:                                               │
│  ┌───────────────────────────────────────────────┐     │
│  │ const API_URL =                               │     │
│  │   import.meta.env.VITE_API_URL ||  // 1. Platform  │
│  │   (isDev                                      │     │
│  │     ? 'http://localhost:5000/api'  // 3. Default   │
│  │     : '/api');                     // 3. Default   │
│  └───────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Recommended Production Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Setup                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DNS (Cloudflare / Route53)                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ www.kokoka.com      → Vercel (Website)              │  │
│  │ app.kokoka.com      → Vercel (Frontend)             │  │
│  │ *.kokoka.com        → Vercel (Frontend)             │  │
│  │ api.kokoka.com      → Railway (Backend)             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  CDN & Edge (Vercel)                                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ - Global edge network                               │  │
│  │ - Automatic SSL/TLS                                 │  │
│  │ - Static asset caching                              │  │
│  │ - Serverless functions                              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Backend (Railway / AWS)                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Node.js Server                                      │  │
│  │ ├─ Express API                                      │  │
│  │ ├─ WebSocket (Socket.io)                           │  │
│  │ ├─ Background Jobs (Bull)                          │  │
│  │ └─ File Processing                                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Database Layer (Managed Services)                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ PostgreSQL (Railway / RDS)                          │  │
│  │ - Multi-tenant data                                 │  │
│  │ - Automated backups                                 │  │
│  │                                                      │  │
│  │ Redis (Upstash / ElastiCache)                       │  │
│  │ - Session storage                                   │  │
│  │ - Caching layer                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
KOKOKA/
├── backend/                    # Node.js backend
│   ├── controllers/            # Business logic
│   ├── middleware/             # Auth, CORS, etc.
│   ├── routes/                 # API routes
│   ├── prisma/                 # Database schema & migrations
│   ├── .env                    # Backend config
│   └── server.js               # Entry point
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts          # ✨ Environment config
│   │   │   └── api.ts          # API endpoints
│   │   ├── pages/
│   │   │   └── auth/
│   │   │       └── Login.tsx   # ✨ Updated OAuth
│   │   ├── services/
│   │   │   └── api.ts          # API client
│   │   └── utils/
│   │       └── devSubdomain.ts # Dev subdomain helper
│   ├── .env                    # ✨ Frontend config
│   └── .env.production.example # ✨ Production template
│
├── website/                    # Marketing website
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts          # ✨ Environment config
│   │   └── Index.tsx           # ✨ Updated app links
│   ├── .env                    # ✨ Website config
│   └── .env.production.example # ✨ Production template
│
└── Documentation/              # ✨ New documentation
    ├── DEPLOYMENT.md           # Deployment guide
    ├── CONFIGURATION.md        # Configuration guide
    ├── QUICK_START.md          # Quick start guide
    ├── ARCHITECTURE.md         # This file
    └── ENVIRONMENT_SETUP_SUMMARY.md

✨ = New or significantly updated files
```

## Summary

The KOKOKA architecture is designed for:
- **Scalability**: Multi-tenant, cloud-ready
- **Security**: JWT auth, CORS protection, environment isolation
- **Maintainability**: Centralized config, clear separation of concerns
- **Developer Experience**: Auto-configuration, comprehensive docs
- **Production Ready**: Environment-based deployment, managed services

All components work together seamlessly through environment-based configuration! 🚀
