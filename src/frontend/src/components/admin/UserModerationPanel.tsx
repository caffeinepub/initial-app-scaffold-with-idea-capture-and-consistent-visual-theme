import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { VerifiedBadge } from '../profile/VerifiedBadge';
import { useGetProfileByUsername } from '../../hooks/useProfiles';
import { useBlockUser, useUnblockUser, useVerifyUser, useUnverifyUser, usePromoteToOfficer, useDemoteFromOfficer } from '../../hooks/useAdminModeration';
import { AlertCircle, Shield, ShieldOff, CheckCircle, XCircle, UserPlus, UserMinus } from 'lucide-react';
import { UserRole } from '../../backend';

export function UserModerationPanel() {
  const [searchUsername, setSearchUsername] = useState('');
  const [queriedUsername, setQueriedUsername] = useState('');
  
  const { data: targetUser, isLoading, error } = useGetProfileByUsername(queriedUsername);
  
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const verifyMutation = useVerifyUser();
  const unverifyMutation = useUnverifyUser();
  const promoteMutation = usePromoteToOfficer();
  const demoteMutation = useDemoteFromOfficer();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueriedUsername(searchUsername.trim());
  };

  const isAdmin = targetUser?.role === UserRole.admin;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Moderation</CardTitle>
        <CardDescription>Search for users and manage their accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search-username" className="sr-only">Username</Label>
            <Input
              id="search-username"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Enter username..."
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to find user</AlertDescription>
          </Alert>
        )}

        {targetUser && (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <ProfileAvatar avatar={targetUser.avatar} username={targetUser.username} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{targetUser.displayName}</h3>
                  {targetUser.verified && <VerifiedBadge role={targetUser.role} />}
                </div>
                <p className="text-sm text-muted-foreground">@{targetUser.username}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Role: <span className="font-medium capitalize">{targetUser.role}</span>
                  {targetUser.blocked && <span className="text-destructive ml-2">(Blocked)</span>}
                </p>
              </div>
            </div>

            {targetUser.bio && (
              <p className="text-sm">{targetUser.bio}</p>
            )}

            {isAdmin ? (
              <Alert>
                <AlertDescription>
                  Admin users cannot be moderated
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={targetUser.blocked ? 'default' : 'destructive'}
                  size="sm"
                  onClick={() => targetUser.blocked ? unblockMutation.mutate(targetUser.id) : blockMutation.mutate(targetUser.id)}
                  disabled={blockMutation.isPending || unblockMutation.isPending}
                  className="gap-2"
                >
                  {targetUser.blocked ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                  {targetUser.blocked ? 'Unblock' : 'Block'}
                </Button>

                <Button
                  variant={targetUser.verified ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => targetUser.verified ? unverifyMutation.mutate(targetUser.id) : verifyMutation.mutate(targetUser.id)}
                  disabled={verifyMutation.isPending || unverifyMutation.isPending}
                  className="gap-2"
                >
                  {targetUser.verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {targetUser.verified ? 'Unverify' : 'Verify'}
                </Button>

                <Button
                  variant={targetUser.role === UserRole.officer ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={() => targetUser.role === UserRole.officer ? demoteMutation.mutate(targetUser.id) : promoteMutation.mutate(targetUser.id)}
                  disabled={promoteMutation.isPending || demoteMutation.isPending}
                  className="gap-2"
                >
                  {targetUser.role === UserRole.officer ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {targetUser.role === UserRole.officer ? 'Demote from Officer' : 'Promote to Officer'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
