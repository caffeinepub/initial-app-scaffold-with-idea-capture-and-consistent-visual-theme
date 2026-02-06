import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '../types/missing-backend-types';

// Note: Notification backend methods are missing from the interface
// These hooks return empty data until backend is updated

export function useGetNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      throw new Error('Mark notification as read is not available - backend method missing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
