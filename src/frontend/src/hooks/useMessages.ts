import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { formatBackendError } from '../utils/formatBackendError';
import type { Principal } from '@icp-sdk/core/principal';
import type { Conversation, Message } from '../backend';

type ConversationWithPeer = Conversation & {
  peer: Principal;
  peerUsername: string;
  lastMessage: string;
  unreadCount: number;
};

export function useGetConversations() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ConversationWithPeer[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      
      try {
        const conversations = await actor.getConversations();
        const currentUserId = identity.getPrincipal().toString();
        
        const conversationsWithPeers = await Promise.all(
          conversations.map(async (conv) => {
            const peer = conv.participants.find(p => p.toString() !== currentUserId);
            const peerProfile = peer ? await actor.getProfileById(peer) : null;
            
            const messages = await actor.getConversationMessages(conv.id);
            const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
            
            return {
              ...conv,
              peer: peer!,
              peerUsername: peerProfile?.username || 'Unknown',
              lastMessage: lastMsg?.content || '',
              unreadCount: 0,
            };
          })
        );
        
        return conversationsWithPeers;
      } catch (error) {
        console.error('Failed to get conversations:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 5000,
  });
}

export function useCreateConversation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (peerId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createConversation(peerId);
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useGetConversationMessages(conversationId?: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId?.toString()],
    queryFn: async () => {
      if (!actor || conversationId === undefined) return [];
      try {
        return await actor.getConversationMessages(conversationId);
      } catch (error) {
        console.error('Failed to get conversation messages:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching && conversationId !== undefined,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: bigint; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.sendMessage(data.conversationId, data.content);
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
