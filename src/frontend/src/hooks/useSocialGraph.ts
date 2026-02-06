import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';

// Note: All social graph backend methods are missing from the interface
// These hooks return empty data until backend is updated

export function useGetFollowers(userId?: Principal) {
  return useQuery<Principal[]>({
    queryKey: ['followers', userId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetFollowing(userId?: Principal) {
  return useQuery<Principal[]>({
    queryKey: ['following', userId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useIsFollowing(targetUserId: Principal): boolean {
  const { identity } = useInternetIdentity();
  const { data: following = [] } = useGetFollowing(identity?.getPrincipal());

  return following.some(p => p.toString() === targetUserId.toString());
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: Principal) => {
      throw new Error('Follow functionality is not available - backend method missing');
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: Principal) => {
      throw new Error('Unfollow functionality is not available - backend method missing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
    },
  });
}
