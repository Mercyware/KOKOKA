# How to Restart Backend After Schema Changes

## The Problem
You're seeing this error because the running backend server is using an old Prisma Client that doesn't know about the new email verification fields.

## Solution

### Step 1: Stop ALL Running Backend Servers
Press `Ctrl+C` in any terminal windows running the backend server.

If that doesn't work, you can kill all node processes:
```bash
taskkill /F /IM node.exe
```

**Warning**: This will kill ALL Node.js processes on your system.

### Step 2: Regenerate Prisma Client
```bash
cd backend
DATABASE_URL="postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka" npx prisma generate
```

If you get an "EPERM" error, wait 10 seconds and try again. The file lock should clear.

### Step 3: Restart Backend Server
```bash
DATABASE_URL="postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka" REDIS_URL="redis://:redis_password@localhost:6380" PORT=5000 npm run dev
```

## Verification

You should see this in the server logs:
```
✅ Email service initialized with Amazon SES
```

Then try registering a new school again.

## Quick Commands (Run in Order)

```bash
# 1. Kill all node processes (if Ctrl+C doesn't work)
taskkill /F /IM node.exe

# 2. Wait 5 seconds, then regenerate Prisma Client
cd backend
timeout 5
npx prisma generate

# 3. Start backend
npm run dev
```

Or if you prefer setting environment variables properly:
```bash
set DATABASE_URL=postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka
set REDIS_URL=redis://:redis_password@localhost:6380
set PORT=5000
npm run dev
```
