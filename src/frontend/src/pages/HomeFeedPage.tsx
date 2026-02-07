import { useGetHomeFeed } from '../hooks/usePosts';
import { PostCard } from '../components/posts/PostCard';
import { StoriesRow } from '../components/home/StoriesRow';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { AlertCircle } from 'lucide-react';

export function HomeFeedPage() {
  const { data: posts = [], isLoading, error, refetch } = useGetHomeFeed();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <StoriesRow />

      <div className="bg-card rounded-xl border-2 border-primary/20 p-6 shadow-strong">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Home Feed</h1>

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Loading your feed...</p>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <Alert variant="destructive" className="border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium">
                {error instanceof Error ? error.message : 'Failed to load feed'}
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button onClick={() => refetch()} variant="outline" className="border-2 font-semibold">
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
              className="w-full max-w-md mx-auto mb-6 rounded-xl border-2 border-muted shadow-soft"
            />
            <h2 className="text-xl font-bold mb-2 text-primary">Your feed is empty</h2>
            <p className="text-muted-foreground font-medium mb-4">
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
    </div>
  );
}
