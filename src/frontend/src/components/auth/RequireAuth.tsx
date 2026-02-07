import { type ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { LoginScreen } from './LoginScreen';
import { ProfileSetupDialog } from '../profile/ProfileSetupDialog';
import { useGetCallerProfile } from '../../hooks/useProfiles';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useActorInitTimeout } from '../../hooks/useActorInitTimeout';
import { formatBackendError } from '../../utils/formatBackendError';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, error, refetch } = useGetCallerProfile();
  const hasActorTimedOut = useActorInitTimeout();

  const isAuthenticated = !!identity;

  // If actor initialization has timed out, show recovery UI
  if (hasActorTimedOut && isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Timeout</AlertTitle>
            <AlertDescription className="mt-2">
              Unable to connect to the backend service. This may be due to network issues or the service being temporarily unavailable.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
            <Button onClick={() => refetch()} variant="outline">
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading only while initializing identity or fetching profile for the first time
  if (isInitializing || (isAuthenticated && profileLoading && !isFetched)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // If profile fetch failed, show error with retry and formatted error message
  if (error && isFetched) {
    const errorMessage = formatBackendError(error);
    
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Profile</AlertTitle>
            <AlertDescription className="mt-2">
              {errorMessage}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetupDialog />;
  }

  return <>{children}</>;
}
