import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, Search, CheckCircle, XCircle, Shield, ShieldOff, UserCog, UserX } from 'lucide-react';
import { useGetProfileByUsername } from '../../hooks/useProfiles';
import { useSetUserVerificationState } from '../../hooks/useAdminModeration';
import { useBlockUser, useUnblockUser, usePromoteToOfficer, useDemoteToUser } from '../../hooks/useUserModerationActions';
import { useBackendErrorToast } from '../../hooks/useBackendErrorToast';
import { useCallerRole } from '../../hooks/useCallerRole';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { VerifiedBadge } from '../profile/VerifiedBadge';
import { getVerifiedBadgeVariant } from '../../utils/verifiedBadge';
import { UserRole, VerificationState, type PublicUserProfile } from '../../backend';
import { isSuperAdminPrincipal } from '../../constants/superAdmin';

export function UserModerationPanel() {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchedUsername, setSearchedUsername] = useState('');
  const [error, setError] = useState('');

  const { data: userProfile, isLoading: isSearching } = useGetProfileByUsername(searchedUsername);
  const setVerificationState = useSetUserVerificationState();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();
  const promoteToOfficerMutation = usePromoteToOfficer();
  const demoteToUserMutation = useDemoteToUser();
  const { showError, showSuccess } = useBackendErrorToast();
  const { isAdmin } = useCallerRole();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (searchUsername.trim()) {
      setSearchedUsername(searchUsername.trim());
    }
  };

  const handleSetBlueVerification = async (enable: boolean) => {
    if (!userProfile) return;

    if (userProfile.role === UserRole.admin) {
      setError('Cannot modify verification status of admin users');
      showError(new Error('Cannot modify verification status of admin users'));
      return;
    }

    setError('');
    try {
      const newState = enable ? VerificationState.blueCheck : VerificationState.unverified;
      await setVerificationState.mutateAsync({ userId: userProfile.id, verificationState: newState });
      showSuccess(`User ${enable ? 'verified with blue check' : 'unverified'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update verification status';
      setError(errorMessage);
      showError(err, 'Failed to update verification');
    }
  };

  const handleSetOrangeTick = async (enable: boolean) => {
    if (!userProfile) return;

    if (userProfile.role === UserRole.admin) {
      setError('Cannot modify verification status of admin users');
      showError(new Error('Cannot modify verification status of admin users'));
      return;
    }

    setError('');
    try {
      const newState = enable ? VerificationState.orangeTick : VerificationState.unverified;
      await setVerificationState.mutateAsync({ userId: userProfile.id, verificationState: newState });
      showSuccess(`Orange tick ${enable ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update orange tick';
      setError(errorMessage);
      showError(err, 'Failed to update orange tick');
    }
  };

  const handleBlockUser = async () => {
    if (!userProfile) return;

    setError('');
    try {
      await blockUserMutation.mutateAsync(userProfile.id);
      showSuccess('User blocked successfully');
    } catch (err) {
      showError(err, 'Failed to block user');
    }
  };

  const handleUnblockUser = async () => {
    if (!userProfile) return;

    setError('');
    try {
      await unblockUserMutation.mutateAsync(userProfile.id);
      showSuccess('User unblocked successfully');
    } catch (err) {
      showError(err, 'Failed to unblock user');
    }
  };

  const handlePromoteToOfficer = async () => {
    if (!userProfile) return;

    setError('');
    try {
      await promoteToOfficerMutation.mutateAsync(userProfile.id);
      showSuccess('User promoted to Officer successfully');
    } catch (err) {
      showError(err, 'Failed to promote user');
    }
  };

  const handleDemoteToUser = async () => {
    if (!userProfile) return;

    setError('');
    try {
      await demoteToUserMutation.mutateAsync(userProfile.id);
      showSuccess('User demoted to User successfully');
    } catch (err) {
      showError(err, 'Failed to demote user');
    }
  };

  const badgeVariant = getVerifiedBadgeVariant(userProfile);
  const isBlueVerified = userProfile?.verified === VerificationState.blueCheck;
  const hasOrangeTick = userProfile?.verified === VerificationState.orangeTick;
  const isTargetSuperAdmin = userProfile ? isSuperAdminPrincipal(userProfile.id) : false;
  const canModerateUser = isAdmin && !isTargetSuperAdmin;
  const canManageRoles = isAdmin && !isTargetSuperAdmin;

  const isAnyMutationPending = 
    setVerificationState.isPending || 
    blockUserMutation.isPending || 
    unblockUserMutation.isPending ||
    promoteToOfficerMutation.isPending ||
    demoteToUserMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Moderation</CardTitle>
          <CardDescription>Search for users and manage their verification status, blocking, and roles</CardDescription>
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
                      {badgeVariant && <VerifiedBadge variant={badgeVariant} />}
                    </div>
                    <p className="text-sm text-muted-foreground">@{userProfile.username}</p>
                    <p className="text-sm">{userProfile.bio}</p>
                    <div className="flex gap-4 text-sm">
                      <span><strong>{userProfile.followersCount.toString()}</strong> followers</span>
                      <span><strong>{userProfile.followingCount.toString()}</strong> following</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Role: </span>
                        <span className="font-medium capitalize">{userProfile.role}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status: </span>
                        <span className={`font-medium ${userProfile.blocked ? 'text-red-600' : 'text-green-600'}`}>
                          {userProfile.blocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isTargetSuperAdmin && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Super-admin account cannot be moderated
                    </AlertDescription>
                  </Alert>
                )}

                {canModerateUser && (
                  <div className="mt-6 space-y-3">
                    {/* Blue Verification Controls */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Blue Verification</p>
                        <p className="text-sm text-muted-foreground">Standard verified badge</p>
                      </div>
                      {!isBlueVerified ? (
                        <Button
                          onClick={() => handleSetBlueVerification(true)}
                          disabled={isAnyMutationPending}
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {setVerificationState.isPending ? 'Enabling...' : 'Enable'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSetBlueVerification(false)}
                          disabled={isAnyMutationPending}
                          variant="outline"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {setVerificationState.isPending ? 'Disabling...' : 'Disable'}
                        </Button>
                      )}
                    </div>

                    {/* Orange Tick Controls */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Orange Tick</p>
                        <p className="text-sm text-muted-foreground">Special recognition badge</p>
                      </div>
                      {!hasOrangeTick ? (
                        <Button
                          onClick={() => handleSetOrangeTick(true)}
                          disabled={isAnyMutationPending}
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {setVerificationState.isPending ? 'Enabling...' : 'Enable'}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSetOrangeTick(false)}
                          disabled={isAnyMutationPending}
                          variant="outline"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {setVerificationState.isPending ? 'Disabling...' : 'Disable'}
                        </Button>
                      )}
                    </div>

                    {/* Block/Unblock Controls */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Block User</p>
                        <p className="text-sm text-muted-foreground">Prevent user from performing actions</p>
                      </div>
                      {!userProfile.blocked ? (
                        <Button
                          onClick={handleBlockUser}
                          disabled={isAnyMutationPending}
                          variant="destructive"
                          size="sm"
                        >
                          <ShieldOff className="w-4 h-4 mr-2" />
                          {blockUserMutation.isPending ? 'Blocking...' : 'Block'}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleUnblockUser}
                          disabled={isAnyMutationPending}
                          variant="outline"
                          size="sm"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          {unblockUserMutation.isPending ? 'Unblocking...' : 'Unblock'}
                        </Button>
                      )}
                    </div>

                    {/* Role Management (Admin Only) */}
                    {canManageRoles && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Officer Role</p>
                          <p className="text-sm text-muted-foreground">Grant moderation permissions</p>
                        </div>
                        {userProfile.role === UserRole.user ? (
                          <Button
                            onClick={handlePromoteToOfficer}
                            disabled={isAnyMutationPending}
                            size="sm"
                          >
                            <UserCog className="w-4 h-4 mr-2" />
                            {promoteToOfficerMutation.isPending ? 'Promoting...' : 'Promote to Officer'}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleDemoteToUser}
                            disabled={isAnyMutationPending}
                            variant="outline"
                            size="sm"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            {demoteToUserMutation.isPending ? 'Demoting...' : 'Demote to User'}
                          </Button>
                        )}
                      </div>
                    )}

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Red badge is reserved for admin users and cannot be manually assigned.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
