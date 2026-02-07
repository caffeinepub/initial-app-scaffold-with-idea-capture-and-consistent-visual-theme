import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { formatBackendError } from '../utils/formatBackendError';
import { SupportIssue as BackendSupportIssue, IssueCategory as BackendIssueCategory, IssueStatus as BackendIssueStatus } from '../backend';

// Use backend types directly
export type SupportIssue = BackendSupportIssue;
export type IssueCategory = BackendIssueCategory;
export type IssueStatus = BackendIssueStatus;

// Create runtime enum objects that match the backend enums
export const IssueCategory = {
  technical: 'technical' as BackendIssueCategory,
  account: 'account' as BackendIssueCategory,
  featureRequest: 'featureRequest' as BackendIssueCategory,
  other: 'other' as BackendIssueCategory,
};

export const IssueStatus = {
  open: 'open' as BackendIssueStatus,
  inProgress: 'inProgress' as BackendIssueStatus,
  resolved: 'resolved' as BackendIssueStatus,
};

export function useSubmitSupportIssue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { category: IssueCategory; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        const issueId = await actor.createSupportIssue(data.category, data.description);
        return issueId;
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
        const issues = await actor.getSupportIssues();
        return issues;
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
        const issues = await actor.getMySupportIssues();
        return issues;
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
        await actor.updateSupportIssueStatus(data.issueId, data.status);
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportIssues'] });
    },
  });
}
