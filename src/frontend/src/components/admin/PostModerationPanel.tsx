import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PostCard } from '../posts/PostCard';
import { useGetAllPosts, useDeletePost } from '../../hooks/usePosts';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

export function PostModerationPanel() {
  const { data: posts = [], isLoading, error } = useGetAllPosts();
  const deleteMutation = useDeletePost();

  const handleDelete = (postId: bigint) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(postId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Moderation</CardTitle>
        <CardDescription>Review and manage posts across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load posts</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No posts found</p>
          </div>
        )}

        <div className="space-y-4">
          {posts.slice(0, 20).map((post) => (
            <PostCard 
              key={post.id.toString()} 
              post={post} 
              onDelete={handleDelete}
              showDeleteButton
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
