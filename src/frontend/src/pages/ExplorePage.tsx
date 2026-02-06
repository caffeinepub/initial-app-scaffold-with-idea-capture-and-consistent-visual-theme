import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { VerifiedBadge } from '../components/profile/VerifiedBadge';
import { useGetProfileByUsername } from '../hooks/useProfiles';
import { useGetAllPosts } from '../hooks/usePosts';
import { PostGrid } from '../components/posts/PostGrid';
import { Search } from 'lucide-react';

export function ExplorePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUsername, setSearchedUsername] = useState('');
  
  const { data: searchedUser } = useGetProfileByUsername(searchedUsername);
  const { data: allPosts = [], isLoading } = useGetAllPosts();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedUsername(searchQuery.trim());
  };

  const recentPosts = allPosts.slice(0, 30);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {searchedUser && (
        <Card className="mb-8">
          <CardContent className="p-4">
            <div 
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate({ to: '/profile/$username', params: { username: searchedUser.username } })}
            >
              <ProfileAvatar avatar={searchedUser.avatar} username={searchedUser.username} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{searchedUser.displayName}</h3>
                  {searchedUser.verified && <VerifiedBadge />}
                </div>
                <p className="text-sm text-muted-foreground">@{searchedUser.username}</p>
                {searchedUser.bio && (
                  <p className="text-sm mt-1">{searchedUser.bio}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm">
                  <span><strong>{Number(searchedUser.followersCount)}</strong> followers</span>
                  <span><strong>{Number(searchedUser.followingCount)}</strong> following</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Recent Posts</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      ) : (
        <PostGrid posts={recentPosts} />
      )}
    </div>
  );
}
