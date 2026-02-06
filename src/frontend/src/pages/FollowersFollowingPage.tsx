import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProfileByUsername } from '../hooks/useProfiles';
import { useGetFollowers, useGetFollowing } from '../hooks/useSocialGraph';
import { useGetProfileById } from '../hooks/useProfiles';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { VerifiedBadge } from '../components/profile/VerifiedBadge';
import { getVerifiedBadgeVariant } from '../utils/verifiedBadge';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

export function FollowersFollowingPage() {
  const { username, type } = useParams({ from: '/profile/$username/$type' });
  const navigate = useNavigate();
  
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileByUsername(username);
  
  // Call both hooks unconditionally (Rules of Hooks requirement)
  const followersQuery = useGetFollowers(profile?.id);
  const followingQuery = useGetFollowing(profile?.id);
  
  // Select the appropriate query based on type
  const isFollowersView = type === 'followers';
  const { data: principals = [], isLoading: listLoading, error: listError } = isFollowersView
    ? followersQuery
    : followingQuery;

  const handleBack = () => {
    navigate({ to: '/profile/$username', params: { username } });
  };

  const handleUserClick = (clickedUsername: string) => {
    navigate({ to: '/profile/$username', params: { username: clickedUsername } });
  };

  if (profileLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
            <p className="text-muted-foreground mb-6">
              {profileError ? String(profileError) : 'This user does not exist'}
            </p>
            <Button onClick={() => navigate({ to: '/' })}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Button>
        <h1 className="text-2xl font-bold">
          {isFollowersView ? 'Followers' : 'Following'}
        </h1>
        <p className="text-muted-foreground">@{profile.username}</p>
      </div>

      {listLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading list...</p>
        </div>
      ) : listError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load {isFollowersView ? 'followers' : 'following'}: {String(listError)}
          </AlertDescription>
        </Alert>
      ) : principals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isFollowersView 
              ? 'No followers yet' 
              : 'Not following anyone yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {principals.map((principal) => (
            <UserListItem
              key={principal.toString()}
              principal={principal}
              onUserClick={handleUserClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface UserListItemProps {
  principal: Principal;
  onUserClick: (username: string) => void;
}

function UserListItem({ principal, onUserClick }: UserListItemProps) {
  const { data: userProfile, isLoading } = useGetProfileById(principal);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card animate-pulse">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-muted rounded mb-2" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const badgeVariant = getVerifiedBadgeVariant(userProfile);

  return (
    <button
      onClick={() => onUserClick(userProfile.username)}
      className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left"
    >
      <ProfileAvatar avatar={userProfile.avatar} username={userProfile.username} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold truncate">{userProfile.displayName}</p>
          {badgeVariant && <VerifiedBadge variant={badgeVariant} />}
        </div>
        <p className="text-sm text-muted-foreground truncate">@{userProfile.username}</p>
      </div>
    </button>
  );
}
