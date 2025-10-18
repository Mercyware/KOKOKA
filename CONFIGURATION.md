# KOKOKA Configuration Guide

## Overview

KOKOKA uses environment-based configuration to seamlessly work in both local development and production environments. The configuration system automatically switches between development and production URLs without code changes.

## Configuration Files

### Frontend (`/frontend`)

| File | Purpose |
|------|---------|
| `.env` | Local development configuration |
| `.env.production.example` | Production configuration template |
| `src/config/env.ts` | Environment configuration utilities |
| `src/config/api.ts` | API endpoint definitions |

### Website (`/website`)

| File | Purpose |
|------|---------|
| `.env` | Local development configuration |
| `.env.production.example` | Production configuration template |
| `src/config/env.ts` | Environment configuration utilities |

### Backend (`/backend`)

| File | Purpose |
|------|---------|
| `.env` | Local development configuration |
| `.env.example` | Configuration template with all options |

## Environment Variables

### Frontend Environment Variables

```env
# Backend/API URLs
VITE_BACKEND_URL       # Backend base URL (e.g., http://localhost:5000)
VITE_API_URL           # API endpoint URL (e.g., http://localhost:5000/api)

# Application URLs
VITE_FRONTEND_URL      # This app's URL (e.g., http://localhost:8080)
VITE_APP_URL           # App URL for external links (e.g., http://localhost:8080)
VITE_WEBSITE_URL       # Marketing website URL (e.g., http://localhost:5173)

# Development Settings
VITE_NODE_ENV          # Environment: development/production
VITE_DEFAULT_SUBDOMAIN # Default school subdomain for dev (e.g., greenwood)
```

### Website Environment Variables

```env
# Application URLs
VITE_APP_URL           # Main app URL (e.g., http://localhost:8080)
VITE_BACKEND_URL       # Backend API URL (e.g., http://localhost:5000)
VITE_WEBSITE_URL       # This website's URL (e.g., http://localhost:5173)

# Settings
VITE_NODE_ENV          # Environment: development/production
```

### Backend Environment Variables

```env
# URLs
BACKEND_URL            # Backend URL (e.g., http://localhost:5000)
FRONTEND_URL           # Frontend app URL (e.g., http://localhost:8080)
WEBSITE_URL            # Marketing website URL (e.g., http://localhost:5173)

# CORS
CORS_ORIGIN            # Allowed origins (comma-separated)
```

## Usage in Code

### Frontend - Using Environment Config

```typescript
// Import the environment configuration
import { ENV_CONFIG, getOAuthURL, getAppURL } from '@/config/env';

// Use configuration values
const apiUrl = ENV_CONFIG.API_URL;           // http://localhost:5000/api
const backendUrl = ENV_CONFIG.BACKEND_URL;   // http://localhost:5000

// Use helper functions
const googleOAuth = getOAuthURL('google');    // http://localhost:5000/api/auth/google
const loginUrl = getAppURL('/login');         // http://localhost:8080/login
```

### Website - Using Environment Config

```typescript
// Import the environment configuration
import { ENV_CONFIG, getAppURL } from './config/env';

// Redirect to app
const handleLogin = () => {
  window.location.href = getAppURL('/login');
};

// Use in JSX
<Button onClick={() => window.location.href = getAppURL('/register')}>
  Get Started
</Button>
```

### API Configuration

The frontend uses a centralized API configuration:

```typescript
// Import API config
import { API_CONFIG } from '@/config/api';

// Use API endpoints
const response = await api.get(API_CONFIG.ENDPOINTS.STUDENTS.BASE);

// Or use endpoint helpers
const studentUrl = API_CONFIG.ENDPOINTS.STUDENTS.BY_ID('123');
```

## How It Works

### Development Environment

When running locally (`npm run dev`):

1. **Frontend/Website**: Reads `.env` file
2. **Environment**: `import.meta.env.DEV` is `true`
3. **URLs**: Uses local URLs (localhost:5000, localhost:8080, etc.)
4. **Subdomains**: Simulated using localStorage

```typescript
// Development mode automatically detected
const isDevelopment = import.meta.env.DEV;

// Falls back to development URLs if env vars not set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Production Environment

When deployed (`npm run build`):

1. **Frontend/Website**: Uses environment variables from hosting platform
2. **Environment**: `import.meta.env.PROD` is `true`
3. **URLs**: Uses production URLs (from environment variables)
4. **Subdomains**: Extracted from actual domain

```typescript
// Production mode automatically detected
const isProduction = import.meta.env.PROD;

// Uses production URLs from environment
const API_URL = import.meta.env.VITE_API_URL; // https://api.kokoka.com/api
```

## Development Workflow

### 1. Initial Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with local settings

# Frontend
cd frontend
# .env already configured for local dev
# Verify settings if needed

# Website
cd website
# .env already configured for local dev
# Verify settings if needed
```

