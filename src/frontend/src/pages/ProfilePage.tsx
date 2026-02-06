import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetProfileByUsername, useGetCallerProfile } from '../hooks/useProfiles';
import { useGetPostsByUser } from '../hooks/usePosts';
import { useGetFollowing } from '../hooks/useSocialGraph';
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
import { MessageCircle, Lock } from 'lucide-react';
import { UserRole, ProfileVisibility } from '../backend';

const SUPER_ADMIN_PRINCIPAL = 'xgwt2-7h2p4-m54fq-hruec-r4x4i-nntjq-wdi7h-e2pwa-zmwzr-zhexp-nqe';

export function ProfilePage() {
  const { username } = useParams({ from: '/profile/$username' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: callerProfile } = useGetCallerProfile();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileByUsername(username);
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useGetPostsByUser(profile?.id);
  const { data: following = [] } = useGetFollowing(identity?.getPrincipal());

  const isOwnProfile = identity && profile ? identity.getPrincipal().toString() === profile.id.toString() : false;
  const isSuperAdmin = identity ? identity.getPrincipal().toString() === SUPER_ADMIN_PRINCIPAL : false;
  const isFollowing = profile ? following.some(p => p.toString() === profile.id.toString()) : false;

  const handleActionComplete = () => {
    refetchProfile();
    refetchPosts();
  };

  const handleMessageClick = () => {
    if (profile) {
      navigate({ to: '/messages/$peer', params: { peer: profile.username } });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-muted-foreground">This user doesn't exist</p>
        </div>
      </div>
    );
  }

  const isPrivateProfile = profile.visibility === ProfileVisibility.privateProfile;
  const canViewPosts = isOwnProfile || isSuperAdmin || !isPrivateProfile || isFollowing;

  // Determine if verified badge should be shown
  const showVerifiedBadge = profile.verified || profile.hasOrangeTick;
  const isProfileSuperAdmin = profile.id.toString() === SUPER_ADMIN_PRINCIPAL;
  const isAdminProfile = profile.role === UserRole.admin || isProfileSuperAdmin;

  // Determine badge variant: red for admin, orange for orange tick, blue for verified
  const badgeVariant = isAdminProfile ? 'red' : profile.hasOrangeTick ? 'orange' : 'blue';

  // Apply red theme classes for admin profiles
  const containerClass = isAdminProfile
    ? 'container max-w-4xl mx-auto px-4 py-6 [&_.profile-header]:bg-red-50 dark:[&_.profile-header]:bg-red-950/20 [&_.profile-header]:border-red-200 dark:[&_.profile-header]:border-red-800'
    : 'container max-w-4xl mx-auto px-4 py-6';

  const headerClass = isAdminProfile
    ? 'mb-8 profile-header p-6 rounded-lg border'
    : 'mb-8';

  const buttonVariant = isAdminProfile ? 'default' : 'outline';
  const buttonClass = isAdminProfile
    ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
    : '';

  return (
    <div className={containerClass}>
      <div className={headerClass}>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center mb-6">
          <ProfileAvatar avatar={profile.avatar} username={profile.username} size="xl" />
          
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                {showVerifiedBadge && (
                  <VerifiedBadge variant={badgeVariant} />
                )}
              </div>
              
              {isOwnProfile ? (
                <EditProfileDialog profile={profile} />
              ) : (
                <div className="flex gap-2">
                  <FollowButton targetUserId={profile.id} />
                  <Button 
                    variant={buttonVariant} 
                    size="sm" 
                    onClick={handleMessageClick} 
                    className={`gap-2 ${buttonClass}`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              )}
            </div>

            <p className="text-muted-foreground mb-2">@{profile.username}</p>

            <div className="flex gap-6 mb-4 text-sm">
              <span><strong>{Number(profile.followersCount)}</strong> followers</span>
              <span><strong>{Number(profile.followingCount)}</strong> following</span>
              <span><strong>{posts.length}</strong> posts</span>
            </div>

            {profile.bio && (
              <p className="text-sm mb-4">{profile.bio}</p>
            )}

            {isPrivateProfile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Private Account</span>
              </div>
            )}

            {(isSuperAdmin || isOwnProfile) && profile.email && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border mt-4">
                <strong>Email:</strong> {profile.email}
              </div>
            )}
          </div>
        </div>

        <HighlightsRow />

        {isSuperAdmin && !isOwnProfile && profile.role !== UserRole.admin && (
          <div className="mb-6">
            <SuperAdminManagePanel profile={profile} onActionComplete={handleActionComplete} />
          </div>
        )}

        {isSuperAdmin && isOwnProfile && (
          <div className="mb-6">
            <MediaControlsPanel />
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        {postsLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : !canViewPosts ? (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This account is private. Follow to see their posts.
            </AlertDescription>
          </Alert>
        ) : (
          <PostGrid posts={posts} />
        )}
      </div>
    </div>
  );
}
