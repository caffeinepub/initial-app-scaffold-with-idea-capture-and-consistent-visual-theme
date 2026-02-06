import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';

// Note: blockUser, unblockUser, promoteToOfficer, demoteFromOfficer are not available in backend interface
// Only setVerifiedStatus is available

export function useSetVerifiedStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, verified }: { userId: Principal; verified: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setVerifiedStatus(userId, verified);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
