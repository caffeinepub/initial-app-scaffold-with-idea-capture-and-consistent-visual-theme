import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { formatBackendError } from '../utils/formatBackendError';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetFollowers(userId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['followers', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      try {
        // Backend method not exposed in interface
        throw new Error('getFollowers method not available in backend interface');
      } catch (error) {
        console.error('Failed to get followers:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetFollowing(userId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['following', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      try {
        // Backend method not exposed in interface
        throw new Error('getFollowing method not available in backend interface');
      } catch (error) {
        console.error('Failed to get following:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Backend method not exposed in interface
        throw new Error('followUser method not available in backend interface');
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Backend method not exposed in interface
        throw new Error('unfollowUser method not available in backend interface');
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
