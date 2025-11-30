import api from './api';

export const chatbotService = {
  /**
   * Send message to chatbot
   */
  async sendMessage(conversationId: string | null, message: string, options = {}) {
    const endpoint = conversationId
      ? `/chatbot/conversations/${conversationId}/messages`
      : '/chatbot/conversations/messages';

    const response = await api.post(endpoint, { message, options });
    return response.data;
  },

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string) {
    const response = await api.get(`/chatbot/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Get user's conversations
   */
  async getConversations(limit = 20) {
    const response = await api.get('/chatbot/conversations', { params: { limit } });
    return response.data;
  },

  /**
   * Close conversation
   */
  async closeConversation(conversationId: string) {
    const response = await api.put(`/chatbot/conversations/${conversationId}/close`);
    return response.data;
  },

  /**
   * Rate message
   */
  async rateMessage(messageId: string, helpful: boolean, feedback?: string) {
    const response = await api.put(`/chatbot/messages/${messageId}/feedback`, {
      helpful,
      feedback,
    });
    return response.data;
  },

  /**
   * Get suggested questions
   */
  async getSuggestedQuestions(limit = 10) {
    const response = await api.get('/chatbot/suggestions', { params: { limit } });
    return response.data.data;
  },

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(query: string, limit = 5) {
    const response = await api.get('/chatbot/knowledge-base/search', {
      params: { q: query, limit },
    });
    return response.data.data;
  },
};
