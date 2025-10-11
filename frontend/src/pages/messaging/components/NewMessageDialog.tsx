import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import messagingService, { MessageThread, User } from '@/services/messagingService';
import { X, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NewMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onThreadCreated: (thread: MessageThread) => void;
}

const NewMessageDialog: React.FC<NewMessageDialogProps> = ({
  open,
  onClose,
  onThreadCreated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      setSearching(true);
      const response = await messagingService.searchUsers(searchQuery);
      setSearchResults(response.users);
    } catch (error: any) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleCreateThread = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one recipient',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreating(true);
      const response = await messagingService.createThread({
        subject: subject || undefined,
        type: selectedUsers.length > 1 ? 'GROUP' : 'DIRECT',
        participantIds: selectedUsers.map(u => u.id),
        message,
        isGroup: selectedUsers.length > 1,
      });

      onThreadCreated(response.thread);
      handleClose();
    } catch (error: any) {
      if (error.response?.data?.threadId) {
        // Thread already exists
        onThreadCreated({ id: error.response.data.threadId } as MessageThread);
        handleClose();
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to create conversation',
          variant: 'destructive',
        });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* To Field */}
          <div className="space-y-2">
            <Label htmlFor="recipients">To</Label>
            <div className="border rounded-md p-2 min-h-[42px]">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map(user => (
                  <Badge key={user.id} variant="secondary" className="gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveUser(user.id)}
                    />
                  </Badge>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="recipients"
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 border-0 focus-visible:ring-0"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto border-t">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer rounded"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email} • {user.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subject Field (optional for group messages) */}
          {selectedUsers.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Enter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
            <Button intent="cancel" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              intent="primary"
              onClick={handleCreateThread}
              disabled={selectedUsers.length === 0 || !message.trim() || creating}
              className="w-full sm:w-auto"
            >
              {creating ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;
