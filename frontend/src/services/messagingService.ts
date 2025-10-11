import api from './api';

export interface MessageThread {
  id: string;
  subject?: string;
  type: 'DIRECT' | 'GROUP' | 'CLASS' | 'ANNOUNCEMENT' | 'BROADCAST';
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED' | 'DELETED';
  isArchived: boolean;
  isPinned: boolean;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
  isMuted?: boolean;
  participants: ThreadParticipant[];
  messages?: Message[];
  _count?: {
    messages: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ThreadParticipant {
  id: string;
  userId: string;
  isAdmin: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isPinned: boolean;
  unreadCount: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

export interface Message {
  id: string;
  threadId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'FILE' | 'LINK';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isImportant: boolean;
  isPinned: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  attachments?: any[];
  parentMessageId?: string;
  parentMessage?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
    };
  };
  sender: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  recipients?: {
    isRead: boolean;
    readAt?: string;
    isStarred: boolean;
  }[];
  _count?: {
    replies: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadData {
  subject?: string;
  type?: 'DIRECT' | 'GROUP' | 'CLASS' | 'ANNOUNCEMENT';
  participantIds: string[];
  groupName?: string;
  message?: string;
  isGroup?: boolean;
}

export interface SendMessageData {
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'FILE' | 'LINK';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isImportant?: boolean;
  attachments?: any[];
  parentMessageId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

const messagingService = {
  // Get all message threads
  async getThreads(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
  }) {
    const response = await api.get('/messaging/threads', { params });
    return response.data;
  },

  // Get a specific thread with messages
  async getThread(threadId: string, params?: { page?: number; limit?: number }) {
    const response = await api.get(`/messaging/threads/${threadId}`, { params });
    return response.data;
  },

  // Create a new thread
  async createThread(data: CreateThreadData) {
    const response = await api.post('/messaging/threads', data);
    return response.data;
  },

  // Send a message in a thread
  async sendMessage(threadId: string, data: SendMessageData) {
    const response = await api.post(`/messaging/threads/${threadId}/messages`, data);
    return response.data;
  },

  // Mark message as read
  async markAsRead(messageId: string) {
    const response = await api.post(`/messaging/messages/${messageId}/read`);
    return response.data;
  },

  // Archive a thread
  async archiveThread(threadId: string) {
    const response = await api.post(`/messaging/threads/${threadId}/archive`);
    return response.data;
  },

  // Delete a message
  async deleteMessage(messageId: string) {
    const response = await api.delete(`/messaging/messages/${messageId}`);
    return response.data;
  },

  // Get unread message count
  async getUnreadCount() {
    const response = await api.get('/messaging/unread-count');
    return response.data;
  },

  // Search users for messaging
  async searchUsers(search: string, role?: string) {
    const response = await api.get('/messaging/search-users', {
      params: { search, role },
    });
    return response.data;
  },
};

export default messagingService;
