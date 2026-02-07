import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Trash2 } from 'lucide-react';
import { useGetAllPosts, useDeletePost, type Post } from '../../hooks/usePosts';
import { useGetProfileById } from '../../hooks/useProfiles';
import { usePostImageSrc } from '../../hooks/usePostImageSrc';
import { useBackendErrorToast } from '../../hooks/useBackendErrorToast';

function PostItem({ post }: { post: Post }) {
  const { data: author } = useGetProfileById(post.author);
  const deletePost = useDeletePost();
  const { showError, showSuccess } = useBackendErrorToast();
  const { src: thumbnailSrc, isLoading: thumbnailLoading } = usePostImageSrc(post.image || null);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePost.mutateAsync(post.id);
      showSuccess('Post deleted successfully');
    } catch (err) {
      showError(err, 'Failed to delete post');
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-muted/30 to-transparent hover:shadow-md transition-all">
      {post.image && (
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20">
          {thumbnailLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : thumbnailSrc ? (
            <img src={thumbnailSrc} alt="Post thumbnail" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground font-medium">
              No image
            </div>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-primary mb-1">
          @{author?.username || 'Unknown'}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
          {post.caption || 'No caption'}
        </p>
        <p className="text-xs text-muted-foreground mt-2 font-medium">
          {new Date(Number(post.timeCreated) / 1000000).toLocaleString()}
        </p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={deletePost.isPending}
        className="font-semibold"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  );
}

export function PostModerationPanel() {
  const { data: posts = [], isLoading, error } = useGetAllPosts();

  return (
    <Card className="border-2 border-secondary/20 shadow-strong">
      <CardHeader className="bg-gradient-to-r from-secondary/10 to-accent/10">
        <CardTitle className="text-secondary">Post Moderation</CardTitle>
        <CardDescription className="font-medium">Review and manage posts across the platform</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Loading posts...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load posts'}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-medium">No posts found</p>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostItem key={post.id.toString()} post={post} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
