import React, { useState } from 'react';
import { 
  Bell, 
  Settings, 
  Check, 
  CheckCheck, 
  X, 
  Filter,
  Mail,
  MessageSquare,
  AlertCircle,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useNotifications, Notification } from '../../hooks/useNotifications';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const {
    notifications,
    unreadCount,
    loading,
    connected,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const iconProps = {
      size: 16,
      className: `${priority === 'CRITICAL' || priority === 'URGENT' ? 'text-red-500' : 
                   priority === 'HIGH' ? 'text-orange-500' :
                   'text-blue-500'}`
    };

    switch (type) {
      case 'ACADEMIC':
      case 'GRADE_UPDATE':
      case 'ASSIGNMENT':
        return <Calendar {...iconProps} />;
      case 'FEE_REMINDER':
        return <DollarSign {...iconProps} />;
      case 'EMERGENCY':
        return <AlertCircle {...iconProps} className="text-red-600" />;
      case 'ANNOUNCEMENT':
        return <MessageSquare {...iconProps} />;
      case 'ATTENDANCE':
        return <CheckCheck {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getUniqueTypes = () => {
    const types = [...new Set(notifications.map(n => n.type))];
    return types;
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Handle notification actions
    if (notification.actions) {
      const primaryAction = notification.actions[0];
      if (primaryAction?.action === 'navigate' && primaryAction.target) {
        // Navigate to the target route
        window.location.href = primaryAction.target;
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Connection status indicator */}
        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
          connected ? 'bg-green-400' : 'bg-red-400'
        }`} />
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-2 py-1 text-xs rounded ${
                      filter === 'all' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-2 py-1 text-xs rounded ${
                      filter === 'unread' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {/* Type filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  {getUniqueTypes().map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              {unreadCount > 0 && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>

            {/* Connection Status */}
            {!connected && (
              <div className="p-2 bg-yellow-50 border-b">
                <div className="flex items-center space-x-2 text-sm text-yellow-700">
                  <AlertCircle size={14} />
                  <span>Not connected to real-time notifications</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-2 bg-red-50 border-b">
                <div className="flex items-center space-x-2 text-sm text-red-700">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <span className="mt-2 text-sm">Loading notifications...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-end ml-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                              )}
                            </div>
                          </div>

                          {/* Priority and Category indicators */}
                          <div className="flex items-center space-x-2 mt-2">
                            {notification.priority !== 'NORMAL' && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                notification.priority === 'CRITICAL' || notification.priority === 'URGENT'
                                  ? 'bg-red-100 text-red-700'
                                  : notification.priority === 'HIGH'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {notification.priority}
                              </span>
                            )}
                            
                            <span className="text-xs text-gray-500">
                              {notification.category}
                            </span>
                          </div>

                          {/* Actions */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex space-x-2 mt-2">
                              {notification.actions.slice(0, 2).map((action, index) => (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle action
                                    if (action.action === 'mark_read') {
                                      markAsRead(notification.id);
                                    } else if (action.action === 'navigate' && action.target) {
                                      window.location.href = action.target;
                                    }
                                  }}
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => fetchNotifications()}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notification settings or full notification page
                  }}
                  className="text-xs text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                >
                  <Settings size={12} />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;