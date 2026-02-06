import { useGetHomeFeed } from '../hooks/usePosts';
import { PostCard } from '../components/posts/PostCard';
import { StoriesRow } from '../components/home/StoriesRow';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { AlertCircle } from 'lucide-react';

export function HomeFeedPage() {
  const { data: posts = [], isLoading, error, refetch } = useGetHomeFeed();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <StoriesRow />

      <h1 className="text-2xl font-bold mb-6">Home Feed</h1>

      {isLoading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your feed...</p>
        </div>
      )}

      {error && (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load feed'}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="text-center py-12">
          <img 
            src="/assets/generated/empty-feed.dim_1200x600.png" 
            alt="Empty feed" 
            className="w-full max-w-md mx-auto mb-6 rounded-lg"
          />
          <h2 className="text-xl font-semibold mb-2">Your feed is empty</h2>
          <p className="text-muted-foreground mb-4">
            Follow other users to see their posts here
          </p>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id.toString()} post={post} />
        ))}
      </div>
    </div>
  );
}
