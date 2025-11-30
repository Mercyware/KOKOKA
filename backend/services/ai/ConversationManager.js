const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const AIConfig = require('./AIConfig');

/**
 * Conversation Manager
 * Manages chat conversations and message history
 */
class ConversationManager {
  /**
   * Create new conversation
   */
  async createConversation(userId, schoolId, conversationType = 'FAQ', title = null) {
    return prisma.chatConversation.create({
      data: {
        userId,
        schoolId,
        conversationType,
        title,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId, includeMessages = true) {
    return prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: includeMessages
          ? {
              orderBy: { createdAt: 'asc' },
            }
          : false,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId, limit = 20, status = null) {
    return prisma.chatConversation.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Last message
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Add message to conversation
   */
  async addMessage(conversationId, role, content, metadata = {}) {
    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        role,
        content,
        intentDetected: metadata.intent,
        confidence: metadata.confidence,
        suggestedActions: metadata.suggestedActions,
        metadata: metadata.additional || {},
        aiModel: metadata.aiModel,
        tokensUsed: metadata.tokensUsed,
        responseTime: metadata.responseTime,
      },
    });

    // Update conversation last message time
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId, limit = null) {
    const query = {
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    };

    if (limit) {
      query.take = limit;
    }

    return prisma.chatMessage.findMany(query);
  }

  /**
   * Get recent messages (for context)
   */
  async getRecentMessages(conversationId, limit = null) {
    const config = AIConfig.getChatbotConfig();
    const maxHistory = limit || config.maxHistory;

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: maxHistory,
    });

    // Reverse to get chronological order
    return messages.reverse();
  }

  /**
   * Format messages for AI provider
   */
  async formatMessagesForAI(conversationId, includeSystem = true) {
    const messages = await this.getRecentMessages(conversationId);
    const formatted = [];

    // Add system prompt if requested
    if (includeSystem) {
      const config = AIConfig.getChatbotConfig();
      formatted.push({
        role: 'system',
        content: config.systemPrompt,
      });
    }

    // Add conversation messages
    messages.forEach((msg) => {
      formatted.push({
        role: msg.role.toLowerCase(),
        content: msg.content,
      });
    });

    return formatted;
  }

  /**
   * Update conversation status
   */
  async updateStatus(conversationId, status) {
    return prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        status,
        ...(status === 'CLOSED' && { endedAt: new Date() }),
      },
    });
  }

  /**
   * Update conversation title
   */
  async updateTitle(conversationId, title) {
    return prisma.chatConversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  /**
   * Rate message as helpful/not helpful
   */
  async rateMessage(messageId, helpful, feedback = null) {
    return prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        wasHelpful: helpful,
        feedbackText: feedback,
      },
    });
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId) {
    // Messages will be cascade deleted
    return prisma.chatConversation.delete({
      where: { id: conversationId },
    });
  }

  /**
   * Get conversation analytics
   */
  async getAnalytics(schoolId, startDate = null, endDate = null) {
    const where = {
      schoolId,
      ...(startDate && { createdAt: { gte: startDate } }),
      ...(endDate && { createdAt: { lte: endDate } }),
    };

    const totalConversations = await prisma.chatConversation.count({ where });

    const byStatus = await prisma.chatConversation.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const byType = await prisma.chatConversation.groupBy({
      by: ['conversationType'],
      where,
      _count: true,
    });

    const avgMessagesPerConversation = await prisma.chatMessage.count({
      where: {
        conversation: where,
      },
    });

    return {
      totalConversations,
      avgMessages: totalConversations > 0 ? avgMessagesPerConversation / totalConversations : 0,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byType: byType.map((t) => ({ type: t.conversationType, count: t._count })),
    };
  }

  /**
   * Get active conversations count
   */
  async getActiveConversationsCount(schoolId) {
    return prisma.chatConversation.count({
      where: {
        schoolId,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Close inactive conversations
   */
  async closeInactiveConversations(inactiveHours = 24) {
    const cutoffDate = new Date(Date.now() - inactiveHours * 60 * 60 * 1000);

    return prisma.chatConversation.updateMany({
      where: {
        status: 'ACTIVE',
        lastMessageAt: {
          lt: cutoffDate,
        },
      },
      data: {
        status: 'CLOSED',
        endedAt: new Date(),
      },
    });
  }

  /**
   * Generate conversation summary (for title)
   */
  generateSummary(messages, maxLength = 50) {
    if (!messages || messages.length === 0) return 'New conversation';

    // Get first user message
    const firstUserMessage = messages.find((m) => m.role === 'USER');
    if (!firstUserMessage) return 'New conversation';

    let summary = firstUserMessage.content;
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength) + '...';
    }

    return summary;
  }
}

module.exports = new ConversationManager();
