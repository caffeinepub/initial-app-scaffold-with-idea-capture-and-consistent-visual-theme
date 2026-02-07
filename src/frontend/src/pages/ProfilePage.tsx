import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProfileByUsername, useGetCallerProfile } from '../hooks/useProfiles';
import { useGetPostsByUser } from '../hooks/usePosts';
import { useGetFollowers, useGetFollowing } from '../hooks/useSocialGraph';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { VerifiedBadge } from '../components/profile/VerifiedBadge';
import { FollowButton } from '../components/profile/FollowButton';
import { EditProfileDialog } from '../components/profile/EditProfileDialog';
import { SuperAdminManagePanel } from '../components/profile/SuperAdminManagePanel';
import { MediaControlsPanel } from '../components/profile/MediaControlsPanel';
import { HighlightsRow } from '../components/profile/HighlightsRow';
import { PostGrid } from '../components/posts/PostGrid';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { getVerifiedBadgeVariant } from '../utils/verifiedBadge';
import { UserRole } from '../backend';
import { isSuperAdminPrincipal } from '../constants/superAdmin';

export function ProfilePage() {
  const { username } = useParams({ from: '/profile/$username' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading, error } = useGetProfileByUsername(username);
  const { data: currentUserProfile } = useGetCallerProfile();
  const { data: posts = [] } = useGetPostsByUser(profile?.id);
  const { data: followers = [] } = useGetFollowers(profile?.id);
  const { data: following = [] } = useGetFollowing(profile?.id);

  const isOwnProfile = currentUserProfile?.id.toString() === profile?.id.toString();
  const isSuperAdmin = profile ? isSuperAdminPrincipal(profile.id) : false;
  const badgeVariant = getVerifiedBadgeVariant(profile);

  const handleMessage = () => {
    if (profile) {
      navigate({ to: '/messages' });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Profile not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isAdminProfile = profile.role === UserRole.admin || isSuperAdmin;

  return (
    <div className={`container max-w-4xl mx-auto px-4 py-8 ${isAdminProfile ? 'admin-profile-theme' : ''}`}>
      <div className={`rounded-lg border-2 overflow-hidden ${
        isAdminProfile 
          ? 'border-[var(--admin-red)]/30 bg-gradient-to-b from-[var(--admin-red)]/5 to-transparent' 
          : 'border-border bg-card'
      }`}>
        <div className={`p-6 ${
          isAdminProfile 
            ? 'bg-gradient-to-r from-[var(--admin-red)]/10 via-[var(--admin-red)]/15 to-[var(--admin-red)]/10' 
            : 'bg-muted/50'
        }`}>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className={isAdminProfile ? 'ring-2 ring-[var(--admin-red)]/30 rounded-full' : ''}>
              <ProfileAvatar avatar={profile.avatar} username={profile.username} size="xl" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className={`text-2xl font-bold ${isAdminProfile ? 'text-[var(--admin-red)]' : ''}`}>
                    {profile.displayName}
                  </h1>
                  {badgeVariant && <VerifiedBadge variant={badgeVariant} />}
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              <div className="flex gap-6 text-sm">
                <span>
                  <span className={`font-semibold ${isAdminProfile ? 'text-[var(--admin-red)]' : ''}`}>
                    {followers.length}
                  </span> followers
                </span>
                <span>
                  <span className={`font-semibold ${isAdminProfile ? 'text-[var(--admin-red)]' : ''}`}>
                    {following.length}
                  </span> following
                </span>
                <span>
                  <span className={`font-semibold ${isAdminProfile ? 'text-[var(--admin-red)]' : ''}`}>
                    {posts.length}
                  </span> posts
                </span>
              </div>

              {profile.bio && <p className="text-sm">{profile.bio}</p>}

              {profile.email && isOwnProfile && (
                <p className="text-sm text-muted-foreground">Email: {profile.email}</p>
              )}

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <EditProfileDialog profile={profile} />
                ) : (
                  <>
                    <FollowButton targetUserId={profile.id} />
                    <Button variant="outline" size="sm" onClick={handleMessage}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 space-y-6 ${
          isAdminProfile 
            ? 'bg-gradient-to-b from-[var(--admin-red)]/5 to-transparent' 
            : ''
        }`}>
          {isOwnProfile && isSuperAdmin && (
            <div className={isAdminProfile ? 'border border-[var(--admin-red)]/20 rounded-lg' : ''}>
              <MediaControlsPanel />
            </div>
          )}

          {isOwnProfile && (
            <div className={isAdminProfile ? 'border border-[var(--admin-red)]/20 rounded-lg p-4' : ''}>
              <HighlightsRow />
            </div>
          )}

          <div>
            <h2 className={`text-xl font-semibold mb-4 ${isAdminProfile ? 'text-[var(--admin-red)]' : ''}`}>
              Posts
            </h2>
            <PostGrid posts={posts} />
          </div>
        </div>
      </div>

      {!isOwnProfile && currentUserProfile?.role === UserRole.admin && (
        <div className="mt-6">
          <SuperAdminManagePanel profile={profile} />
        </div>
      )}
    </div>
  );
}
