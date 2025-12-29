# Queue Setup Guide - Invoice Generation Queue

## Overview
The KOKOKA system uses AWS SQS queues for reliable email delivery. Invoice emails are sent through a dedicated queue for better tracking and scalability.

## Queue Architecture

### Two-Queue System:
1. **Regular Queue** - For invoice notifications and general emails
2. **Priority Queue** - For critical emails (verification, password reset)

## AWS SQS Setup

### 1. Create Regular Queue (Invoice Generation)
```bash
# Queue Name: invoice-generation-queue (or your preferred name)
# Type: Standard Queue
# Configuration:
- Visibility Timeout: 300 seconds (5 minutes)
- Message Retention Period: 345600 seconds (4 days)
- Delivery Delay: 0 seconds
- Maximum Message Size: 256 KB
- Receive Message Wait Time: 0 seconds
```

### 2. Create Priority Queue
```bash
# Queue Name: priority-emails-queue
# Type: Standard Queue
# Same configuration as regular queue
```

### 3. Get Queue URLs
After creating queues, get their URLs:
- Format: `https://sqs.{region}.amazonaws.com/{account-id}/{queue-name}`
- Example: `https://sqs.us-east-1.amazonaws.com/123456789012/invoice-generation-queue`

## Environment Configuration

### Backend `.env`:
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Queue URLs
SQS_REGULAR_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/account/invoice-generation-queue
SQS_PRIORITY_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/account/priority-emails-queue

# Email Configuration
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend URL (for payment links in emails)
FRONTEND_URL=http://localhost:3000
```

### Scheduler Service `.env`:
Same configuration as backend

## IAM Permissions

Your AWS user needs these SQS permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage",
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes",
        "sqs:GetQueueUrl"
      ],
      "Resource": [
        "arn:aws:sqs:us-east-1:account-id:invoice-generation-queue",
        "arn:aws:sqs:us-east-1:account-id:priority-emails-queue"
      ]
    }
  ]
}
```

## Queue Flow

### Invoice Email Journey:
```
1. User clicks "Email" on invoice page
   ↓
2. Backend generates PDF and email content
   ↓
3. Message sent to invoice-generation-queue
   ↓
4. Scheduler worker polls queue
   ↓
5. Worker sends email via SMTP/SES
   ↓
6. Message deleted from queue
   ↓
7. Recipient receives email with PDF
```

### Priority Levels:
- **Priority 1-3**: Critical emails → Priority Queue
  - Email verification
  - Password reset
  - Account notifications
  
- **Priority 4-10**: Regular emails → Invoice Generation Queue
  - Invoice notifications (priority=5)
  - General notifications
  - Bulk emails

## Testing Queue Setup

### 1. Test Queue Connectivity:
```bash
cd backend
node -e "
const schedulerClient = require('./services/schedulerClient');
schedulerClient.getClient().then(client => {
  return client.healthcheck();
}).then(result => {
  console.log('Queue health:', result);
}).catch(err => {
  console.error('Queue error:', err);
});
"
```

### 2. Test Invoice Email:
```bash
# Create an invoice first, then:
# 1. Navigate to invoice detail page
# 2. Click "Email" button
# 3. Check AWS SQS console to see message in queue
# 4. Check recipient email for delivery
```

### 3. Monitor Queue in AWS Console:
- Go to AWS SQS Console
- Select `invoice-generation-queue`
- View metrics:
  - Messages Available
  - Messages In Flight
  - Messages Sent
  - Oldest Message Age

## Troubleshooting

### Email not sending:
1. Check queue has messages: AWS SQS Console
2. Verify scheduler service is running: `docker ps`
3. Check scheduler logs: `docker logs scheduler-service`
4. Verify AWS credentials are correct
5. Check queue URLs are correct format

### Messages stuck in queue:
1. Check worker is polling: Scheduler logs
2. Verify SMTP credentials are correct
3. Check email provider rate limits
4. Review visibility timeout setting

### Queue not receiving messages:
1. Verify AWS credentials have SQS:SendMessage permission
2. Check queue URL is correct in environment
3. Review backend logs for errors
4. Test queue connectivity with health check

## Cost Considerations

### AWS SQS Pricing (as of 2024):
- First 1M requests/month: FREE
- Additional requests: $0.40 per million
- Invoice emails are well within free tier for most schools

### Email Provider Costs:
- **SMTP (Gmail)**: Free for low volume
- **AWS SES**: $0.10 per 1,000 emails
- **SendGrid**: Free tier available

## Best Practices

1. **Separate Queues**: Keep invoice and priority emails in separate queues for better monitoring
2. **Dead Letter Queue**: Configure DLQ for failed messages (optional)
3. **CloudWatch Alarms**: Set alarms for queue depth > 1000 messages
4. **Encryption**: Enable encryption at rest for sensitive data
5. **Logging**: Monitor scheduler logs for email delivery issues

## Alternative: Local Development

For local development without AWS:
```bash
# Use in-memory queue (not recommended for production)
QUEUE_PROVIDER=memory

# Or use LocalStack (AWS emulator)
docker run -d -p 4566:4566 localstack/localstack
AWS_ENDPOINT=http://localhost:4566
```

## Production Checklist

- [ ] Create both SQS queues in AWS
- [ ] Configure IAM permissions
- [ ] Set environment variables with queue URLs
- [ ] Configure email provider (SMTP/SES)
- [ ] Test invoice email sending
- [ ] Set up CloudWatch monitoring
- [ ] Configure DLQ for failed messages
- [ ] Review and adjust queue settings
- [ ] Test with production email addresses
- [ ] Monitor costs and usage

## Support

For issues with queue setup:
1. Check AWS SQS documentation
2. Review scheduler service logs
3. Test with AWS CLI commands
4. Verify IAM permissions
5. Check network/firewall rules

---

**Queue Name**: `invoice-generation-queue`  
**Purpose**: Reliable delivery of invoice email notifications with PDF attachments  
**Priority**: Regular (5/10) for consistent processing without blocking critical emails
