import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { FollowRequest } from '../backend';

export function useGetPendingFollowRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<FollowRequest[]>({
    queryKey: ['followRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingFollowRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveFollowRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveFollowRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useDenyFollowRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.denyFollowRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
