import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';
import { formatBackendError } from '../utils/formatBackendError';
import { VerificationState } from '../backend';

export function useSetUserVerificationState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, verificationState }: { userId: Principal; verificationState: VerificationState }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Backend method not yet exposed in interface
        throw new Error('setUserVerificationState method not available in backend interface');
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
