import { useState } from 'react';
import { useGetAllPosts, useDeletePost } from '../../hooks/usePosts';
import { useGetProfileById } from '../../hooks/useProfiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Post } from '../../backend';

function PostModerationItem({ post }: { post: Post }) {
  const { data: author } = useGetProfileById(post.author);
  const deletePost = useDeletePost();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useState(() => {
    if (post.image) {
      const url = post.image.getDirectURL();
      setImageUrl(url);
    }
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePost.mutateAsync(post.id);
      toast.success('Post deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Post" 
              className="w-24 h-24 object-cover rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm mb-1">
              @{author?.username || 'Unknown'}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {post.caption}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(Number(post.timeCreated) / 1000000).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deletePost.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PostModerationPanel() {
  const { data: posts = [], isLoading, error, refetch } = useGetAllPosts();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Post Moderation</CardTitle>
          <CardDescription>
            Review and manage posts across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error instanceof Error ? error.message : 'Failed to load posts'}
                </AlertDescription>
              </Alert>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No posts found
            </p>
          )}

          {!isLoading && !error && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostModerationItem key={post.id.toString()} post={post} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