### 2. Running Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Website
cd website
npm run dev
```

### 3. Testing Links

- **Website → App**: Click "Get Started" on http://localhost:5173
- **OAuth**: Test Google/LinkedIn login on http://localhost:8080/login
- **API Calls**: Check browser console for API requests

## Production Deployment

### 1. Platform Setup

Choose hosting platforms:
- **Backend**: Railway, Render, Heroku, AWS
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Website**: Vercel, Netlify, Cloudflare Pages

### 2. Set Environment Variables

#### Backend (Example: Railway)
```
NODE_ENV=production
BACKEND_URL=https://api.kokoka.com
FRONTEND_URL=https://app.kokoka.com
WEBSITE_URL=https://www.kokoka.com
CORS_ORIGIN=https://app.kokoka.com,https://www.kokoka.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

#### Frontend (Example: Vercel)
```
VITE_BACKEND_URL=https://api.kokoka.com
VITE_API_URL=https://api.kokoka.com/api
VITE_FRONTEND_URL=https://app.kokoka.com
VITE_APP_URL=https://app.kokoka.com
VITE_WEBSITE_URL=https://www.kokoka.com
VITE_NODE_ENV=production
```

#### Website (Example: Vercel)
```
VITE_APP_URL=https://app.kokoka.com
VITE_BACKEND_URL=https://api.kokoka.com
VITE_WEBSITE_URL=https://www.kokoka.com
VITE_NODE_ENV=production
```

### 3. Deploy

```bash
# Frontend
cd frontend
npm run build
# Deploy dist/ folder

# Website
cd website
npm run build
# Deploy dist/ folder

# Backend
cd backend
# Deploy according to platform instructions
```

## Subdomain Configuration

### Development

Subdomains are simulated in development:

```javascript
// Set development subdomain
localStorage.setItem('dev_subdomain', 'greenwood');

// Get current subdomain
const subdomain = localStorage.getItem('dev_subdomain');
```

The system will use this subdomain for API requests via the `X-School-Subdomain` header.

### Production

Subdomains are extracted from the actual URL:

```
greenwood.kokoka.com → subdomain: "greenwood"
demo.kokoka.com      → subdomain: "demo"
```

## Troubleshooting

### Issue: Links redirect to wrong URL

**Solution**: Check environment variables are set correctly
```bash
# In browser console
console.log(import.meta.env);
```

### Issue: CORS errors

**Solution**: Verify backend CORS_ORIGIN includes frontend URL
```env
# Backend .env
CORS_ORIGIN=http://localhost:8080,http://localhost:5173
```

### Issue: OAuth redirect fails

**Solution**: Check VITE_BACKEND_URL is set correctly
```typescript
// Should be: http://localhost:5000/api/auth/google
// Not: undefined/api/auth/google
```

### Issue: Subdomain not working in dev

**Solution**: Set development subdomain
```javascript
localStorage.setItem('dev_subdomain', 'greenwood');
// Refresh page
```

## Best Practices

### 1. Never Hardcode URLs

❌ **Bad**:
```typescript
window.location.href = 'http://localhost:8080/login';
```

✅ **Good**:
```typescript
import { getAppURL } from '@/config/env';
window.location.href = getAppURL('/login');
```

### 2. Use Environment Config Constants

❌ **Bad**:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

✅ **Good**:
```typescript
import { ENV_CONFIG } from '@/config/env';
const apiUrl = ENV_CONFIG.API_URL;
```

### 3. Use API Endpoint Helpers

❌ **Bad**:
```typescript
api.get('/students/123');
```

✅ **Good**:
```typescript
import { API_CONFIG } from '@/config/api';
api.get(API_CONFIG.ENDPOINTS.STUDENTS.BY_ID('123'));
```

### 4. Validate Environment Variables

```typescript
// In src/config/env.ts
if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL not set, using default');
}
```

## Security Considerations

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Use different secrets** for dev and production
3. **Validate environment variables** on startup
4. **Use HTTPS in production** for all URLs
5. **Restrict CORS origins** to known domains

## Migration from Hardcoded URLs

If you have existing code with hardcoded URLs:

1. **Find all hardcoded URLs**:
```bash
# Search for common patterns
grep -r "http://localhost" src/
grep -r "https://app.kokoka.com" src/
```

2. **Replace with environment config**:
```typescript
// Before
const url = 'http://localhost:5000/api/auth/google';

// After
import { getOAuthURL } from '@/config/env';
const url = getOAuthURL('google');
```

3. **Test thoroughly** in both dev and production builds

---

For more details, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [CLAUDE.md](./CLAUDE.md) - Project overview and guidelines
