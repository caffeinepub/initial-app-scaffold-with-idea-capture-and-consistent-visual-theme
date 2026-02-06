import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { FeatureFlags } from '../backend';

export function useGetFeatureFlags() {
  const { actor, isFetching } = useActor();

  return useQuery<FeatureFlags>({
    queryKey: ['featureFlags'],
    queryFn: async () => {
      if (!actor) return { filtersEnabled: false, musicEnabled: false };
      return actor.getFeatureFlags();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateFeatureFlags() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flags: { filtersEnabled: boolean; musicEnabled: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFeatureFlags(flags.filtersEnabled, flags.musicEnabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
    },
  });
}
