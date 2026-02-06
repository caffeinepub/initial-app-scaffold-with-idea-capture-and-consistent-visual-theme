import { useState } from 'react';
import { Button } from '../ui/button';
import { useFollowUser, useUnfollowUser, useGetFollowing } from '../../hooks/useSocialGraph';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

interface FollowButtonProps {
  targetUserId: Principal;
}

export function FollowButton({ targetUserId }: FollowButtonProps) {
  const { identity } = useInternetIdentity();
  const currentUserId = identity?.getPrincipal();
  const { data: following = [] } = useGetFollowing(currentUserId);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const [isRequested, setIsRequested] = useState(false);

  const isFollowing = following.some(p => p.toString() === targetUserId.toString());
  const isPending = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = async () => {
    if (isFollowing || isRequested) {
      try {
        await unfollowMutation.mutateAsync(targetUserId);
        setIsRequested(false);
        toast.success('Unfollowed successfully');
      } catch (err: any) {
        toast.error(err.message || 'Failed to unfollow');
      }
    } else {
      try {
        await followMutation.mutateAsync(targetUserId);
        toast.success('Following successfully');
      } catch (err: any) {
        // Check if this is a pending follow request for private account
        if (err.message && err.message.toLowerCase().includes('pending')) {
          setIsRequested(true);
          toast.info('Follow request sent');
        } else {
          toast.error(err.message || 'Failed to follow');
        }
      }
    }
  };

  const buttonText = isPending 
    ? 'Loading...' 
    : isFollowing 
    ? 'Unfollow' 
    : isRequested 
    ? 'Requested' 
    : 'Follow';

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isFollowing || isRequested ? 'outline' : 'default'}
      size="sm"
    >
      {buttonText}
    </Button>
  );
}
