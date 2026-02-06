import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerProfile } from './useProfiles';
import { isSuperAdminPrincipal } from '../constants/superAdmin';
import { UserRole } from '../backend';

export type EffectiveRole = 'admin' | 'officer' | 'user' | 'guest';

/**
 * Determines the caller's effective role for UI gating.
 * Uses backend role signals with fallback to super-admin constant.
 * Preserves last-known role during transient failures.
 */
export function useCallerRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();

  const roleQuery = useQuery<EffectiveRole>({
    queryKey: ['callerRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      // Not authenticated = guest
      if (!identity) {
        return 'guest';
      }

      // Check if super-admin by principal
      if (isSuperAdminPrincipal(identity.getPrincipal())) {
        return 'admin';
      }

      // Try to get role from backend
      if (actor) {
        try {
          const isAdmin = await actor.isCallerAdmin();
          if (isAdmin) {
            return 'admin';
          }
        } catch (error) {
          console.warn('Failed to check admin status:', error);
          // Don't throw - fall through to profile check
        }
      }

      // Fallback to profile role
      if (profile) {
        switch (profile.role) {
          case UserRole.admin:
            return 'admin';
          case UserRole.officer:
            return 'officer';
          case UserRole.user:
            return 'user';
          default:
            return 'user';
        }
      }

      // Default to user for authenticated users
      return 'user';
    },
    enabled: !!identity && !actorFetching,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1,
    // Keep previous data during refetch to avoid UI flicker
    placeholderData: (previousData) => previousData,
  });

  return {
    role: roleQuery.data || 'guest',
    isAdmin: roleQuery.data === 'admin',
    isOfficer: roleQuery.data === 'officer' || roleQuery.data === 'admin',
    isUser: roleQuery.data === 'user' || roleQuery.data === 'officer' || roleQuery.data === 'admin',
    isLoading: actorFetching || profileLoading || roleQuery.isLoading,
    error: roleQuery.error,
  };
}
