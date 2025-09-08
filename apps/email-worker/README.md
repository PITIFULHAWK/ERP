# Email Worker

A Redis-based email worker service that processes email jobs from a message queue using nodemailer.

## Features

- 📧 Processes email jobs from Redis queue
- 🔄 Automatic retry mechanism with exponential backoff
- 📊 Queue monitoring and statistics
- 🛡️ Graceful shutdown handling
- 📝 Comprehensive logging
- ⚡ High-priority email support
- 📎 Attachment support

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="ERP System <noreply@erp-system.com>"
```

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Production

```bash
pnpm build
pnpm start
```

## Email Job Format

The worker expects email jobs in the following format:

```json
{
  "id": "unique-job-id",
  "to": "recipient@example.com",
  "from": "sender@example.com",
  "subject": "Email Subject",
  "html": "<h1>HTML content</h1>",
  "text": "Plain text content",
  "priority": "high",
  "attachments": [
    {
      "filename": "document.pdf",
      "content": "base64-content",
      "contentType": "application/pdf"
    }
  ],
  "metadata": {
    "userId": "user-123",
    "type": "welcome-email"
  }
}
```

## Queue Operations

### Adding Jobs to Queue (from backend)

```javascript
// Add email job to Redis queue
await redisClient.lPush('email_queue', JSON.stringify(emailJob));
```

### Queue Names

- `email_queue` - Main queue for new email jobs
- `email_processing` - Jobs currently being processed
- `email_retry` - Failed jobs waiting for retry
- `email_logs` - Email processing logs

## Monitoring

The worker provides queue statistics every 5 minutes and logs all operations for monitoring purposes.
