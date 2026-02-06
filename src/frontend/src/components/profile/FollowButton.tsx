import { useState } from 'react';
import { Button } from '../ui/button';
import { useFollowUser, useUnfollowUser, useIsFollowing } from '../../hooks/useSocialGraph';
import type { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

interface FollowButtonProps {
  targetUserId: Principal;
}

export function FollowButton({ targetUserId }: FollowButtonProps) {
  const isFollowing = useIsFollowing(targetUserId);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const [isRequested, setIsRequested] = useState(false);

  const isPending = followMutation.isPending || unfollowMutation.isPending;

  const handleClick = async () => {
    if (isFollowing || isRequested) {
      try {
        await unfollowMutation.mutateAsync(targetUserId);
        setIsRequested(false);
      } catch (err: any) {
        toast.error(err.message || 'Failed to unfollow');
      }
    } else {
      try {
        await followMutation.mutateAsync(targetUserId);
      } catch (err: any) {
        if (err.message && err.message.includes('Pending approval')) {
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
