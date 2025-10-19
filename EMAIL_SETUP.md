# Email System Setup with Amazon SES

This document describes the email messaging system implementation for KOKOKA School Management System using Amazon SES.

## Features Implemented

### 1. Email Service
- **Amazon SES Integration** via SMTP using nodemailer
- **Email Templates** for:
  - Registration welcome emails
  - Email verification
  - Password reset (infrastructure ready)
- **Professional HTML templates** with responsive design

### 2. Email Verification System
- Token-based email verification
- Configurable token expiry (default: 24 hours)
- Resend verification email capability
- Verification status tracking in user profile

## Files Created/Modified

### New Files
1. **`backend/config/email.js`** - Email configuration for Amazon SES
2. **`backend/services/emailService.js`** - Email service with templates
3. **`EMAIL_SETUP.md`** - This documentation file

### Modified Files
1. **`backend/prisma/schema.prisma`** - Added email verification fields to User model
2. **`backend/controllers/schoolController.js`** - Updated school registration to send emails
3. **`backend/controllers/authController.js`** - Added email verification endpoints
4. **`backend/routes/authRoutes.js`** - Added email verification routes
5. **`backend/.env.example`** - Added SES configuration variables

## Database Schema Changes

Added to **User** model:
```prisma
emailVerificationToken       String?   @unique
emailVerificationTokenExpiry DateTime?
```

## Environment Variables

Add these to your `.env` file:

```env
# Amazon SES SMTP Configuration
SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SES_SMTP_PORT=587
SES_SMTP_SECURE=false
SES_SMTP_USER=your-ses-smtp-username
SES_SMTP_PASSWORD=your-ses-smtp-password

# Email Settings
EMAIL_ENABLED=true
EMAIL_FROM=KOKOKA School Management <noreply@kokoka.com>
EMAIL_NO_REPLY=noreply@kokoka.com
EMAIL_SUPPORT=support@kokoka.com

# Email Verification Settings
EMAIL_VERIFICATION_TOKEN_EXPIRE=24
EMAIL_VERIFICATION_RESEND_LIMIT=3
```

## API Endpoints

### 1. Register School (Updated)
**POST** `/api/schools/register`

Now sends registration and verification emails when a school is registered.

Response includes:
```json
{
  "success": true,
  "message": "School registered successfully. Please check your email to verify your account.",
  "admin": {
    "emailVerified": false
  }
}
```

### 2. Verify Email
**POST** `/api/auth/verify-email`

Request:
```json
{
  "token": "verification-token-from-email"
}
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully",
  "user": {
    "emailVerified": true
  }
}
```

### 3. Resend Verification Email
**POST** `/api/auth/resend-verification`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

## Email Templates

### 1. Registration Email
Sent when a school is registered. Includes:
- Welcome message
- School details (name, subdomain)
- Next steps information

### 2. Verification Email
Sent for email verification. Includes:
- Verification link with token
- Token expiry information
- Professional branded design

### 3. Password Reset Email (Ready for Implementation)
Infrastructure is ready. Template includes:
- Reset link with token
- Security information
- Expiry warning

## Setup Instructions

### 1. Install Dependencies
Already installed:
```bash
cd backend
npm install nodemailer @types/nodemailer
```

### 2. Configure Amazon SES

#### A. Verify Your Domain/Email
1. Go to AWS Console → Amazon SES
2. Verify your sending domain or email address
3. Request production access (if not in sandbox mode)

#### B. Create SMTP Credentials
1. In SES Console, go to "SMTP Settings"
2. Click "Create My SMTP Credentials"
3. Download and save the credentials
4. Add to your `.env` file

### 3. Run Database Migration
```bash
cd backend
DATABASE_URL="your-database-url" npx prisma migrate dev --name add_email_verification
```

### 4. Test Email Configuration
Start your backend server and the email service will automatically verify the SMTP connection on startup.

## Usage Examples

### Sending Custom Emails
```javascript
const emailService = require('./services/emailService');

// Send custom email
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>HTML Content</h1>',
  text: 'Plain text fallback'
});
```

### Sending Registration Email
```javascript
await emailService.sendRegistrationEmail({
  email: 'admin@school.com',
  name: 'John Doe',
  schoolName: 'Example School',
  subdomain: 'example'
});
```

### Sending Verification Email
```javascript
await emailService.sendVerificationEmail({
  email: 'user@example.com',
  name: 'John Doe',
  verificationToken: 'token-here',
  schoolName: 'Example School'
});
```

## Frontend Integration

### 1. Verification Page
Create a page at `/auth/verify-email` that:
- Reads token from URL query parameter
- Calls POST `/api/auth/verify-email` with the token
- Shows success/error message
- Redirects to login or dashboard

Example:
```typescript
const token = new URLSearchParams(location.search).get('token');

const response = await fetch('/api/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
});

const data = await response.json();
```

### 2. Resend Verification
Add a "Resend verification email" button on login page or profile page for unverified users.

## Security Considerations

1. **Token Expiry**: Tokens expire after 24 hours (configurable)
2. **Unique Tokens**: Each token is cryptographically random (32 bytes)
3. **Single Use**: Tokens are cleared after successful verification
4. **HTTPS Only**: In production, ensure all email links use HTTPS
5. **Rate Limiting**: Consider implementing rate limiting on resend endpoint

## Error Handling

The email service includes comprehensive error handling:
- Continues registration even if email fails
- Logs all email errors for debugging
- Returns appropriate HTTP status codes
- User-friendly error messages

## Production Checklist

- [ ] Verify domain in Amazon SES
- [ ] Request production access (move out of sandbox)
- [ ] Set up SPF, DKIM, and DMARC records
- [ ] Update `EMAIL_FROM` with verified domain
- [ ] Set `EMAIL_ENABLED=true` in production
- [ ] Configure CloudWatch for SES monitoring
- [ ] Set up bounce and complaint handling
- [ ] Test email delivery to various providers (Gmail, Outlook, etc.)
- [ ] Implement email template versioning
- [ ] Set up email analytics/tracking (optional)

## Future Enhancements

1. **Additional Templates**:
   - Password reset
   - Password change confirmation
   - Account suspension/reactivation
   - Welcome aboard after verification

2. **Email Queue System**:
   - Background job processing for emails
   - Retry mechanism for failed emails
   - Email scheduling

3. **Multi-language Support**:
   - Template localization
   - Language preference in user profile

4. **Email Analytics**:
   - Track open rates
   - Track click rates
   - Monitor delivery success

5. **Advanced Features**:
   - Email templates in database (editable by admins)
   - Custom school branding in emails
   - Attachment support
   - Bulk email sending

## Troubleshooting

### Email Not Sending
1. Check `EMAIL_ENABLED` is set to `true`
2. Verify SES SMTP credentials are correct
3. Check SES console for sending limits
4. Verify email/domain in SES
5. Check application logs for error messages

### Verification Link Not Working
1. Check token hasn't expired
2. Verify `FRONTEND_URL` is set correctly
3. Check token format in database
4. Ensure route is properly registered

### SES Sandbox Mode
If in sandbox mode, you can only send to verified email addresses. Request production access to send to any email.

## Support

For issues or questions:
- Check application logs: `backend/logs/`
- Review SES console for delivery issues
- Email: support@kokoka.com
