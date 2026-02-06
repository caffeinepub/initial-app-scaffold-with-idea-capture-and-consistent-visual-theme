import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetFollowers(userId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['followers', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getFollowers(userId);
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
      return actor.getFollowing(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useIsFollowing(targetUserId: Principal): boolean {
  const { identity } = useInternetIdentity();
  const { data: following = [] } = useGetFollowing(identity?.getPrincipal());

  return following.some(p => p.toString() === targetUserId.toString());
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.followUser(targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unfollowUser(targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
    },
  });
}
