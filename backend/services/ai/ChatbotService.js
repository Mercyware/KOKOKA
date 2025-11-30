const AI = require('./index');
const ConversationManager = require('./ConversationManager');
const KnowledgeBaseService = require('./KnowledgeBaseService');
const IntentDetector = require('./IntentDetector');
const AIConfig = require('./AIConfig');

/**
 * Chatbot Service
 * Main service for chatbot functionality
 */
class ChatbotService {
  /**
   * Send message and get AI response
   * @param {String} userId - User ID
   * @param {String} schoolId - School ID
   * @param {String} conversationId - Conversation ID (optional, creates new if not provided)
   * @param {String} message - User message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response object
   */
  async sendMessage(userId, schoolId, conversationId, message, options = {}) {
    const startTime = Date.now();

    try {
      // Check if AI is enabled
      if (!AI.isEnabled()) {
        throw new Error('AI chatbot is not enabled');
      }

      // Create or get conversation
      let conversation;
      if (conversationId) {
        conversation = await ConversationManager.getConversation(conversationId, false);
        if (!conversation) {
          throw new Error('Conversation not found');
        }
      } else {
        conversation = await ConversationManager.createConversation(
          userId,
          schoolId,
          options.conversationType || 'FAQ'
        );
        conversationId = conversation.id;
      }

      // Detect intent
      const intentResult = IntentDetector.detect(message);

      // Save user message
      await ConversationManager.addMessage(conversationId, 'USER', message, {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
      });

      // Get conversation history
      const conversationMessages = await ConversationManager.formatMessagesForAI(conversationId);

      // Add current message
      conversationMessages.push({
        role: 'user',
        content: message,
      });

      // Try to get response from knowledge base first
      const config = AIConfig.getChatbotConfig();
      let aiResponse;
      let source = 'ai';

      if (config.fallbackToKB && this.shouldUseKnowledgeBase(intentResult)) {
        const kbResults = await KnowledgeBaseService.search(message, schoolId, 3);

        if (kbResults.length > 0) {
          // Found relevant KB entries, use them
          aiResponse = this.formatKBResponse(kbResults);
          source = 'knowledge_base';
        }
      }

      // If no KB result, use AI
      if (!aiResponse) {
        const aiResult = await AI.chat(conversationMessages, {
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 1000,
        });

        aiResponse = aiResult.content;
      }

      // Get suggested actions
      const suggestedActions = IntentDetector.getSuggestedActions(intentResult.intent);

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Save AI response
      const responseMessage = await ConversationManager.addMessage(
        conversationId,
        'ASSISTANT',
        aiResponse,
        {
          suggestedActions,
          aiModel: source === 'ai' ? AI.getInfo().model : 'knowledge_base',
          responseTime,
        }
      );

      // Auto-generate title if first exchange
      const messageCount = await ConversationManager.getMessages(conversationId);
      if (messageCount.length === 2 && !conversation.title) {
        const title = ConversationManager.generateSummary([
          { role: 'USER', content: message },
        ]);
        await ConversationManager.updateTitle(conversationId, title);
      }

      return {
        success: true,
        conversationId,
        message: {
          id: responseMessage.id,
          content: aiResponse,
          role: 'assistant',
          intent: intentResult,
          suggestedActions,
          source,
          responseTime,
        },
      };
    } catch (error) {
      console.error('Chatbot send message error:', error);
      throw error;
    }
  }

  /**
   * Stream message response
   */
  async *streamMessage(userId, schoolId, conversationId, message, options = {}) {
    try {
      // Check if AI is enabled
      if (!AI.isEnabled()) {
        throw new Error('AI chatbot is not enabled');
      }

      // Create or get conversation
      let conversation;
      if (conversationId) {
        conversation = await ConversationManager.getConversation(conversationId, false);
        if (!conversation) {
          throw new Error('Conversation not found');
        }
      } else {
        conversation = await ConversationManager.createConversation(
          userId,
          schoolId,
          options.conversationType || 'FAQ'
        );
        conversationId = conversation.id;
      }

      // Detect intent
      const intentResult = IntentDetector.detect(message);

      // Save user message
      await ConversationManager.addMessage(conversationId, 'USER', message, {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
      });

      // Get conversation history
      const conversationMessages = await ConversationManager.formatMessagesForAI(conversationId);
      conversationMessages.push({ role: 'user', content: message });

      // Stream AI response
      let fullResponse = '';
      for await (const chunk of AI.streamChat(conversationMessages, options)) {
        if (!chunk.finished) {
          fullResponse += chunk.content;
          yield {
            conversationId,
            content: chunk.content,
            finished: false,
          };
        }
      }

      // Save complete response
      const suggestedActions = IntentDetector.getSuggestedActions(intentResult.intent);
      await ConversationManager.addMessage(conversationId, 'ASSISTANT', fullResponse, {
        suggestedActions,
        aiModel: AI.getInfo().model,
      });

      yield {
        conversationId,
        finished: true,
        suggestedActions,
      };
    } catch (error) {
      console.error('Chatbot stream error:', error);
      throw error;
    }
  }

  /**
   * Get conversation
   */
  async getConversation(conversationId) {
    return ConversationManager.getConversation(conversationId);
  }

  /**
   * Get user conversations
   */
  async getUserConversations(userId, limit = 20) {
    return ConversationManager.getUserConversations(userId, limit);
  }

  /**
   * Close conversation
   */
  async closeConversation(conversationId) {
    return ConversationManager.updateStatus(conversationId, 'CLOSED');
  }

  /**
   * Rate message
   */
  async rateMessage(messageId, helpful, feedback = null) {
    return ConversationManager.rateMessage(messageId, helpful, feedback);
  }

  /**
   * Get suggested questions
   */
  async getSuggestedQuestions(schoolId = null, limit = 10) {
    return KnowledgeBaseService.getSuggestedQuestions(limit, schoolId);
  }

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(query, schoolId = null, limit = 5) {
    return KnowledgeBaseService.search(query, schoolId, limit);
  }

  /**
   * Get chatbot analytics
   */
  async getAnalytics(schoolId, startDate = null, endDate = null) {
    return ConversationManager.getAnalytics(schoolId, startDate, endDate);
  }

  /**
   * Check if should use knowledge base for this intent
   */
  shouldUseKnowledgeBase(intentResult) {
    // Use KB for common queries with high confidence
    const kbIntents = [
      'ADMISSION',
      'FEES',
      'TIMETABLE',
      'EXAMS',
      'TRANSPORTATION',
      'LIBRARY',
      'HOSTEL',
    ];

    return kbIntents.includes(intentResult.intent) && intentResult.confidence > 0.8;
  }

  /**
   * Format knowledge base response
   */
  formatKBResponse(kbResults) {
    if (kbResults.length === 0) return null;

    if (kbResults.length === 1) {
      return kbResults[0].answer;
    }

    // Multiple results - format as options
    let response = 'Here are some relevant answers:\n\n';
    kbResults.forEach((result, index) => {
      response += `${index + 1}. **${result.question}**\n${result.answer}\n\n`;
    });

    return response;
  }

  /**
   * Close inactive conversations (cleanup task)
   */
  async closeInactiveConversations(inactiveHours = 24) {
    return ConversationManager.closeInactiveConversations(inactiveHours);
  }
}

module.exports = new ChatbotService();
