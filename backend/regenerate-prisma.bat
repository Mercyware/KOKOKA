@echo off
echo ====================================
echo Regenerating Prisma Client
echo ====================================
echo.
echo IMPORTANT: Make sure the backend server is STOPPED before running this!
echo Press Ctrl+C now if the server is still running.
echo.
pause
echo.
echo Setting environment variable...
set DATABASE_URL=postgresql://kokoka_user:kokoka_password@localhost:5433/kokoka

echo.
echo Generating Prisma Client...
npx prisma generate

echo.
echo Done! Now checking if models are available...
node check-messaging-models.js

echo.
echo ====================================
echo Next Steps:
echo ====================================
echo 1. Seed the database: npm run db:seed
echo 2. Start the server: npm run dev
echo ====================================
pause
