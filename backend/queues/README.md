# Email Queue System

## Overview

The email system has been re-implemented to decouple email sending from the main application processes. This provides several benefits:

- **Non-blocking**: Emails are queued and sent asynchronously, not blocking HTTP requests
- **Reliability**: Failed emails are automatically retried with exponential backoff
- **Scalability**: Email workers can be scaled independently
- **Monitoring**: Built-in job tracking and statistics
- **Scheduling**: Support for delayed/scheduled emails
- **Priority**: Different email types can have different priorities

## Architecture

```
┌─────────────────┐
│  Controllers    │
│  (API Layer)    │
└────────┬────────┘
         │
         ▼
┌────────────────────┐
│ QueuedEmailService │
│  (Facade Layer)    │
└────────┬───────────┘
         │
         ▼
┌─────────────────┐
│  Email Queue    │
│  (Bull/Redis)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Email Worker   │
│  (Processor)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Email Service  │
│  (SMTP/SES)     │
└─────────────────┘
```

## Components

### 1. Email Queue (`queues/emailQueue.js`)
- Manages the Bull queue for email jobs
- Defines job types and priorities
- Provides queue management functions
- Handles queue events and monitoring

### 2. Email Worker (`workers/emailWorker.js`)
- Processes jobs from the email queue
- Sends emails using the email service
- Handles retries and failures
- Runs as a separate process

### 3. Queued Email Service (`services/queuedEmailService.js`)
- Provides a simple API for queueing emails
- Wraps queue operations in easy-to-use methods
- Handles priority and scheduling
- Used by controllers and other services

## Usage

### Basic Email

```javascript
const queuedEmailService = require('../services/queuedEmailService');

// Queue an email (non-blocking)
await queuedEmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  text: 'Plain text content',
  html: '<p>HTML content</p>',
  priority: 5 // Optional, default is 5 (1=highest, 10=lowest)
});
```

### Welcome Email

```javascript
await queuedEmailService.sendWelcomeEmail({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'TEACHER',
  schoolName: 'Greenwood School',
  subdomain: 'greenwood',
  priority: 3 // Higher priority for welcome emails
});
```

### Password Reset

```javascript
await queuedEmailService.sendPasswordResetEmail({
  email: 'user@example.com',
  name: 'John Doe',
  resetToken: 'abc123',
  priority: 1 // Highest priority
});
```

### Scheduled Email

```javascript
// Send email in 1 hour
const oneHour = 60 * 60 * 1000;
await queuedEmailService.sendEmail({
  to: 'user@example.com',
  subject: 'Reminder',
  text: 'This is your reminder',
  delay: oneHour
});

// Or use scheduleEmail
const scheduledTime = new Date('2025-12-25T09:00:00');
await queuedEmailService.scheduleEmail({
  to: 'user@example.com',
  subject: 'Christmas Greeting',
  text: 'Merry Christmas!'
}, scheduledTime);
```

### Bulk Emails

```javascript
const emails = [
  { to: 'user1@example.com', subject: 'Newsletter', text: 'Content 1' },
  { to: 'user2@example.com', subject: 'Newsletter', text: 'Content 2' },
  // ... more emails
];

await queuedEmailService.sendBulkEmails(emails, {
  priority: 7 // Lower priority for bulk emails
});
```

## Running the Email Worker

### Development

```bash
# Start the email worker in development mode (with auto-reload)
npm run worker:email:dev
```

### Production

```bash
# Start the email worker
npm run worker:email

# Or use a process manager like PM2
pm2 start workers/emailWorker.js --name email-worker
pm2 startup
pm2 save
```

## Monitoring

### Get Queue Statistics

```javascript
const stats = await queuedEmailService.getStats();
console.log(stats);
// {
//   waiting: 10,
//   active: 2,
//   completed: 1500,
//   failed: 5,
//   delayed: 3,
//   total: 1520
// }
```

### Queue Dashboard

You can use [Bull Board](https://github.com/felixmosh/bull-board) for a web-based dashboard:

```bash
npm install @bull-board/express
```

## Email Job Types

| Type | Priority | Description |
|------|----------|-------------|
| `SEND_PASSWORD_RESET` | 1 (Highest) | Password reset emails |
| `SEND_VERIFICATION` | 2 | Email verification |
| `SEND_WELCOME` | 3 | Welcome/registration emails |
| `SEND_EXAM_RESULTS` | 4 | Exam result notifications |
| `SEND_EMAIL` | 5 (Default) | Generic emails |
| `SEND_NOTIFICATION` | 5 | General notifications |
| `SEND_FEE_REMINDER` | 6 | Fee payment reminders |
| `SEND_BULK_EMAIL` | 7 (Lowest) | Bulk email campaigns |

## Retry Configuration

- **Attempts**: 3 (emails are retried up to 3 times)
- **Backoff**: Exponential (2s, 4s, 8s)
- **Completed Job Retention**: 24 hours (last 1000 jobs)
- **Failed Job Retention**: 7 days

## Redis Configuration

The email queue uses a separate Redis database (DB 2 by default) to avoid conflicts with other Redis data.

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_EMAIL_QUEUE_DB=2
```

## Migration from Old System

The old email system (`utils/email.js`) is still available as a fallback, but all new code should use the queued email service:

**Before:**
```javascript
const { sendEmail } = require('../utils/email');
await sendEmail({ to, subject, text, html }); // Blocking
```

**After:**
```javascript
const queuedEmailService = require('../services/queuedEmailService');
queuedEmailService.sendEmail({ to, subject, text, html }); // Non-blocking, returns immediately
```

## Error Handling

Emails are queued asynchronously, so errors don't block the main request. Failed emails are automatically retried, and you can monitor failures through the queue statistics or Bull Board dashboard.

```javascript
// Option 1: Fire and forget (recommended for most cases)
queuedEmailService.sendEmail({ ... }).catch(err => {
  console.error('Failed to queue email:', err);
});

// Option 2: Wait for queue confirmation (if you need to know it was queued)
try {
  const result = await queuedEmailService.sendEmail({ ... });
  console.log('Email queued:', result.jobId);
} catch (error) {
  console.error('Failed to queue email:', error);
}
```

## Troubleshooting

### Worker not processing jobs

1. Check if Redis is running: `redis-cli ping`
2. Check if the worker is running: `ps aux | grep emailWorker`
3. Check worker logs for errors
4. Verify Redis connection settings

### Emails stuck in queue

1. Check queue stats: `await queuedEmailService.getStats()`
2. Check for stalled jobs in Redis
3. Restart the email worker
4. Check email service configuration (SMTP/SES credentials)

### High failure rate

1. Check SMTP/SES credentials
2. Verify email service is accessible
3. Check for rate limiting issues
4. Review failed job logs

## Best Practices

1. **Always use queued emails** for user-triggered actions (registration, password reset, etc.)
2. **Set appropriate priorities** based on email urgency
3. **Use bulk email methods** for mass communications
4. **Monitor queue statistics** regularly
5. **Keep the worker running** in production (use PM2 or similar)
6. **Clean old jobs** periodically to avoid Redis memory issues
7. **Don't wait for email sending** in API responses (use fire-and-forget pattern)
