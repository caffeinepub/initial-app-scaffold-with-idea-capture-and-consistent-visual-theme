import { type ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { LoginScreen } from './LoginScreen';
import { ProfileSetupDialog } from '../profile/ProfileSetupDialog';
import { useGetCallerProfile } from '../../hooks/useProfiles';

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerProfile();

  const isAuthenticated = !!identity;

  if (isInitializing || (isAuthenticated && profileLoading)) {
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

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetupDialog />;
  }

  return <>{children}</>;
}
