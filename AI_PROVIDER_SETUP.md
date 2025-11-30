# AI Provider Setup Guide

Complete guide for configuring and using AI providers (OpenAI, Azure OpenAI, and Claude) in KOKOKA.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Provider Setup](#provider-setup)
5. [Switching Providers](#switching-providers)
6. [Testing](#testing)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview

KOKOKA supports three AI providers with easy switching between them:

- **OpenAI** - Direct OpenAI API access
- **Azure OpenAI** - Enterprise Microsoft Azure OpenAI Service
- **Claude** - Anthropic's Claude API

All providers share the same interface, making it easy to switch without changing code.

---

## Installation

Dependencies are already installed via `package.json`:

```bash
cd backend
npm install  # Installs openai and @anthropic-ai/sdk
```

---

## Configuration

### Step 1: Copy Environment File

```bash
cd backend
cp .env.example .env
```

### Step 2: Choose Your Provider

Set `AI_PROVIDER` in `.env`:

```env
AI_PROVIDER=openai  # or 'azure-openai' or 'claude'
FEATURE_AI_ENABLED=true
```

### Step 3: Configure Your Chosen Provider

#### Option A: OpenAI Configuration

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
OPENAI_TIMEOUT=60000
```

**Get API Key:**
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy and paste into `.env`

#### Option B: Azure OpenAI Configuration

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_MAX_TOKENS=1000
AZURE_OPENAI_TEMPERATURE=0.7
AZURE_OPENAI_TIMEOUT=60000
```

**Get Azure Credentials:**
1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your Azure OpenAI resource
3. Go to "Keys and Endpoint"
4. Copy Key 1 and Endpoint
5. Get deployment name from "Model deployments"

#### Option C: Claude Configuration

```env
# Claude Configuration
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=1000
CLAUDE_TEMPERATURE=0.7
CLAUDE_TIMEOUT=60000
```

**Get API Key:**
1. Visit https://console.anthropic.com/
2. Go to API Keys section
3. Create new API key
4. Copy and paste into `.env`

### Step 4: Configure AI Features (Optional)

```env
# Chatbot Settings
AI_CHATBOT_ENABLED=true
AI_CHATBOT_SYSTEM_PROMPT=You are a helpful school management assistant.
AI_CHATBOT_MAX_HISTORY=10
AI_CHATBOT_FALLBACK_TO_KB=true

# Performance Predictions
AI_PREDICTIONS_ENABLED=true
AI_PREDICTIONS_CONFIDENCE_THRESHOLD=0.7

# Attendance Pattern Detection
AI_ATTENDANCE_PATTERNS_ENABLED=true
AI_ATTENDANCE_ANALYSIS_WINDOW_DAYS=30

# Smart Notifications
AI_SMART_NOTIFICATIONS_ENABLED=true
AI_NOTIFICATION_OPTIMIZATION=true

# Rate Limiting
AI_RATE_LIMIT_REQUESTS_PER_MINUTE=60
AI_RATE_LIMIT_REQUESTS_PER_DAY=1000

# Caching
AI_CACHE_ENABLED=true
AI_CACHE_TTL=3600
```

---

## Provider Setup

### OpenAI Setup

1. **Create Account**: https://platform.openai.com/signup
2. **Add Payment Method**: https://platform.openai.com/account/billing/payment-methods
3. **Generate API Key**: https://platform.openai.com/api-keys
4. **Configure in .env**:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
   OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo for lower cost
   ```

**Recommended Models:**
- `gpt-4` - Best quality (more expensive)
- `gpt-4-turbo` - Good balance
- `gpt-3.5-turbo` - Faster and cheaper

### Azure OpenAI Setup

1. **Create Azure Account**: https://azure.microsoft.com/
2. **Create Azure OpenAI Resource**:
   - Go to Azure Portal
   - Search for "Azure OpenAI"
   - Click "Create"
   - Fill in resource details
3. **Deploy Model**:
   - Go to your Azure OpenAI resource
   - Click "Model deployments"
   - Deploy GPT-4 or GPT-3.5-Turbo
   - Note the deployment name
4. **Get Credentials**:
   - Go to "Keys and Endpoint"
   - Copy Key and Endpoint
5. **Configure in .env**:
   ```env
   AI_PROVIDER=azure-openai
   AZURE_OPENAI_API_KEY=YOUR_KEY
   AZURE_OPENAI_ENDPOINT=https://YOUR_RESOURCE.openai.azure.com
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4  # Your deployment name
   AZURE_OPENAI_API_VERSION=2024-02-15-preview
   ```

### Claude Setup

1. **Create Account**: https://console.anthropic.com/
2. **Add Payment Method** (if required)
3. **Generate API Key**:
   - Go to "API Keys"
   - Click "Create Key"
   - Copy the key
4. **Configure in .env**:
   ```env
   AI_PROVIDER=claude
   CLAUDE_API_KEY=sk-ant-YOUR_KEY_HERE
   CLAUDE_MODEL=claude-3-5-sonnet-20241022
   ```

**Available Models:**
- `claude-3-5-sonnet-20241022` - Best balance (recommended)
- `claude-3-opus-20240229` - Highest quality
- `claude-3-haiku-20240307` - Fastest and cheapest

---

## Switching Providers

To switch between providers, simply update `.env`:

```env
# Switch to OpenAI
AI_PROVIDER=openai

# Switch to Azure OpenAI
AI_PROVIDER=azure-openai

# Switch to Claude
AI_PROVIDER=claude
```

Then restart the backend server:

```bash
cd backend
npm run dev
```

**No code changes required!** The application will automatically use the new provider.

---

## Testing

### Test 1: Check Provider Information

```bash
# Make GET request to check AI configuration
curl http://localhost:5000/api/ai-test/info
```

Expected response:
```json
{
  "success": true,
  "data": {
    "info": {
      "provider": "openai",
      "model": "gpt-4",
      "configured": true
    },
    "config": { ... },
    "validation": {
      "valid": true,
      "errors": []
    }
  }
}
```

### Test 2: Simple Chat Completion

```bash
curl -X POST http://localhost:5000/api/ai-test/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is 2+2?"}
    ]
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "content": "2 + 2 equals 4.",
    "role": "assistant",
    "model": "gpt-4",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 8,
      "totalTokens": 18
    },
    "provider": "openai"
  }
}
```

### Test 3: Single Completion

```bash
curl -X POST http://localhost:5000/api/ai-test/complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "List 3 benefits of school management systems"
  }'
