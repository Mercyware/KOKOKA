# KOKOKA Quick Start Guide

Get KOKOKA running on your local machine in 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL and Redis)
- Git

## 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/KOKOKA.git
cd KOKOKA

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install website dependencies
cd ../website
npm install
```

## 2. Start Database Services

```bash
# From project root
cd backend
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5433`
- Redis on `localhost:6380`

## 3. Setup Backend

```bash
# Still in /backend directory

# Environment file is already configured (.env exists)
# Verify it has the correct settings:
cat .env

# Run database migrations
DATABASE_URL="postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka" npx prisma migrate dev

# Generate Prisma client
DATABASE_URL="postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka" npx prisma generate

# Seed the database with sample data
DATABASE_URL="postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka" REDIS_URL="redis://:redis_password@localhost:6380" npm run db:seed
```

## 4. Start All Services

Open **3 terminal windows**:

### Terminal 1 - Backend
```bash
cd backend
DATABASE_URL="postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka" REDIS_URL="redis://:redis_password@localhost:6380" PORT=5000 npm run dev
```
✅ Backend running at http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running at http://localhost:8080

### Terminal 3 - Website
```bash
cd website
npm run dev
```
✅ Website running at http://localhost:5173

## 5. Test the Application

### Test Website → App Link
1. Open http://localhost:5173 (Marketing Website)
2. Click **"Get Started"** or **"Sign In"**
3. Should redirect to http://localhost:8080/login ✅

### Test Login
1. Go to http://localhost:8080/login
2. Use sample credentials:
   - **Admin**: `admin@greenwood.com` / `admin123`
   - **Teacher**: `john.doe@greenwood.com` / `teacher123`
   - **Student**: `jane.smith@greenwood.com` / `student123`

### Test OAuth Links
1. On login page, hover over **Google** or **LinkedIn** buttons
2. Check browser status bar shows: `http://localhost:5000/api/auth/google` ✅

## What You Get

After completing these steps, you have:

- ✅ Backend API running with PostgreSQL and Redis
- ✅ Frontend app with proper environment configuration
- ✅ Marketing website with working app links
- ✅ Sample data loaded (schools, users, classes)
- ✅ All URLs configured for local development
- ✅ Links between website and app working correctly

## URL Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:5000 | REST API endpoints |
| Frontend App | http://localhost:8080 | Main application |
| Marketing Website | http://localhost:5173 | Landing pages |
| PostgreSQL | localhost:5433 | Database |
| Redis | localhost:6380 | Cache & sessions |

## Development Subdomain

The app uses `greenwood` as the default school subdomain in development.

To switch schools:
```javascript
// In browser console
localStorage.setItem('dev_subdomain', 'demo');
// Refresh page
```

## Common Commands

```bash
# Backend
npm run dev              # Start development server
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data

# Frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run ESLint

# Website
npm run dev              # Start development server
npm run build            # Build for production
```

## Troubleshooting

### Links redirect to wrong URL

**Check environment variables**:
```bash
# Frontend
cd frontend
cat .env

# Website
cd website
cat .env
```

### Database connection errors

**Verify Docker services are running**:
```bash
docker ps
# Should show postgres and redis containers
```

**Check database URL**:
```bash
# Should be: postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka
```

### CORS errors

**Backend CORS should allow**:
```env
CORS_ORIGIN=http://localhost:8080,http://localhost:5173,http://localhost:3000
```

### Port already in use

**Kill the process**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

## Next Steps

- 📚 Read [CONFIGURATION.md](./CONFIGURATION.md) for detailed config info
- 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- 📖 Read [CLAUDE.md](./CLAUDE.md) for development guidelines
- 🎨 Explore the UI at http://localhost:8080
- 🌐 Customize the marketing site at http://localhost:5173

## Sample Login Credentials

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@greenwood.com | admin123 |
| Teacher | john.doe@greenwood.com | teacher123 |
| Student | jane.smith@greenwood.com | student123 |

School subdomain: `greenwood`

---

🎉 **You're all set!** Start developing with KOKOKA.

Need help? Check the documentation files or open an issue on GitHub.
