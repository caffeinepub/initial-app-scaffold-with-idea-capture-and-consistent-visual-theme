import { toast } from 'sonner';
import { formatBackendError } from '../utils/formatBackendError';

/**
 * Hook to display backend errors as user-friendly toast notifications
 */
export function useBackendErrorToast() {
  const showError = (error: unknown, fallbackMessage?: string) => {
    const message = formatBackendError(error);
    toast.error(fallbackMessage || 'Error', {
      description: message,
    });
  };

  const showSuccess = (message: string) => {
    toast.success(message);
  };

  return {
    showError,
    showSuccess,
  };
}
