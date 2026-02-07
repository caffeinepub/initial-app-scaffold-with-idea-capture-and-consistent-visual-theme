import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { UserRole } from '../backend';
import { isSuperAdminPrincipal } from '../constants/superAdmin';

export type EffectiveRole = 'admin' | 'officer' | 'user' | 'guest';

export function useCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<EffectiveRole>({
    queryKey: ['callerRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) return 'guest';

      // Check if super-admin first
      const principal = identity.getPrincipal();
      if (isSuperAdminPrincipal(principal)) {
        return 'admin';
      }

      try {
        const role = await actor.getUserRole();
        switch (role) {
          case UserRole.admin:
            return 'admin';
          case UserRole.officer:
            return 'officer';
          case UserRole.user:
            return 'user';
          default:
            return 'user';
        }
      } catch (error) {
        console.error('Failed to fetch caller role:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    role: query.data || 'guest',
    isAdmin: query.data === 'admin',
    isOfficer: query.data === 'officer',
    isUser: query.data === 'user',
    isLoading: query.isLoading || actorFetching,
    error: query.error,
  };
}
