import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FeatureFlags } from '../types/missing-backend-types';

// Note: Feature flags backend methods are missing from the interface
// These hooks return default values until backend is updated

export function useGetFeatureFlags() {
  return useQuery<FeatureFlags>({
    queryKey: ['featureFlags'],
    queryFn: async () => ({ filtersEnabled: false, musicEnabled: false }),
    enabled: false,
  });
}

export function useUpdateFeatureFlags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flags: { filtersEnabled: boolean; musicEnabled: boolean }) => {
      throw new Error('Feature flags update is not available - backend method missing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
    },
  });
}
