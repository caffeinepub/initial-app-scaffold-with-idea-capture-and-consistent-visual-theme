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
        await actor.updateUserProfileVerification(userId, verificationState);
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: (_, { userId }) => {
      // Invalidate all profile-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      // Invalidate specific user profile queries
      queryClient.invalidateQueries({ queryKey: ['profile', userId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId.toString()] });
    },
  });
}
