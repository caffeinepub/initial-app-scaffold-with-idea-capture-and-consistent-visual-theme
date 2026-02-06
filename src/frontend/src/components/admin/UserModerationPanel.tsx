import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, Search, CheckCircle, XCircle } from 'lucide-react';
import { useGetProfileByUsername } from '../../hooks/useProfiles';
import { useSetVerifiedStatus } from '../../hooks/useAdminModeration';
import { useBackendErrorToast } from '../../hooks/useBackendErrorToast';
import { useCallerRole } from '../../hooks/useCallerRole';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { VerifiedBadge } from '../profile/VerifiedBadge';
import { UserRole } from '../../backend';

const SUPER_ADMIN_PRINCIPAL = 'xgwt2-7h2p4-m54fq-hruec-r4x4i-nntjq-wdi7h-e2pwa-zmwzr-zhexp-nqe';

export function UserModerationPanel() {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchedUsername, setSearchedUsername] = useState('');
  const [error, setError] = useState('');

  const { data: userProfile, isLoading: isSearching } = useGetProfileByUsername(searchedUsername);
  const setVerifiedStatus = useSetVerifiedStatus();
  const { showError, showSuccess } = useBackendErrorToast();
  const { isAdmin } = useCallerRole();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (searchUsername.trim()) {
      setSearchedUsername(searchUsername.trim());
    }
  };

  const handleSetVerified = async (verified: boolean) => {
    if (!userProfile) return;

    // Prevent modifying admin users
    if (userProfile.role === UserRole.admin) {
      setError('Cannot modify verification status of admin users');
      showError(new Error('Cannot modify verification status of admin users'));
      return;
    }

    setError('');
    try {
      await setVerifiedStatus.mutateAsync({ userId: userProfile.id, verified });
      showSuccess(`User ${verified ? 'verified' : 'unverified'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update verification status';
      setError(errorMessage);
      showError(err, 'Failed to update verification');
    }
  };

  // Determine badge variant for the searched user
  const isProfileSuperAdmin = userProfile?.id.toString() === SUPER_ADMIN_PRINCIPAL;
  const isAdminProfile = userProfile?.role === UserRole.admin || isProfileSuperAdmin;
  const badgeVariant = isAdminProfile ? 'red' : userProfile?.hasOrangeTick ? 'orange' : 'blue';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Moderation</CardTitle>
          <CardDescription>Search for users and manage their verification status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Username</Label>
              <Input
                id="search"
                placeholder="Enter username to search..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSearching || !searchUsername.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSearching && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          )}

          {!isSearching && searchedUsername && !userProfile && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>User not found or you don't have permission to view this profile</AlertDescription>
            </Alert>
          )}

          {userProfile && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <ProfileAvatar avatar={userProfile.avatar} username={userProfile.username} size="lg" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{userProfile.displayName}</h3>
                      {userProfile.verified && <VerifiedBadge variant={badgeVariant} />}
                    </div>
                    <p className="text-sm text-muted-foreground">@{userProfile.username}</p>
                    <p className="text-sm">{userProfile.bio}</p>
                    <div className="flex gap-4 text-sm">
                      <span><strong>{userProfile.followersCount.toString()}</strong> followers</span>
                      <span><strong>{userProfile.followingCount.toString()}</strong> following</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Role: </span>
                      <span className="font-medium capitalize">{userProfile.role}</span>
                    </div>
                  </div>
                </div>

                {userProfile.role !== UserRole.admin && (
                  <div className="mt-6 flex gap-2">
                    {!userProfile.verified ? (
                      <Button
                        onClick={() => handleSetVerified(true)}
                        disabled={setVerifiedStatus.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {setVerifiedStatus.isPending ? 'Verifying...' : 'Verify User'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSetVerified(false)}
                        disabled={setVerifiedStatus.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {setVerifiedStatus.isPending ? 'Removing...' : 'Remove Verification'}
                      </Button>
                    )}
                  </div>
                )}

                {userProfile.role === UserRole.admin && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Admin users cannot be moderated
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Note: Some moderation features (blocking, role management) are not yet available in the backend interface.
        </AlertDescription>
      </Alert>
    </div>
  );
}
