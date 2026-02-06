import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FollowRequest } from '../types/missing-backend-types';

// Note: Follow request backend methods are missing from the interface
// These hooks return empty data until backend is updated

export function useGetPendingFollowRequests() {
  return useQuery<FollowRequest[]>({
    queryKey: ['followRequests'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useApproveFollowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      throw new Error('Follow request approval is not available - backend method missing');
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: bigint) => {
      throw new Error('Follow request denial is not available - backend method missing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followRequests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
