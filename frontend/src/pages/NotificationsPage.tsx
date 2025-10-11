import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageContent, Card } from '@/components/ui';
import { Bell, AlertCircle, Calendar, DollarSign, MessageSquare, CheckCheck, Info, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationsPage: React.FC = () => {
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

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const iconProps = {
      size: 20,
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

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueTypes = () => {
    const types = [...new Set(notifications.map(n => n.type))];
    return types;
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>Notifications</PageTitle>
          <PageDescription>View and manage your notifications</PageDescription>
        </PageHeader>

        <PageContent>
          {/* Filters and Actions */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    filter === 'unread'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Type Filter and Actions */}
              <div className="flex items-center space-x-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 text-sm border rounded-lg bg-white"
                >
                  <option value="all">All Types</option>
                  {getUniqueTypes().map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}

                <button
                  onClick={() => fetchNotifications()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Connection Status */}
            {!connected && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center space-x-2 text-sm text-yellow-700">
                <AlertCircle size={16} />
                <span>Not connected to real-time notifications</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center space-x-2 text-sm text-red-700">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border">
              <Bell className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-700">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-500 text-center">
                {filter === 'unread'
                  ? 'All caught up! You have no unread notifications.'
                  : 'You\'ll see notifications here when there are updates'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className={`text-base font-semibold ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                        </div>

                        <div className="flex flex-col items-end ml-4">
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {notification.message}
                      </p>

                      {/* Priority and Category */}
                      <div className="flex items-center space-x-2">
                        {notification.priority !== 'NORMAL' && (
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            notification.priority === 'CRITICAL' || notification.priority === 'URGENT'
                              ? 'bg-red-100 text-red-700'
                              : notification.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {notification.priority}
                          </span>
                        )}

                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {notification.category.replace(/_/g, ' ')}
                        </span>

                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                          {notification.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default NotificationsPage;
