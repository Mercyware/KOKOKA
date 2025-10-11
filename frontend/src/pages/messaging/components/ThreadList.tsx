import React from 'react';
import { MessageThread } from '@/services/messagingService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Users, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ThreadListProps {
  threads: MessageThread[];
  selectedThread: string | null;
  onThreadSelect: (threadId: string) => void;
  loading: boolean;
}

const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  selectedThread,
  onThreadSelect,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted animate-pulse">
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No messages yet</p>
      </div>
    );
  }

  const getThreadName = (thread: MessageThread) => {
    if (thread.groupName) return thread.groupName;
    if (thread.subject) return thread.subject;

    // For direct messages, show other participant's name
    const currentUserId = localStorage.getItem('userId'); // Assuming userId is stored
    const otherParticipant = thread.participants.find(p => p.userId !== currentUserId);
    return otherParticipant?.user.name || 'Unknown';
  };

  const getThreadAvatar = (thread: MessageThread) => {
    if (thread.isGroup) {
      return <Users className="h-5 w-5" />;
    }
    const currentUserId = localStorage.getItem('userId');
    const otherParticipant = thread.participants.find(p => p.userId !== currentUserId);
    return otherParticipant?.user.name.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="space-y-1">
      {threads.map((thread) => (
        <div
          key={thread.id}
          onClick={() => onThreadSelect(thread.id)}
          className={cn(
            'p-3 rounded-lg cursor-pointer transition-colors',
            'hover:bg-accent',
            selectedThread === thread.id && 'bg-accent',
            thread.unreadCount && thread.unreadCount > 0 && 'bg-primary/5'
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10">
                {getThreadAvatar(thread)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={cn(
                  'text-sm font-medium truncate',
                  thread.unreadCount && thread.unreadCount > 0 && 'font-semibold'
                )}>
                  {getThreadName(thread)}
                </h4>
                {thread.lastMessageAt && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className={cn(
                  'text-sm text-muted-foreground truncate',
                  thread.unreadCount && thread.unreadCount > 0 && 'font-medium text-foreground'
                )}>
                  {thread.lastMessagePreview || 'No messages yet'}
                </p>
                {thread.unreadCount && thread.unreadCount > 0 && (
                  <Badge variant="default" className="ml-2 h-5 min-w-5 px-1.5">
                    {thread.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreadList;
