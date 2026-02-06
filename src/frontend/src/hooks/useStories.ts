import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { formatBackendError } from '../utils/formatBackendError';
import { ExternalBlob } from '../backend';
import type { StoryView, StoryInput } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetActiveStories() {
  const { actor, isFetching } = useActor();

  return useQuery<StoryView[]>({
    queryKey: ['stories', 'active'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getActiveStories();
      } catch (error) {
        console.error('Failed to get active stories:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStoryById(storyId?: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<StoryView | null>({
    queryKey: ['story', storyId?.toString()],
    queryFn: async () => {
      if (!actor || storyId === undefined) return null;
      try {
        return await actor.getStory(storyId);
      } catch (error) {
        console.error('Failed to get story:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching && storyId !== undefined,
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageBytes: Uint8Array) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to create a story');

      try {
        const storyInput: StoryInput = {
          author: identity.getPrincipal(),
          image: ExternalBlob.fromBytes(imageBytes as Uint8Array<ArrayBuffer>),
        };

        const storyId = await actor.createStory(storyInput);
        return storyId;
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
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
      try {
        return await actor.getStoryLikes(storyId);
      } catch (error) {
        console.error('Failed to get story likes:', error);
        return [];
      }
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
      try {
        await actor.likeStory(storyId);
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: (_, storyId) => {
      queryClient.invalidateQueries({ queryKey: ['story-likes', storyId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['story', storyId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['stories', 'active'] });
    },
  });
}

export function useUnlikeStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.unlikeStory(storyId);
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: (_, storyId) => {
      queryClient.invalidateQueries({ queryKey: ['story-likes', storyId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['story', storyId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['stories', 'active'] });
    },
  });
}
