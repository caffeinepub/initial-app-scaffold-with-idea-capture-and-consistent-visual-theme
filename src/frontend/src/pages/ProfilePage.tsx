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
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="font-medium">
            {error instanceof Error ? error.message : 'Profile not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isAdminProfile = profile.role === UserRole.admin || isSuperAdmin;

  return (
    <div className={`container max-w-4xl mx-auto px-4 py-8 ${isAdminProfile ? 'admin-profile-theme' : ''}`}>
      <div className={`rounded-xl border-2 overflow-hidden shadow-strong ${
        isAdminProfile 
          ? 'border-[var(--admin-red)] bg-gradient-to-b from-[var(--admin-red-muted)] to-background' 
          : 'border-primary/30 bg-card'
      }`}>
        <div className={`p-6 ${
          isAdminProfile 
            ? 'bg-gradient-to-r from-[var(--admin-red)]/20 via-[var(--admin-red)]/25 to-[var(--admin-red)]/20 border-b-2 border-[var(--admin-red)]/40' 
            : 'bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b-2 border-primary/20'
        }`}>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className={isAdminProfile ? 'ring-4 ring-[var(--admin-red)]/50 rounded-full shadow-lg shadow-[var(--admin-red)]/20' : 'ring-4 ring-primary/30 rounded-full shadow-glow'}>
              <ProfileAvatar avatar={profile.avatar} username={profile.username} size="xl" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className={`text-2xl font-bold ${isAdminProfile ? 'text-[var(--admin-red)]' : 'text-primary'}`}>
                    {profile.displayName}
                  </h1>
                  {badgeVariant && <VerifiedBadge variant={badgeVariant} />}
                </div>
                <p className={`font-medium ${isAdminProfile ? 'text-[var(--admin-red)]/70' : 'text-muted-foreground'}`}>
                  @{profile.username}
                </p>
              </div>

              <div className="flex gap-6 text-sm">
                <button
                  onClick={() => navigate({ to: '/profile/$username/$type', params: { username, type: 'followers' } })}
                  className="hover:underline transition-all hover:scale-105"
                >
                  <span className={`font-bold ${isAdminProfile ? 'text-[var(--admin-red)]' : 'text-primary'}`}>
                    {followers.length}
                  </span>{' '}
                  <span className={`font-medium ${isAdminProfile ? 'text-[var(--admin-red)]/80' : 'text-foreground'}`}>followers</span>
                </button>
                <button
                  onClick={() => navigate({ to: '/profile/$username/$type', params: { username, type: 'following' } })}
                  className="hover:underline transition-all hover:scale-105"
                >
                  <span className={`font-bold ${isAdminProfile ? 'text-[var(--admin-red)]' : 'text-secondary'}`}>
                    {following.length}
                  </span>{' '}
                  <span className={`font-medium ${isAdminProfile ? 'text-[var(--admin-red)]/80' : 'text-foreground'}`}>following</span>
                </button>
                <span>
                  <span className={`font-bold ${isAdminProfile ? 'text-[var(--admin-red)]' : 'text-accent'}`}>
                    {posts.length}
                  </span>{' '}
                  <span className={`font-medium ${isAdminProfile ? 'text-[var(--admin-red)]/80' : 'text-foreground'}`}>posts</span>
                </span>
              </div>

              {profile.bio && (
                <p className={`text-sm font-medium ${isAdminProfile ? 'text-[var(--admin-red)]/90' : ''}`}>
                  {profile.bio}
                </p>
              )}

              {profile.email && isOwnProfile && (
                <p className={`text-sm ${isAdminProfile ? 'text-[var(--admin-red)]/70' : 'text-muted-foreground'}`}>
                  Email: {profile.email}
                </p>
              )}

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <EditProfileDialog profile={profile} />
                ) : (
                  <>
                    <FollowButton targetUserId={profile.id} />
                    <Button variant="outline" size="sm" onClick={handleMessage} className="border-2 font-semibold hover:scale-105 transition-all">
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
            ? 'bg-gradient-to-b from-[var(--admin-red-muted)] to-background' 
            : ''
        }`}>
          {isOwnProfile && isSuperAdmin && (
            <div className={`rounded-lg ${isAdminProfile ? 'border-2 border-[var(--admin-red)]/30 bg-[var(--admin-red)]/5' : ''}`}>
              <MediaControlsPanel />
            </div>
          )}

          {isOwnProfile && (
            <div className={`rounded-lg ${isAdminProfile ? 'border-2 border-[var(--admin-red)]/30 bg-[var(--admin-red)]/5 p-4' : ''}`}>
              <HighlightsRow />
            </div>
          )}

          <div>
            <h2 className={`text-xl font-bold mb-4 ${isAdminProfile ? 'text-[var(--admin-red)]' : 'text-primary'}`}>
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
