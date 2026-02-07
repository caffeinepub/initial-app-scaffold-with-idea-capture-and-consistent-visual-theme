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
      <Card className="border-2 border-primary/20 shadow-strong">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardTitle className="text-primary">User Moderation</CardTitle>
          <CardDescription className="font-medium">Search for users and manage their verification status, blocking, and roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Username</Label>
              <Input
                id="search"
                placeholder="Enter username to search..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="border-2 font-medium"
              />
            </div>
            <Button type="submit" disabled={isSearching || !searchUsername.trim()} className="font-semibold">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {isSearching && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Searching...</p>
            </div>
          )}

          {!isSearching && searchedUsername && !userProfile && (
            <Alert className="border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">User not found or you don't have permission to view this profile</AlertDescription>
            </Alert>
          )}

          {userProfile && (
            <Card className="border-2 border-accent/20 shadow-soft">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="ring-2 ring-primary/30 rounded-full">
                    <ProfileAvatar avatar={userProfile.avatar} username={userProfile.username} size="lg" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-primary">{userProfile.displayName}</h3>
                      {badgeVariant && <VerifiedBadge variant={badgeVariant} />}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">@{userProfile.username}</p>
                    <p className="text-sm font-medium">{userProfile.bio}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="font-semibold"><strong className="text-primary">{userProfile.followersCount.toString()}</strong> followers</span>
                      <span className="font-semibold"><strong className="text-secondary">{userProfile.followingCount.toString()}</strong> following</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground font-medium">Role: </span>
                        <span className="font-bold capitalize text-accent">{userProfile.role}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Status: </span>
                        <span className={`font-bold ${userProfile.blocked ? 'text-destructive' : 'text-primary'}`}>
                          {userProfile.blocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {canModerateUser && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20">
                      <h4 className="font-bold mb-3 text-primary">Verification Controls</h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={isBlueVerified ? "default" : "outline"}
                          onClick={() => handleSetBlueVerification(!isBlueVerified)}
                          disabled={isAnyMutationPending}
                          className="font-semibold border-2"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isBlueVerified ? 'Remove Blue Check' : 'Give Blue Check'}
                        </Button>
                        <Button
                          size="sm"
                          variant={hasOrangeTick ? "secondary" : "outline"}
                          onClick={() => handleSetOrangeTick(!hasOrangeTick)}
                          disabled={isAnyMutationPending}
                          className="font-semibold border-2"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {hasOrangeTick ? 'Remove Orange Tick' : 'Give Orange Tick'}
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-destructive/5 to-accent/5 border-2 border-destructive/20">
                      <h4 className="font-bold mb-3 text-destructive">User Management</h4>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.blocked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleUnblockUser}
                            disabled={isAnyMutationPending}
                            className="font-semibold border-2 hover:bg-primary/10 hover:text-primary"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Unblock User
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleBlockUser}
                            disabled={isAnyMutationPending}
                            className="font-semibold"
                          >
                            <ShieldOff className="w-4 h-4 mr-2" />
                            Block User
                          </Button>
                        )}
                      </div>
                    </div>

                    {canManageRoles && (
                      <div className="p-4 rounded-lg bg-gradient-to-r from-accent/5 to-secondary/5 border-2 border-accent/20">
                        <h4 className="font-bold mb-3 text-accent">Role Management</h4>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.role === UserRole.officer ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleDemoteToUser}
                              disabled={isAnyMutationPending}
                              className="font-semibold border-2"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Demote to User
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={handlePromoteToOfficer}
                              disabled={isAnyMutationPending}
                              className="font-semibold"
                            >
                              <UserCog className="w-4 h-4 mr-2" />
                              Promote to Officer
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
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
