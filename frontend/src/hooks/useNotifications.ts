import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  category: string;
  timestamp: string;
  isRead: boolean;
  metadata?: any;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: 'navigate' | 'mark_read' | 'dismiss' | 'custom';
  target?: string;
}

export interface NotificationPreferences {
  isEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursDays: string[];
  preferences?: any;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  connected: boolean;
  error: string | null;
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: (options?: FetchOptions) => Promise<void>;
  sendNotification: (notification: SendNotificationData) => Promise<void>;
  
  // Preferences
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  
  // Connection
  connect: () => void;
  disconnect: () => void;
}

export interface FetchOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
  category?: string;
}

export interface SendNotificationData {
  title: string;
  message: string;
  type: string;
  priority?: string;
  category?: string;
  channels?: string[];
  targetType: string;
  targetUsers?: string[];
  targetRoles?: string[];
  targetClasses?: string[];
  templateId?: string;
  templateData?: any;
  scheduledAt?: string;
  metadata?: any;
}

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Get auth token
  const getAuthToken = useCallback(() => {
    // Get token from localStorage, context, or wherever you store it
    return localStorage.getItem('authToken') || '';
  }, []);

  // API request helper
  const apiRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const subdomain = localStorage.getItem('schoolSubdomain') || 'demo';
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-School-Subdomain': subdomain,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
  }, [getAuthToken]);

  // Initialize Socket.IO connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = getAuthToken();
    if (!token) {
      setError('Authentication token required');
      return;
    }

    tokenRef.current = token;
    
    const subdomain = localStorage.getItem('schoolSubdomain') || 'demo';

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      query: { subdomain },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
      console.log('Connected to notification server');
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      console.log('Disconnected from notification server:', reason);
    });

    socket.on('connect_error', (error) => {
      setError(error.message);
      setConnected(false);
      console.error('Socket connection error:', error);
    });

    socket.on('authenticated', (data) => {
      setUnreadCount(data.unreadCount || 0);
      console.log('Socket authenticated:', data);
    });

    socket.on('authentication_error', (error) => {
      setError(error.message);
      setConnected(false);
    });

    // Notification events
    socket.on('new_notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/notification-icon.png',
          tag: notification.id,
        });
      }
    });

    socket.on('unread_count_updated', (data) => {
      setUnreadCount(data.count);
    });

    socket.on('marked_read', (data) => {
      if (data.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === data.notificationId 
              ? { ...n, isRead: true }
              : n
          )
        );
      }
    });

    socket.on('marked_all_read', (data) => {
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    });

    socket.on('pending_notifications', (data) => {
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    });

    socket.on('system_announcement', (data) => {
      console.log('System announcement:', data);
    });

    socket.on('emergency_alert', (data) => {
      console.log('Emergency alert:', data);
      // Handle emergency alerts with higher priority
    });

  }, [getAuthToken]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnected(false);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );

      // Update via socket if connected
      if (socketRef.current?.connected) {
        socketRef.current.emit('mark_read', { notificationId });
      }

      // Also update via API
      await apiRequest(`/notifications/${notificationId}/read`, {
        method: 'POST',
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mark as read');
      console.error('Error marking notification as read:', error);
    }
  }, [apiRequest]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      // Update via socket if connected
      if (socketRef.current?.connected) {
        socketRef.current.emit('mark_all_read');
      }

      // Also update via API
      await apiRequest('/notifications/read-all', {
        method: 'POST',
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mark all as read');
      console.error('Error marking all notifications as read:', error);
    }
  }, [apiRequest]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (options: FetchOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.unreadOnly) params.append('unreadOnly', 'true');
      if (options.type) params.append('type', options.type);
      if (options.category) params.append('category', options.category);

      const response = await apiRequest(`/notifications/user/me?${params.toString()}`);
      
      if (response.success) {
        setNotifications(response.data.notifications.map((un: any) => ({
          id: un.notification.id,
          title: un.notification.title,
          message: un.notification.message,
          type: un.notification.type,
          priority: un.notification.priority,
          category: un.notification.category,
          timestamp: un.createdAt,
          isRead: un.isRead,
          metadata: un.notification.metadata,
        })));
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Send notification (admin function)
  const sendNotification = useCallback(async (notificationData: SendNotificationData) => {
    try {
      setError(null);
      
      const response = await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to send notification');
      }

      return response.data;

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send notification');
      console.error('Error sending notification:', error);
      throw error;
    }
  }, [apiRequest]);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const response = await apiRequest('/notifications/preferences');
      
      if (response.success) {
        setPreferences(response.data);
      }

    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, [apiRequest]);

  // Update user preferences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    try {
      setError(null);

      const response = await apiRequest('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(prefs),
      });

      if (response.success) {
        setPreferences(response.data);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update preferences');
      console.error('Error updating preferences:', error);
      throw error;
    }
  }, [apiRequest]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchPreferences();
    fetchNotifications();
    requestNotificationPermission();

    // Auto-connect if token is available
    const token = getAuthToken();
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [fetchPreferences, fetchNotifications, requestNotificationPermission, getAuthToken, connect, disconnect]);

  // Reconnect when token changes
  useEffect(() => {
    const currentToken = getAuthToken();
    if (currentToken && currentToken !== tokenRef.current) {
      disconnect();
      setTimeout(connect, 100);
    }
  }, [getAuthToken, connect, disconnect]);

  return {
    notifications,
    unreadCount,
    loading,
    connected,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    sendNotification,
    preferences,
    updatePreferences,
    connect,
    disconnect,
  };
};