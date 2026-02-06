import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { formatBackendError } from '../utils/formatBackendError';
import type { SupportIssue, IssueCategory, IssueStatus } from '../types/missing-backend-types';

export function useSubmitSupportIssue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { category: IssueCategory; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Backend method not exposed in interface
        throw new Error('submitSupportIssue method not available in backend interface');
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportIssues'] });
    },
  });
}

export function useGetAllSupportIssues() {
  const { actor, isFetching } = useActor();

  return useQuery<SupportIssue[]>({
    queryKey: ['supportIssues', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // Backend method not exposed in interface
        throw new Error('getAllSupportIssues method not available in backend interface');
      } catch (error) {
        console.error('Failed to get all support issues:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserSupportIssues() {
  const { actor, isFetching } = useActor();

  return useQuery<SupportIssue[]>({
    queryKey: ['supportIssues', 'user'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // Backend method not exposed in interface
        throw new Error('getUserSupportIssues method not available in backend interface');
      } catch (error) {
        console.error('Failed to get user support issues:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSupportIssueStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { issueId: bigint; status: IssueStatus }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Backend method not exposed in interface
        throw new Error('updateSupportIssueStatus method not available in backend interface');
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportIssues'] });
    },
  });
}
