import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { UserRole__1 } from '../backend';
import { isSuperAdminPrincipal } from '../constants/superAdmin';

export type EffectiveRole = 'admin' | 'user' | 'guest';

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
        const role = await actor.getCallerUserRole();
        switch (role) {
          case UserRole__1.admin:
            return 'admin';
          case UserRole__1.user:
            return 'user';
          case UserRole__1.guest:
            return 'guest';
          default:
            return 'guest';
        }
      } catch (error) {
        console.error('Failed to fetch caller role:', error);
        return 'guest';
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    role: query.data || 'guest',
    isAdmin: query.data === 'admin',
    isOfficer: false, // Officer role not in backend interface
    isUser: query.data === 'user',
    isLoading: query.isLoading || actorFetching,
    error: query.error,
  };
}
