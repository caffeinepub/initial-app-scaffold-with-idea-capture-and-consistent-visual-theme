import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { formatBackendError } from '../utils/formatBackendError';
import type { Principal } from '@icp-sdk/core/principal';
import type { Conversation, Message } from '../types/missing-backend-types';

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
        // Backend method not exposed in interface
        throw new Error('getConversations method not available in backend interface');
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
        // Backend method not exposed in interface
        throw new Error('createConversation method not available in backend interface');
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
        // Backend method not exposed in interface
        throw new Error('getConversationMessages method not available in backend interface');
      } catch (error) {
        console.error('Failed to get messages:', error);
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
        // Backend method not exposed in interface
        throw new Error('sendMessage method not available in backend interface');
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
