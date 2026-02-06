import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Story } from '../types/missing-backend-types';
import type { Principal } from '@icp-sdk/core/principal';

// Note: Story creation and fetching methods are missing from backend interface
// Only like/unlike methods are available

export function useGetActiveStories() {
  return useQuery<Story[]>({
    queryKey: ['stories', 'active'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetStoryById(storyId?: bigint) {
  return useQuery<Story | null>({
    queryKey: ['story', storyId?.toString()],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageBytes: Uint8Array) => {
      throw new Error('Story creation is not available - backend method missing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', 'active'] });
    },
  });
}

export function useGetStoryLikes(storyId?: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['story-likes', storyId?.toString()],
    queryFn: async () => {
      if (!actor || storyId === undefined) return [];
      return actor.getStoryLikes(storyId);
    },
    enabled: !!actor && !isFetching && storyId !== undefined,
  });
}

export function useLikeStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likeStory(storyId);
    },
    onSuccess: (_, storyId) => {
      queryClient.invalidateQueries({ queryKey: ['story-likes', storyId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['story', storyId.toString()] });
    },
  });
}

export function useUnlikeStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unlikeStory(storyId);
    },
    onSuccess: (_, storyId) => {
      queryClient.invalidateQueries({ queryKey: ['story-likes', storyId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['story', storyId.toString()] });
    },
  });
}
