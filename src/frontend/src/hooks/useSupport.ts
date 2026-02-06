import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SupportIssue, IssueCategory, IssueStatus } from '../backend';

export function useSubmitSupportIssue() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { category: IssueCategory; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitSupportIssue(data.category, data.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportIssues'] });
    },
  });
}

export function useGetAllSupportIssues() {
  const { actor, isFetching } = useActor();

  return useQuery<SupportIssue[]>({
    queryKey: ['supportIssues'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return actor.getAllSupportIssues();
      } catch (err) {
        console.error('Failed to fetch support issues:', err);
        return [];
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
      return actor.updateSupportIssueStatus(data.issueId, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportIssues'] });
    },
  });
}
