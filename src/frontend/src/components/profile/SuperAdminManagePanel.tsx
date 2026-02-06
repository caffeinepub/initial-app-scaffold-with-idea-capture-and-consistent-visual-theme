import { useState } from 'react';
import { useBlockUser, useUnblockUser, useVerifyUser, useUnverifyUser } from '../../hooks/useAdminModeration';
import { useDeletePost, useGetPostsByUser } from '../../hooks/usePosts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Shield, ShieldOff, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { UserRole } from '../../backend';
import type { PublicUserProfile } from '../../backend';

interface SuperAdminManagePanelProps {
  profile: PublicUserProfile;
  onActionComplete?: () => void;
}

export function SuperAdminManagePanel({ profile, onActionComplete }: SuperAdminManagePanelProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const verifyUser = useVerifyUser();
  const unverifyUser = useUnverifyUser();
  const deletePost = useDeletePost();
  
  const { data: userPosts = [] } = useGetPostsByUser(profile.id);

  const isAdminTarget = profile.role === UserRole.admin;

  const handleBlock = async () => {
    if (isAdminTarget) {
      setError('Cannot block admin users');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await blockUser.mutateAsync(profile.id);
      setSuccess('User blocked successfully');
      onActionComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block user');
    }
  };

  const handleUnblock = async () => {
    setError('');
    setSuccess('');
    try {
      await unblockUser.mutateAsync(profile.id);
      setSuccess('User unblocked successfully');
      onActionComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unblock user');
    }
  };

  const handleVerify = async () => {
    setError('');
    setSuccess('');
    try {
      await verifyUser.mutateAsync(profile.id);
      setSuccess('User verified successfully');
      onActionComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify user');
    }
  };

  const handleUnverify = async () => {
    if (isAdminTarget) {
      setError('Cannot unverify admin users');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await unverifyUser.mutateAsync(profile.id);
      setSuccess('User unverified successfully');
      onActionComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unverify user');
    }
  };

  const handleDeletePost = async (postId: bigint) => {
    setError('');
    setSuccess('');
    try {
      await deletePost.mutateAsync(postId);
      setSuccess('Post deleted successfully');
      onActionComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Manage User</CardTitle>
        <CardDescription>Admin controls for @{profile.username}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Account Status</h3>
          <div className="flex gap-2">
            {profile.blocked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnblock}
                disabled={unblockUser.isPending}
                className="gap-2"
              >
                <Shield className="w-4 h-4" />
                {unblockUser.isPending ? 'Unblocking...' : 'Unblock User'}
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBlock}
                disabled={blockUser.isPending || isAdminTarget}
                className="gap-2"
              >
                <ShieldOff className="w-4 h-4" />
                {blockUser.isPending ? 'Blocking...' : 'Block User'}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Verification</h3>
          <div className="flex gap-2">
            {profile.verified ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnverify}
                disabled={unverifyUser.isPending || isAdminTarget}
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                {unverifyUser.isPending ? 'Removing...' : 'Remove Blue Tick'}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleVerify}
                disabled={verifyUser.isPending}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {verifyUser.isPending ? 'Verifying...' : 'Give Blue Tick'}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">User Posts ({userPosts.length})</h3>
          {userPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts to manage</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userPosts.map((post) => (
                <div key={post.id.toString()} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{post.caption || 'No caption'}</p>
                    <p className="text-xs text-muted-foreground">
                      {Number(post.likesCount)} likes · {Number(post.commentsCount)} comments
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletePost.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
