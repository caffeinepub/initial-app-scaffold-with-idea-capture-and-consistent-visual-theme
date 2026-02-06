import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SupportIssue, IssueCategory, IssueStatus } from '../types/missing-backend-types';

// Note: Support issue backend methods are missing from the interface
// These hooks return empty data until backend is updated

export function useSubmitSupportIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { category: IssueCategory; description: string }) => {
      throw new Error('Support issue submission is not available - backend method missing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportIssues'] });
    },
  });
}

export function useGetAllSupportIssues() {
  return useQuery<SupportIssue[]>({
    queryKey: ['supportIssues'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useUpdateSupportIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { issueId: bigint; status: IssueStatus }) => {
      throw new Error('Support issue status update is not available - backend method missing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportIssues'] });
    },
  });
}
