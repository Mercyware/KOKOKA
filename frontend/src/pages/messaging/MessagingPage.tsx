import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { PageContainer, PageHeader, PageTitle, PageContent } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import messagingService, { MessageThread } from '@/services/messagingService';
import { MessageSquarePlus, Search, Archive, Inbox } from 'lucide-react';
import ThreadList from './components/ThreadList';
import ThreadView from './components/ThreadView';
import NewMessageDialog from './components/NewMessageDialog';

const MessagingPage: React.FC = () => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get thread ID from URL if present
  const threadIdFromUrl = searchParams.get('thread');

  useEffect(() => {
    fetchThreads();
    fetchUnreadCount();

    // Set selected thread from URL
    if (threadIdFromUrl) {
      setSelectedThread(threadIdFromUrl);
    }
  }, [threadIdFromUrl]);

  const fetchThreads = async (search?: string) => {
    try {
      setLoading(true);
      console.log('Fetching threads...');
      const response = await messagingService.getThreads({
        page: 1,
        limit: 50,
        search: search || searchQuery,
      });
      console.log('Threads response:', response);
      setThreads(response.threads || []);
    } catch (error: any) {
      console.error('Error fetching threads:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await messagingService.getUnreadCount();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchThreads(searchQuery);
  };

  const handleThreadSelect = (threadId: string) => {
    setSelectedThread(threadId);
    navigate(`/messaging?thread=${threadId}`);
  };

  const handleNewThread = () => {
    setShowNewMessage(true);
  };

  const handleThreadCreated = (thread: MessageThread) => {
    setThreads([thread, ...threads]);
    setSelectedThread(thread.id);
    setShowNewMessage(false);
    navigate(`/messaging?thread=${thread.id}`);
    toast({
      title: 'Success',
      description: 'Message sent successfully',
    });
  };

  const handleMessageSent = () => {
    fetchThreads();
    fetchUnreadCount();
  };

  return (
    <Layout>
      <PageContainer>
      <PageHeader>
        <div className="flex justify-between items-center w-full">
          <div>
            <PageTitle>Messages</PageTitle>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
              </p>
            )}
          </div>
          <Button intent="primary" onClick={handleNewThread}>
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
          {/* Thread List */}
          <div className="col-span-12 md:col-span-4 border-r overflow-y-auto">
            <div className="p-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              <ThreadList
                threads={threads}
                selectedThread={selectedThread}
                onThreadSelect={handleThreadSelect}
                loading={loading}
              />
            </div>
          </div>

          {/* Thread View */}
          <div className="col-span-12 md:col-span-8">
            {selectedThread ? (
              <ThreadView
                threadId={selectedThread}
                onMessageSent={handleMessageSent}
                onThreadUpdated={fetchThreads}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                <p className="text-muted-foreground mb-6">
                  Choose a conversation from the list or start a new one
                </p>
                <Button intent="primary" onClick={handleNewThread}>
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </PageContent>

      {showNewMessage && (
        <NewMessageDialog
          open={showNewMessage}
          onClose={() => setShowNewMessage(false)}
          onThreadCreated={handleThreadCreated}
        />
      )}
    </PageContainer>
    </Layout>
  );
};

export default MessagingPage;
