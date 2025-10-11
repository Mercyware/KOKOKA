import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import messagingService, { Message, MessageThread } from '@/services/messagingService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Users, Paperclip, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ThreadViewProps {
  threadId: string;
  onMessageSent: () => void;
  onThreadUpdated: () => void;
}

const ThreadView: React.FC<ThreadViewProps> = ({
  threadId,
  onMessageSent,
  onThreadUpdated,
}) => {
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (threadId) {
      fetchThread();
    }
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getThread(threadId);
      setThread(response.thread);
      setMessages(response.messages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load conversation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const response = await messagingService.sendMessage(threadId, {
        content: newMessage,
        messageType: 'TEXT',
        priority: 'NORMAL',
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
      onMessageSent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Thread not found</p>
      </div>
    );
  }

  const getThreadTitle = () => {
    if (thread.groupName) return thread.groupName;
    if (thread.subject) return thread.subject;

    const otherParticipant = thread.participants.find(p => p.userId !== currentUserId);
    return otherParticipant?.user.name || 'Conversation';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="border-b p-4 bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10">
                {thread.isGroup ? <Users className="h-5 w-5" /> : getThreadTitle().charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{getThreadTitle()}</h3>
              <p className="text-xs text-muted-foreground">
                {thread.participants.length} {thread.participants.length === 1 ? 'participant' : 'participants'}
              </p>
            </div>
          </div>
          <Button variant="ghost" className="h-10 w-10 p-2">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender.id === currentUserId;

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  isOwnMessage && 'flex-row-reverse'
                )}
              >
                {!isOwnMessage && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs">
                      {message.sender.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    'flex flex-col max-w-[70%]',
                    isOwnMessage && 'items-end'
                  )}
                >
                  {!isOwnMessage && (
                    <span className="text-xs font-medium mb-1">
                      {message.sender.name}
                    </span>
                  )}

                  <div
                    className={cn(
                      'rounded-lg px-4 py-2',
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.parentMessage && (
                      <div className="mb-2 p-2 bg-background/10 rounded text-xs opacity-80">
                        <p className="font-medium">{message.parentMessage.sender.name}</p>
                        <p className="truncate">{message.parentMessage.content}</p>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-shrink-0 h-10 w-10 p-2"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />

          <Button
            type="submit"
            intent="primary"
            disabled={!newMessage.trim() || sending}
            className="flex-shrink-0 h-10 w-10 p-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ThreadView;
