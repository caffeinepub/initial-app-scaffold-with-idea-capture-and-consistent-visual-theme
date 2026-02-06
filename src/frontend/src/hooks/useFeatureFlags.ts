import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { FeatureFlags } from '../backend';
import { formatBackendError } from '../utils/formatBackendError';

export function useGetFeatureFlags() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FeatureFlags>({
    queryKey: ['featureFlags'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getFeatureFlags();
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

export function useUpdateFeatureFlags() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flags: FeatureFlags) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.setFeatureFlags(flags);
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
    },
  });
}
