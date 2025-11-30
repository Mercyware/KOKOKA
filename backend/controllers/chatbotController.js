const ChatbotService = require('../services/ai/ChatbotService');
const KnowledgeBaseService = require('../services/ai/KnowledgeBaseService');

/**
 * @desc    Send message to chatbot
 * @route   POST /api/chatbot/conversations/:id?/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, options } = req.body;
    const conversationId = req.params.id || null;
    const userId = req.user.id;
    const schoolId = req.school.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const response = await ChatbotService.sendMessage(
      userId,
      schoolId,
      conversationId,
      message,
      options || {}
    );

    res.json(response);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * @desc    Stream message to chatbot (SSE)
 * @route   POST /api/chatbot/conversations/:id?/stream
 * @access  Private
 */
exports.streamMessage = async (req, res) => {
  try {
    const { message, options } = req.body;
    const conversationId = req.params.id || null;
    const userId = req.user.id;
    const schoolId = req.school.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the response
    for await (const chunk of ChatbotService.streamMessage(
      userId,
      schoolId,
      conversationId,
      message,
      options || {}
    )) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Stream message error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

/**
 * @desc    Get conversation
 * @route   GET /api/chatbot/conversations/:id
 * @access  Private
 */
exports.getConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = await ChatbotService.getConversation(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Check if user owns this conversation
    if (conversation.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's conversations
 * @route   GET /api/chatbot/conversations
 * @access  Private
 */
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const conversations = await ChatbotService.getUserConversations(userId, limit);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message,
    });
  }
};

/**
 * @desc    Close conversation
 * @route   PUT /api/chatbot/conversations/:id/close
 * @access  Private
 */
exports.closeConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Verify ownership
    const conversation = await ChatbotService.getConversation(conversationId);
    if (!conversation || conversation.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    await ChatbotService.closeConversation(conversationId);

    res.json({
      success: true,
      message: 'Conversation closed',
    });
  } catch (error) {
    console.error('Close conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close conversation',
      error: error.message,
    });
  }
};

/**
 * @desc    Rate message
 * @route   PUT /api/chatbot/messages/:id/feedback
 * @access  Private
 */
exports.rateMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { helpful, feedback } = req.body;

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'helpful (boolean) is required',
      });
    }

    await ChatbotService.rateMessage(messageId, helpful, feedback);

    res.json({
      success: true,
      message: 'Feedback recorded',
    });
  } catch (error) {
    console.error('Rate message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message,
    });
  }
};

/**
 * @desc    Get suggested questions
 * @route   GET /api/chatbot/suggestions
 * @access  Private
 */
exports.getSuggestedQuestions = async (req, res) => {
  try {
    const schoolId = req.school?.id || null;
    const limit = parseInt(req.query.limit) || 10;

    const suggestions = await ChatbotService.getSuggestedQuestions(schoolId, limit);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message,
    });
  }
};

/**
 * @desc    Search knowledge base
 * @route   GET /api/chatbot/knowledge-base/search
 * @access  Private
 */
exports.searchKnowledgeBase = async (req, res) => {
  try {
    const { q, limit } = req.query;
    const schoolId = req.school?.id || null;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required',
      });
    }

    const results = await ChatbotService.searchKnowledgeBase(
      q,
      schoolId,
      parseInt(limit) || 5
    );

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search KB error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search knowledge base',
      error: error.message,
    });
  }
};

/**
 * @desc    Get chatbot analytics
 * @route   GET /api/chatbot/analytics
 * @access  Private (Admin only)
 */
exports.getAnalytics = async (req, res) => {
  try {
    const schoolId = req.school.id;
    const { startDate, endDate } = req.query;

    const analytics = await ChatbotService.getAnalytics(
      schoolId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message,
    });
  }
};

/**
 * @desc    Create knowledge base entry
 * @route   POST /api/chatbot/knowledge-base
 * @access  Private (Admin only)
 */
exports.createKBEntry = async (req, res) => {
  try {
    const schoolId = req.school?.id;
    const data = { ...req.body, schoolId };

    const entry = await KnowledgeBaseService.create(data);

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Create KB entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create knowledge base entry',
      error: error.message,
    });
  }
};

/**
 * @desc    Get knowledge base entries by category
 * @route   GET /api/chatbot/knowledge-base/category/:category
 * @access  Private
 */
exports.getKBByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const schoolId = req.school?.id || null;

    const entries = await KnowledgeBaseService.getByCategory(category, schoolId);

    res.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error('Get KB by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get knowledge base entries',
      error: error.message,
    });
  }
};
