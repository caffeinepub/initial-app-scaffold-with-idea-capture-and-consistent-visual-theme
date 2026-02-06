import { useNavigate } from '@tanstack/react-router';
import { useGetConversations } from '../hooks/useMessages';
import { useGetProfileById } from '../hooks/useProfiles';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';

export function MessagesPage() {
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useGetConversations();

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No messages yet</h2>
          <p className="text-muted-foreground">
            Start a conversation by visiting a user's profile and clicking the Message button
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-2">
          {conversations.map((conversation) => {
            // Skip rendering if conversation is missing required data
            if (!conversation.peer || !conversation.peerUsername) {
              return null;
            }
            
            return (
              <ConversationItem 
                key={conversation.id.toString()} 
                conversation={conversation}
                onClick={() => navigate({ to: '/messages/$peer', params: { peer: conversation.peerUsername } })}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function ConversationItem({ conversation, onClick }: { conversation: any; onClick: () => void }) {
  const { data: peer } = useGetProfileById(conversation.peer);

  // Don't render if peer data is missing
  if (!peer) {
    return null;
  }

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-4 hover:bg-muted rounded-lg cursor-pointer transition-colors"
    >
      <ProfileAvatar avatar={peer.avatar} username={peer.username} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{peer.displayName}</p>
        <p className="text-sm text-muted-foreground truncate">
          {conversation.lastMessage || 'Start a conversation'}
        </p>
      </div>
      {conversation.unreadCount > 0 && (
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
          {conversation.unreadCount}
        </div>
      )}
    </div>
  );
}
