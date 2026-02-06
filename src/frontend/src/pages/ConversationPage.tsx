import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProfileByUsername } from '../hooks/useProfiles';
import { useGetConversationMessages, useSendMessage, useCreateConversation } from '../hooks/useMessages';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export function ConversationPage() {
  const { peer } = useParams({ from: '/messages/$peer' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [messageText, setMessageText] = useState('');
  const [conversationId, setConversationId] = useState<bigint | undefined>(undefined);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: peerProfile } = useGetProfileByUsername(peer);
  const createConversation = useCreateConversation();
  const { data: messages = [] } = useGetConversationMessages(conversationId);
  const sendMessageMutation = useSendMessage();

  useEffect(() => {
    const initConversation = async () => {
      if (peerProfile && !conversationId) {
        try {
          const convId = await createConversation.mutateAsync(peerProfile.id);
          setConversationId(convId);
        } catch (err: any) {
          setError(err.message || 'Failed to create conversation');
        }
      }
    };
    initConversation();
  }, [peerProfile, conversationId, createConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId) return;

    setError('');
    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: messageText.trim(),
      });
      setMessageText('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    }
  };

  if (!peerProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <Button onClick={() => navigate({ to: '/messages' })}>Back to Messages</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/messages' })}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => navigate({ to: '/profile/$username', params: { username: peerProfile.username } })}
          >
            <ProfileAvatar avatar={peerProfile.avatar} username={peerProfile.username} size="sm" />
            <div>
              <p className="font-semibold">{peerProfile.displayName}</p>
              <p className="text-xs text-muted-foreground">@{peerProfile.username}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="container max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = identity && message.sender.toString() === identity.getPrincipal().toString();
              return (
                <div key={message.id.toString()} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(Number(message.timeCreated) / 1000000).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-background">
        <form onSubmit={handleSendMessage} className="container max-w-4xl mx-auto p-4 flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            disabled={sendMessageMutation.isPending || !conversationId}
          />
          <Button 
            type="submit" 
            disabled={!messageText.trim() || sendMessageMutation.isPending || !conversationId}
          >
            {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}
