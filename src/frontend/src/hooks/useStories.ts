import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Story } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetActiveStories() {
  const { actor, isFetching } = useActor();

  return useQuery<Story[]>({
    queryKey: ['stories', 'active'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveStories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStoryById(storyId?: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Story | null>({
    queryKey: ['story', storyId?.toString()],
    queryFn: async () => {
      if (!actor || storyId === undefined) return null;
      return actor.getStoryById(storyId);
    },
    enabled: !!actor && !isFetching && storyId !== undefined,
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageBytes: Uint8Array) => {
      if (!actor) throw new Error('Actor not available');
      // Create a new Uint8Array from the data to ensure proper ArrayBuffer type
      const buffer = new ArrayBuffer(imageBytes.length);
      const properlyTypedArray = new Uint8Array(buffer);
      properlyTypedArray.set(imageBytes);
      const blob = ExternalBlob.fromBytes(properlyTypedArray);
      await actor.createStory(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', 'active'] });
    },
  });
}
