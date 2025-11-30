# AI Services

Unified AI provider system supporting multiple AI services with easy switching between providers.

## Supported Providers

- **OpenAI** - Standard OpenAI API
- **Azure OpenAI** - Microsoft Azure OpenAI Service
- **Claude** - Anthropic Claude API

## Configuration

Configure AI services via environment variables in `.env`:

### Provider Selection

```env
AI_PROVIDER=openai  # Options: openai, azure-openai, claude
FEATURE_AI_ENABLED=true
```

### OpenAI Configuration

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7
```

### Azure OpenAI Configuration

```env
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### Claude Configuration

```env
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=1000
CLAUDE_TEMPERATURE=0.7
```

## Usage

### Basic Chat

```javascript
const AI = require('./services/ai');

// Simple chat
const response = await AI.chat([
  { role: 'user', content: 'What is the school calendar?' }
]);

console.log(response.content);
```

### Chat with History

```javascript
const messages = [
  { role: 'system', content: 'You are a helpful school assistant.' },
  { role: 'user', content: 'What are the exam dates?' },
  { role: 'assistant', content: 'Exams start on March 15th.' },
  { role: 'user', content: 'What subjects are included?' }
];

const response = await AI.chat(messages);
```

### Single Completion

```javascript
const response = await AI.complete(
  'Summarize the school admission process in 3 steps'
);

console.log(response.content);
```

### Streaming Responses

```javascript
for await (const chunk of AI.streamChat(messages)) {
  if (!chunk.finished) {
    process.stdout.write(chunk.content);
  }
}
```

### Provider Information

```javascript
// Check if AI is enabled
if (AI.isEnabled()) {
  console.log('AI is enabled');
}

// Get provider info
const info = AI.getInfo();
console.log(`Using ${info.provider} with model ${info.model}`);

// Get full configuration
const config = AI.getConfig();
console.log(config);

// Validate configuration
const validation = AI.validateConfig();
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Provider Switching

To switch providers, simply change the `AI_PROVIDER` environment variable and restart the application:

```env
# Use OpenAI
AI_PROVIDER=openai

# Use Azure OpenAI
AI_PROVIDER=azure-openai

# Use Claude
AI_PROVIDER=claude
```

## Advanced Usage

### Custom Options

```javascript
const response = await AI.chat(messages, {
  temperature: 0.9,
  maxTokens: 2000,
  topP: 0.95
});
```

### Direct Provider Access

```javascript
const provider = AI.getAIProvider();
const info = provider.getInfo();

// Check if configured
if (provider.isConfigured()) {
  const response = await provider.chat(messages);
}
```

### Token Estimation

```javascript
const provider = AI.getAIProvider();
const tokens = provider.estimateTokens('Your text here');
console.log(`Estimated tokens: ${tokens}`);
```

## Response Format

All providers return responses in a standardized format:

```javascript
{
  content: "The AI response text",
  role: "assistant",
  finishReason: "stop",
  model: "gpt-4",
  usage: {
    promptTokens: 50,
    completionTokens: 100,
    totalTokens: 150
  },
  provider: "openai"
}
```

## Error Handling

```javascript
try {
  const response = await AI.chat(messages);
  console.log(response.content);
} catch (error) {
  console.error('AI Error:', error.message);
  // Handle error appropriately
}
```

## Rate Limiting

Configure rate limits in `.env`:

```env
AI_RATE_LIMIT_REQUESTS_PER_MINUTE=60
AI_RATE_LIMIT_REQUESTS_PER_DAY=1000
```

## Caching

Enable caching to reduce API calls:

```env
AI_CACHE_ENABLED=true
AI_CACHE_TTL=3600  # Cache TTL in seconds
```

## Architecture

```
services/ai/
├── AIProvider.js           # Base abstract class
├── OpenAIProvider.js       # OpenAI & Azure OpenAI implementation
├── ClaudeProvider.js       # Claude implementation
├── AIProviderFactory.js    # Factory for provider creation
├── AIConfig.js             # Configuration management
├── index.js                # Main export module
└── README.md               # This file
```

## Testing

```bash
# Test AI configuration
node -e "const AI = require('./services/ai'); console.log(AI.validateConfig())"

# Test AI provider
node -e "const AI = require('./services/ai'); AI.complete('Hello').then(r => console.log(r))"
```

## Best Practices

1. **Always check if AI is enabled** before using AI features
2. **Handle errors gracefully** - AI services may be unavailable
3. **Use appropriate models** - Choose models based on task complexity
4. **Implement caching** - Reduce costs by caching common responses
5. **Monitor usage** - Track token usage and costs
6. **Set reasonable timeouts** - Prevent long-running requests
7. **Include system prompts** - Guide AI behavior with clear instructions

## Security

- Never commit API keys to version control
- Use environment variables for all sensitive configuration
- Implement rate limiting to prevent abuse
- Monitor AI usage for anomalies
- Sanitize user inputs before sending to AI

## Troubleshooting

### Provider not configured

```
Error: OPENAI_API_KEY is required for OpenAI provider
```

**Solution**: Set the required environment variables for your chosen provider.

### Timeout errors

```
Error: AI Provider Error: Request timeout
```

**Solution**: Increase `OPENAI_TIMEOUT`, `AZURE_OPENAI_TIMEOUT`, or `CLAUDE_TIMEOUT`.

### Rate limit exceeded

```
Error: AI Provider Error: Rate limit exceeded
```

**Solution**: Implement request queuing or reduce request frequency.

## Future Enhancements

- [ ] Support for additional providers (Google PaLM, Cohere, etc.)
- [ ] Built-in rate limiting middleware
- [ ] Response caching layer
- [ ] Usage analytics and monitoring
- [ ] Automatic fallback between providers
- [ ] Function calling support
- [ ] Image generation capabilities
- [ ] Embeddings support
