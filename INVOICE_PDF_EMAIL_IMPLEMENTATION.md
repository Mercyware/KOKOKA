# Invoice PDF Generation & Email System Implementation

## Overview
Implemented a complete system for generating PDF invoices and sending them via email using the scheduler service queue system.

## Features Implemented

### 1. PDF Invoice Generation (`backend/utils/pdfGenerator.js`)
- Professional invoice PDF layout with school branding
- Includes all invoice details (items, amounts, student info)
- Payment information section with:
  - Online payment link (if enabled)
  - Bank transfer details
  - Instructions for payment
- Customizable currency per school
- School-specific information (logo, address, contact)

### 2. Email Service Integration (`backend/services/invoiceEmailService.js`)
- Queue-based email sending via scheduler service
- HTML and plain text email formats
- PDF invoice attachment
- Sends to student or guardian email
- Tracks email history (lastReminderDate, reminderCount)
- Professional email template with:
  - Invoice summary
  - Payment buttons (online payment if enabled)
  - Bank details
  - School contact information

### 3. Backend API Endpoints (`backend/controllers/invoiceController.js`)
- `POST /finance/invoices/:id/send` - Send invoice via email
- `GET /finance/invoices/:id/pdf` - Download invoice PDF

### 4. Frontend Integration (`frontend/src/pages/finance/ViewInvoicePage.tsx`)
- Email button to send invoice to student/guardian
- PDF download button
- Loading states and error handling
- Success notifications

### 5. Database Schema Updates (`backend/prisma/schema.prisma`)
Added fields to School model:
- `currency` - School currency symbol (default: ₦)
- `bankName` - Bank name for transfers
- `accountName` - Account holder name
- `accountNumber` - Bank account number
- `bankBranch` - Bank branch details
- `enableOnlinePayment` - Toggle for online payment option

## How It Works

### Sending an Invoice Email:
1. User clicks "Email" button on invoice page
2. Frontend calls `POST /finance/invoices/:id/send`
3. Backend (`invoiceEmailService.js`):
   - Fetches invoice with all related data (student, items, school)
   - Generates PDF using PDFKit
   - Creates HTML email with payment links and bank details
   - Sends job to **invoice generation queue** (SQS_REGULAR_QUEUE_URL) via scheduler service
   - Invoice email is queued with priority=5 (regular priority)
4. Scheduler service worker:
   - Polls invoice generation queue
   - Picks up invoice email job
   - Sends email with PDF attachment via configured email provider (SMTP/SES)
   - Handles retries if sending fails
5. Invoice reminder count is incremented in database

### Downloading Invoice PDF:
1. User clicks "PDF" button
2. Opens `GET /finance/invoices/:id/pdf?token=...`
3. Backend generates PDF on-the-fly
4. Returns PDF file for download

## Configuration Required

### 1. Environment Variables (.env)
```bash
# Frontend URL for payment links
FRONTEND_URL=http://localhost:3000

# Email configuration (in scheduler service)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AWS SQS Queue Configuration
# The system uses two queues: regular (priority 4-10) and priority (priority 1-3)
# Invoice emails use regular queue (priority=5)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
SQS_REGULAR_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/account/invoice-generation-queue
SQS_PRIORITY_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/account/priority-queue

# Legacy/Alternative: Single queue URL (not recommended)
# SQS_QUEUE_URL=your-queue-url
```

**Queue Setup:**
- Create an SQS queue named `invoice-generation-queue` (or your preferred name)
- This queue will be used for all regular priority emails including invoice notifications
- High priority emails (verification, password reset) use the priority queue
- Invoice emails are sent with priority=5 (regular queue)

### 2. School Settings
Update school settings with:
- Bank name
- Account number
- Account name
- Bank branch
- Currency symbol
- Enable/disable online payment

### 3. Database Migration
Run:
```bash
cd backend
npm run db:migrate
```

## Payment Flow

### Online Payment:
- Email includes clickable "Pay Online Now" button
- Links to: `{FRONTEND_URL}/finance/invoices/{invoiceId}/pay`
- Integrates with existing Paystack payment system

### Bank Transfer:
- Email includes complete bank details
- Instructions to use invoice number as reference
- Manual payment recording via admin panel

## Email Templates

### HTML Email Includes:
- School header with branding
- Invoice summary (number, amount, balance)
- Student details
- Payment options (online button + bank details)
- PDF attachment
- School contact information
- Professional footer

### Plain Text Email:
- Same information in readable text format
- For email clients that don't support HTML

## Testing

### Test Email Sending:
1. Create an invoice
2. Go to invoice detail page
3. Click "Email" button
4. Check recipient email (student or guardian)
5. Verify PDF attachment opens correctly
6. Test payment links work

### Test PDF Download:
1. Go to invoice detail page
2. Click "PDF" button
3. Verify PDF opens in new tab
4. Check all information is correct
5. Verify school branding and bank details

## Future Enhancements

1. **Batch Email Sending**: Send invoices to multiple students at once
2. **Email Scheduling**: Schedule reminder emails for overdue invoices
3. **SMS Notifications**: Send SMS when invoice is issued
4. **Email Templates**: Allow schools to customize email templates
5. **Parent Portal**: Allow parents to view/download invoices themselves
6. **Payment Receipts**: Auto-generate and email payment receipts
7. **Multi-language Support**: Translate emails based on student preferences

## Files Created/Modified

### Created:
- `backend/utils/pdfGenerator.js`
- `backend/services/invoiceEmailService.js`

### Modified:
- `backend/controllers/invoiceController.js`
- `backend/routes/financeRoutes.js`
- `backend/prisma/schema.prisma`
- `frontend/src/services/financeService.ts`
- `frontend/src/pages/finance/ViewInvoicePage.tsx`

## Queue Architecture

### Two-Queue System:
The scheduler service uses a priority-based dual queue system:

1. **Regular Queue** (`SQS_REGULAR_QUEUE_URL`):
   - Handles emails with priority 4-10
   - Used for: Invoice notifications, general notifications, bulk emails
   - Invoice emails are sent with **priority=5**
   - Queue name suggestion: `invoice-generation-queue` or `regular-emails-queue`

2. **Priority Queue** (`SQS_PRIORITY_QUEUE_URL`):
   - Handles emails with priority 1-3
   - Used for: Email verification, password resets, critical notifications
   - Ensures time-sensitive emails are processed first
   - Queue name suggestion: `priority-emails-queue`

### Invoice Email Flow:
```
Invoice Controller
    ↓
invoiceEmailService.sendInvoiceEmail()
    ↓
schedulerClient.sendEmail({ priority: 5, ... })
    ↓
Scheduler Service Client
    ↓
AWS SQS Regular Queue (invoice-generation-queue)
    ↓
Scheduler Service Worker
    ↓
Email Provider (SMTP/SES)
    ↓
Recipient (Student/Guardian)
```

### Benefits:
- **Reliability**: Queue-based system with automatic retries
- **Scalability**: Can handle bulk invoice generation without blocking
- **Priority Management**: Critical emails processed before invoices
- **Monitoring**: Separate queues allow tracking invoice email metrics
- **Flexibility**: Easy to add new email types with appropriate priorities

## Dependencies
- `pdfkit` - PDF generation (already installed)
- `nodemailer` - Email sending (in scheduler service)
- Scheduler service client - Queue integration

## Notes
- Invoices are generated on-the-fly (not stored)
- Email sending is asynchronous via queue
- PDF generation uses school-specific branding
- System supports multiple currencies
- Online payment can be toggled per school
