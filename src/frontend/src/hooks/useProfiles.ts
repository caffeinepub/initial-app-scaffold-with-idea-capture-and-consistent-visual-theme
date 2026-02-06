import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { formatBackendError } from '../utils/formatBackendError';
import type { PublicUserProfile, ProfileVisibility } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<PublicUserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        console.error('Failed to get caller profile:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetProfileById(id?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicUserProfile | null>({
    queryKey: ['profile', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getProfileById(id);
      } catch (error) {
        console.error('Failed to get profile by ID:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetProfileByUsername(username: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicUserProfile | null>({
    queryKey: ['profile', 'username', username],
    queryFn: async () => {
      if (!actor || !username) return null;
      try {
        return await actor.getProfileByUsername(username);
      } catch (error) {
        console.error('Failed to get profile by username:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { username: string; displayName: string; email: string; bio: string; avatar: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.createUserProfile(data.username, data.displayName, data.email, data.bio, data.avatar);
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      displayName: string; 
      bio: string; 
      avatar: string; 
      email: string;
      visibility: ProfileVisibility;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateUserProfile(
          data.displayName,
          data.bio,
          data.avatar,
          data.email,
          data.visibility
        );
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
    },
  });
}
