import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
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
      
      const conversations = await actor.getConversations();
      const currentUserId = identity.getPrincipal().toString();
      
      const conversationsWithPeers = await Promise.all(
        conversations.map(async (conv) => {
          const peer = conv.participants.find(p => p.toString() !== currentUserId);
          const peerProfile = peer ? await actor.getProfileById(peer) : null;
          
          return {
            ...conv,
            peer: peer!,
            peerUsername: peerProfile?.username || 'Unknown',
            lastMessage: '',
            unreadCount: 0,
          };
        })
      );
      
      return conversationsWithPeers;
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 5000,
  });
}

export function useGetOrCreateConversation(peerId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint | null>({
    queryKey: ['conversation', peerId?.toString()],
    queryFn: async () => {
      if (!actor || !peerId) return null;
      return actor.getOrCreateConversation(peerId);
    },
    enabled: !!actor && !isFetching && !!peerId,
  });
}

export function useGetMessages(conversationId?: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId?.toString()],
    queryFn: async () => {
      if (!actor || conversationId === undefined) return [];
      return actor.getMessages(conversationId);
    },
    enabled: !!actor && !isFetching && conversationId !== undefined,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: bigint; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(data.conversationId, data.text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
