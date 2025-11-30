const express = require('express');
const router = express.Router();
const AI = require('../services/ai');

/**
 * @route   GET /api/ai-test/info
 * @desc    Get AI provider information
 * @access  Public (for testing - should be protected in production)
 */
router.get('/info', (req, res) => {
  try {
    const info = AI.getInfo();
    const config = AI.getConfig();
    const validation = AI.validateConfig();

    res.json({
      success: true,
      data: {
        info,
        config,
        validation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI info',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-test/chat
 * @desc    Test AI chat completion
 * @access  Public (for testing - should be protected in production)
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages, options } = req.body;

    if (!AI.isEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'AI services are not enabled or not configured'
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'messages array is required'
      });
    }

    const response = await AI.chat(messages, options);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'AI chat failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-test/complete
 * @desc    Test AI single completion
 * @access  Public (for testing - should be protected in production)
 */
router.post('/complete', async (req, res) => {
  try {
    const { prompt, options } = req.body;

    if (!AI.isEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'AI services are not enabled or not configured'
      });
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'prompt is required'
      });
    }

    const response = await AI.complete(prompt, options);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI complete error:', error);
    res.status(500).json({
      success: false,
      message: 'AI completion failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-test/stream
 * @desc    Test AI streaming (SSE)
 * @access  Public (for testing - should be protected in production)
 */
router.post('/stream', async (req, res) => {
  try {
    const { messages, options } = req.body;

    if (!AI.isEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'AI services are not enabled or not configured'
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'messages array is required'
      });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the response
    for await (const chunk of AI.streamChat(messages, options)) {
      if (chunk.finished) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
      }
    }

    res.end();
  } catch (error) {
    console.error('AI stream error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
