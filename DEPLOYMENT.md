# KOKOKA Deployment Guide

This guide explains how to deploy KOKOKA in both development and production environments with proper URL configuration.

## Architecture Overview

KOKOKA consists of three main components:
- **Backend API**: Node.js/Express server (`/backend`)
- **Frontend App**: React/Vite application (`/frontend`)
- **Marketing Website**: React/Vite marketing site (`/website`)

## Development Setup

### Local Development URLs

| Component | URL |
|-----------|-----|
| Backend API | http://localhost:5000 |
| Frontend App | http://localhost:8080 |
| Website | http://localhost:5173 |

### Environment Files

Each component has its own `.env` file:

1. **Backend** (`/backend/.env`):
```env
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:8080
WEBSITE_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:8080,http://localhost:5173,http://localhost:3000
```

2. **Frontend** (`/frontend/.env`):
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:8080
VITE_APP_URL=http://localhost:8080
VITE_WEBSITE_URL=http://localhost:5173
```

3. **Website** (`/website/.env`):
```env
VITE_APP_URL=http://localhost:8080
VITE_BACKEND_URL=http://localhost:5000
VITE_WEBSITE_URL=http://localhost:5173
```

### Running Locally

```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev

# Start website (from /website)
npm run dev
```

## Production Deployment

### Recommended Architecture

```
┌─────────────────────────────────────────────┐
│          Domain Structure                   │
├─────────────────────────────────────────────┤
│  www.kokoka.com       → Marketing Website   │
│  app.kokoka.com       → Frontend App        │
│  api.kokoka.com       → Backend API         │
│  {school}.kokoka.com  → Frontend App        │
│                         (with subdomain)    │
└─────────────────────────────────────────────┘
```

### Backend Deployment

**Platform Options**: AWS EC2, DigitalOcean, Heroku, Railway, Render

**Environment Variables**:
```env
NODE_ENV=production
BACKEND_URL=https://api.kokoka.com
FRONTEND_URL=https://app.kokoka.com
WEBSITE_URL=https://www.kokoka.com
CORS_ORIGIN=https://app.kokoka.com,https://www.kokoka.com
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://:password@host:6379
```

**Deployment Steps**:
1. Set up PostgreSQL and Redis databases
2. Configure environment variables in your platform
3. Run migrations: `npm run db:migrate`
4. Seed database (optional): `npm run db:seed`
5. Start server: `npm start`

### Frontend App Deployment

**Platform Options**: Vercel, Netlify, AWS Amplify, Cloudflare Pages

**Environment Variables**:
```env
VITE_BACKEND_URL=https://api.kokoka.com
VITE_API_URL=https://api.kokoka.com/api
VITE_FRONTEND_URL=https://app.kokoka.com
VITE_APP_URL=https://app.kokoka.com
VITE_WEBSITE_URL=https://www.kokoka.com
VITE_NODE_ENV=production
```

**Build Command**: `npm run build`
**Output Directory**: `dist`

**Vercel Example**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_BACKEND_URL": "https://api.kokoka.com",
    "VITE_API_URL": "https://api.kokoka.com/api",
    "VITE_FRONTEND_URL": "https://app.kokoka.com",
    "VITE_APP_URL": "https://app.kokoka.com",
    "VITE_WEBSITE_URL": "https://www.kokoka.com"
  }
}
```

### Marketing Website Deployment

**Platform Options**: Vercel, Netlify, Cloudflare Pages

**Environment Variables**:
```env
VITE_APP_URL=https://app.kokoka.com
VITE_BACKEND_URL=https://api.kokoka.com
VITE_WEBSITE_URL=https://www.kokoka.com
VITE_NODE_ENV=production
```

**Build Command**: `npm run build`
**Output Directory**: `dist`

## DNS Configuration

### Example DNS Records

```
Type    Name        Value                    TTL
────────────────────────────────────────────────────
A       @           [Website IP]             3600
A       www         [Website IP]             3600
A       app         [Frontend IP]            3600
A       api         [Backend IP]             3600
CNAME   *           app.kokoka.com           3600
```

The wildcard CNAME (`*`) allows school subdomains like `greenwood.kokoka.com` to work automatically.

## SSL/TLS Certificates

- Use Let's Encrypt for free SSL certificates
- Most hosting platforms (Vercel, Netlify) provide automatic SSL
- For custom domains, ensure SSL is configured for all subdomains

## Multi-Tenant Configuration

### Subdomain Routing

The system supports multi-tenant architecture using subdomains:

1. **Development**: Uses `localStorage` to simulate subdomains
   - Set via: `localStorage.setItem('dev_subdomain', 'greenwood')`
   - Default: `greenwood`

2. **Production**: Uses actual domain subdomains
   - Example: `greenwood.kokoka.com`
   - Subdomain extracted from hostname automatically

### CORS Configuration

Ensure backend CORS allows:
- Main app domain (`app.kokoka.com`)
- Marketing website (`www.kokoka.com`)
- Wildcard subdomains (handled by allowing `*.kokoka.com` or specific origins)

## Environment Variable Checklist

### Backend
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `REDIS_URL` - Redis connection string
- [ ] `BACKEND_URL` - Backend API URL
- [ ] `FRONTEND_URL` - Frontend app URL
- [ ] `WEBSITE_URL` - Marketing website URL
- [ ] `CORS_ORIGIN` - Allowed origins (comma-separated)
- [ ] `JWT_SECRET` - Secret for JWT tokens
- [ ] `SESSION_SECRET` - Session secret
- [ ] OAuth credentials (Google, LinkedIn)

### Frontend
- [ ] `VITE_BACKEND_URL` - Backend API base URL
- [ ] `VITE_API_URL` - API endpoint URL
- [ ] `VITE_FRONTEND_URL` - Frontend app URL
- [ ] `VITE_APP_URL` - App URL for links
- [ ] `VITE_WEBSITE_URL` - Marketing website URL

### Website
- [ ] `VITE_APP_URL` - Frontend app URL
- [ ] `VITE_BACKEND_URL` - Backend API URL
- [ ] `VITE_WEBSITE_URL` - Marketing website URL

## Troubleshooting

### Links Not Working

**Problem**: Links between website and app don't work
**Solution**:
1. Check environment variables are set correctly
2. Verify CORS configuration in backend
3. Check browser console for errors

### OAuth Redirect Errors

**Problem**: OAuth login fails with redirect errors
**Solution**:
1. Verify `BACKEND_URL` is set correctly
2. Update OAuth provider callback URLs
3. Check CORS allows the frontend domain

### Subdomain Not Working

**Problem**: School subdomain not recognized
**Solution**:
1. In dev: Check `localStorage.getItem('dev_subdomain')`
2. In prod: Verify DNS wildcard is configured
3. Check `X-School-Subdomain` header is being sent

## Performance Optimization

### Frontend & Website
- Enable gzip compression
- Use CDN for static assets
- Enable browser caching
- Optimize images and assets

### Backend
- Use Redis for caching
- Enable database connection pooling
- Use environment-specific logging levels
- Implement rate limiting

## Monitoring & Logging

- Set up error tracking (Sentry, LogRocket)
- Monitor API performance
- Track database queries
- Set up uptime monitoring

## Scaling Considerations

- Use load balancers for backend
- Implement horizontal scaling for API servers
- Use managed database services (RDS, etc.)
- Cache frequently accessed data in Redis
- Consider CDN for static assets

---

For questions or issues, contact the development team or open an issue on GitHub.
