# Quick Start Guide - KOKOKA Scheduler Service

This guide will help you get the scheduler service running quickly.

## Prerequisites

- Node.js (v16 or higher)
- Redis server running
- AWS SQS queues set up (if using AWS)
- AWS SES configured (if using SES for email)

## Environment Setup

### Option 1: AWS SQS + AWS SES

Create a `.env` file in the `scheduler-service` directory:

```env
QUEUE_PROVIDER=aws-sqs

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

SQS_PRIORITY_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/YOUR_ACCOUNT_ID/PriorityEmails
SQS_REGULAR_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/YOUR_ACCOUNT_ID/RegularEmails

EMAIL_PROVIDER=ses
SES_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SES_SMTP_PORT=587
SES_SMTP_USER=your_ses_smtp_username
SES_SMTP_PASSWORD=your_ses_smtp_password

EMAIL_FROM=noreply@yourschool.com
EMAIL_FROM_NAME=KOKOKA School Management
```

### Option 2: Redis Queue + SMTP

```env
QUEUE_PROVIDER=redis
REDIS_URL=redis://localhost:6379

EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

EMAIL_FROM=noreply@yourschool.com
EMAIL_FROM_NAME=KOKOKA School Management
```

## Installation

```bash
cd scheduler-service
npm install
```

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Verifying Setup

1. The service should start without errors
2. Check logs for successful Redis/SQS connection
3. Send a test email job to verify email delivery

## Testing

### Send Test Email Job

You can queue a test email from the main backend:

```javascript
const schedulerClient = require('./services/schedulerClient');

await schedulerClient.queueEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Hello World</h1>',
  text: 'Hello World',
  priority: 10 // High priority
});
```

### Monitor Queue Status

Check Redis queue length (if using Redis):
```bash
redis-cli LLEN email_queue:priority
redis-cli LLEN email_queue:regular
```

Check AWS SQS (if using AWS):
```bash
aws sqs get-queue-attributes --queue-url YOUR_QUEUE_URL --attribute-names ApproximateNumberOfMessages
```

## Architecture Overview

The scheduler service operates independently:

1. **Backend** queues email jobs via HTTP API
2. **Scheduler** pulls jobs from queue
3. **Workers** process jobs and send emails
4. **Email providers** deliver emails (SES or SMTP)

## Priority System

- **Priority 10**: Critical (password reset, account verification)
- **Priority 8**: High (invoice emails, payment confirmations)
- **Priority 5**: Regular (general notifications)
- **Priority 1**: Low (newsletters, bulk emails)

## Troubleshooting

### Service won't start
- Check Redis/SQS connection
- Verify environment variables
- Check port 3001 is available

### Emails not sending
- Verify SMTP/SES credentials
- Check email provider logs
- Verify queue has messages

### High latency
- Scale workers (adjust WORKER_CONCURRENCY)
- Check queue backlog
- Monitor email provider rate limits

## Monitoring

The service exposes health endpoints:

- `GET /health` - Service health check
- `GET /queue/stats` - Queue statistics

## Production Deployment

1. Use process manager (PM2, systemd)
2. Set up monitoring (Datadog, CloudWatch)
3. Configure log rotation
4. Enable rate limiting
5. Set up auto-scaling for workers

## Support

For issues or questions, contact the development team or check the main project README.
