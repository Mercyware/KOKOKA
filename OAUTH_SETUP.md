# OAuth Setup Guide

This guide explains how to set up Google and LinkedIn OAuth authentication for KOKOKA School Management System.

## Prerequisites

1. Node.js backend with Passport.js configured
2. Frontend React app with OAuth callback handling
3. Database with OAuth fields (googleId, linkedinId, profileImage)

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 2. Configure OAuth Consent Screen

1. Navigate to **APIs & Services > OAuth consent screen**
2. Choose **External** user type (for testing) or **Internal** (for organization use)
3. Fill in the required information:
   - App name: `KOKOKA School Management`
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `email`
   - `profile`
5. Add test users (for testing phase)

### 3. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure:
   - Name: `KOKOKA OAuth Client`
   - Authorized JavaScript origins:
     - `http://localhost:5173` (frontend development)
     - `http://localhost:5000` (backend development)
     - Your production frontend URL
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - Your production backend URL + `/api/auth/google/callback`

### 4. Get Credentials

1. Copy the **Client ID** and **Client Secret**
2. Add them to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

## LinkedIn OAuth Setup

### 1. Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **Create App**
3. Fill in the required information:
   - App name: `KOKOKA School Management`
   - LinkedIn Page: Create or select a LinkedIn page
   - App logo: Upload your app logo
   - Legal agreement: Accept terms

### 2. Configure OAuth Settings

1. In your LinkedIn app dashboard, go to **Auth** tab
2. Add **Authorized redirect URLs for your app**:
   - `http://localhost:5000/api/auth/linkedin/callback`
   - Your production backend URL + `/api/auth/linkedin/callback`

### 3. Request Required Scopes

1. In the **Products** tab, request access to:
   - **Sign In with LinkedIn using OpenID Connect**
   - **Share on LinkedIn** (if needed for future features)

### 4. Get Credentials

1. In the **Auth** tab, copy:
   - **Client ID**
   - **Client Secret**
2. Add them to your `.env` file:
   ```
   LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
   ```

## Environment Configuration

Create a `.env` file in the backend directory with the following OAuth variables:

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here

# Required for OAuth callbacks
CLIENT_URL=http://localhost:5173
```

## Testing OAuth Flow

### 1. Start the Application

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend  
npm run dev
```

### 2. Test Google OAuth

1. Navigate to `http://localhost:5173/login` or `http://localhost:5173/register`
2. Click the **Sign in with Google** button
3. Complete the Google OAuth flow
4. Verify successful login/registration

### 3. Test LinkedIn OAuth

1. Navigate to `http://localhost:5173/login` or `http://localhost:5173/register`
2. Click the **Sign in with LinkedIn** button
3. Complete the LinkedIn OAuth flow
4. Verify successful login/registration

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Ensure redirect URIs in OAuth provider match exactly
   - Check for trailing slashes and protocol (http vs https)

2. **Invalid Client Error**
   - Verify Client ID and Client Secret are correct
   - Check environment variables are loaded properly

3. **Scope Issues**
   - Ensure required scopes are requested in OAuth provider
   - Check consent screen configuration

4. **CORS Errors**
   - Verify CORS_ORIGIN includes your frontend URL
   - Check Authorized JavaScript origins in OAuth provider

### Debug Steps

1. Check backend logs for OAuth errors
2. Verify environment variables are loaded:
   ```bash
   console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
   ```
3. Test OAuth provider endpoints directly
4. Use browser developer tools to inspect network requests

## Production Deployment

### Security Considerations

1. **Environment Variables**
   - Use secure environment variable management
   - Never commit `.env` files to version control

2. **Redirect URIs**
   - Update OAuth providers with production URLs
   - Use HTTPS in production

3. **Consent Screens**
   - Submit for OAuth provider verification if needed
   - Update privacy policy and terms of service URLs

### Domain Configuration

1. Update OAuth providers with production domains
2. Configure CORS for production domains
3. Update `CLIENT_URL` environment variable

## API Endpoints

The following OAuth endpoints are available:

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `GET /api/auth/linkedin` - Initiate LinkedIn OAuth  
- `GET /api/auth/linkedin/callback` - Handle LinkedIn OAuth callback

## Database Schema

The User model includes OAuth fields:

```prisma
model User {
  // ... other fields
  googleId      String?  @unique
  linkedinId    String?  @unique
  profileImage  String?
}
```

Run the migration to ensure database schema is updated:

```bash
npx prisma migrate dev --name add-oauth-fields
```

## Frontend Integration

OAuth buttons are integrated into both Login and Register pages with consistent styling and proper error handling. The AuthContext manages OAuth success callbacks and user state updates.