```

### Test 4: Streaming Response

```bash
curl -X POST http://localhost:5000/api/ai-test/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Tell me a short story"}
    ]
  }'
```

---

## Usage Examples

### Example 1: Simple Chat in Code

```javascript
const AI = require('./services/ai');

// Check if AI is enabled
if (!AI.isEnabled()) {
  console.log('AI is not enabled');
  return;
}

// Simple chat
const response = await AI.chat([
  { role: 'user', content: 'What are the school holiday dates?' }
]);

console.log(response.content);
```

### Example 2: Chat with System Prompt

```javascript
const messages = [
  {
    role: 'system',
    content: 'You are a helpful school assistant. Provide clear, concise answers.'
  },
  { role: 'user', content: 'How do I register a new student?' }
];

const response = await AI.chat(messages);
console.log(response.content);
```

### Example 3: Chat with History

```javascript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the admission process?' },
  { role: 'assistant', content: 'The admission process involves...' },
  { role: 'user', content: 'What documents are needed?' }
];

const response = await AI.chat(messages);
```

### Example 4: Streaming Response

```javascript
const messages = [
  { role: 'user', content: 'Explain the grading system' }
];

for await (const chunk of AI.streamChat(messages)) {
  if (!chunk.finished) {
    process.stdout.write(chunk.content);
  } else {
    console.log('\nDone!');
  }
}
```

### Example 5: Custom Options

```javascript
const response = await AI.chat(messages, {
  temperature: 0.9,      // More creative
  maxTokens: 2000,       // Longer response
  topP: 0.95
});
```

---

## Troubleshooting

### Issue: "AI services are not enabled"

**Solution:**
```env
FEATURE_AI_ENABLED=true
```

### Issue: "OPENAI_API_KEY is required"

**Solution:** Set the API key for your chosen provider in `.env`

### Issue: "Request timeout"

**Solutions:**
1. Increase timeout:
   ```env
   OPENAI_TIMEOUT=120000  # 2 minutes
   ```
2. Reduce max tokens:
   ```env
   OPENAI_MAX_TOKENS=500
   ```
3. Check internet connection

### Issue: "Rate limit exceeded"

**Solutions:**
1. Wait and retry
2. Implement request queuing
3. Upgrade your API plan
4. Reduce request frequency

### Issue: Azure OpenAI "Resource not found"

**Solutions:**
1. Check endpoint URL format
2. Verify deployment name
3. Ensure API version is correct
4. Check resource region

### Issue: Claude "Invalid API key"

**Solutions:**
1. Regenerate API key
2. Check for spaces in key
3. Verify key is active
4. Check billing status

---

## Cost Optimization

### 1. Use Appropriate Models

```env
# Development/Testing
OPENAI_MODEL=gpt-3.5-turbo
CLAUDE_MODEL=claude-3-haiku-20240307

# Production
OPENAI_MODEL=gpt-4-turbo
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### 2. Enable Caching

```env
AI_CACHE_ENABLED=true
AI_CACHE_TTL=3600  # Cache for 1 hour
```

### 3. Reduce Token Usage

```env
OPENAI_MAX_TOKENS=500  # Limit response length
```

### 4. Implement Rate Limiting

```env
AI_RATE_LIMIT_REQUESTS_PER_MINUTE=30
AI_RATE_LIMIT_REQUESTS_PER_DAY=500
```

---

## Security Best Practices

1. **Never commit API keys** - Use `.env` file
2. **Rotate keys regularly** - Change every 3-6 months
3. **Monitor usage** - Set up alerts for unusual activity
4. **Implement authentication** - Protect AI endpoints
5. **Sanitize inputs** - Validate user inputs before sending to AI
6. **Rate limit** - Prevent abuse
7. **Log requests** - Track usage for auditing

---

## Support

- **OpenAI**: https://help.openai.com/
- **Azure OpenAI**: https://learn.microsoft.com/azure/ai-services/openai/
- **Claude**: https://support.anthropic.com/

---

## Next Steps

1. ✅ Configure your chosen AI provider
2. ✅ Test the connection using test endpoints
3. 🔄 Build chatbot service (next phase)
4. 🔄 Implement attendance pattern detection
5. 🔄 Add performance predictions
6. 🔄 Enable smart notifications

See [PHASE_2_PLAN.md](PHASE_2_PLAN.md) for the complete implementation roadmap.
