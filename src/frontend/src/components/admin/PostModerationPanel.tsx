import { useState } from 'react';
import { useGetAllPosts, useDeletePost } from '../../hooks/usePosts';
import { useGetProfileById } from '../../hooks/useProfiles';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Trash2, AlertCircle } from 'lucide-react';
import { usePostImageSrc } from '../../hooks/usePostImageSrc';
import { toast } from 'sonner';
import type { Post } from '../../types/missing-backend-types';

export function PostModerationPanel() {
  const { data: posts = [], isLoading, error } = useGetAllPosts();
  const deletePost = useDeletePost();
  const [deletingPostId, setDeletingPostId] = useState<bigint | null>(null);

  const handleDelete = async (postId: bigint) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setDeletingPostId(postId);
    try {
      await deletePost.mutateAsync(postId);
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Post Moderation</CardTitle>
          <CardDescription>Review and manage posts across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Post Moderation</CardTitle>
          <CardDescription>Review and manage posts across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load posts'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Moderation</CardTitle>
        <CardDescription>Review and manage posts across the platform ({posts.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No posts found</p>
          ) : (
            posts.map((post) => (
              <PostModerationItem
                key={post.id.toString()}
                post={post}
                onDelete={handleDelete}
                isDeleting={deletingPostId === post.id}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PostModerationItem({
  post,
  onDelete,
  isDeleting,
}: {
  post: Post;
  onDelete: (postId: bigint) => void;
  isDeleting: boolean;
}) {
  const { data: author } = useGetProfileById(post.author);
  const { src: imageSrc, isLoading: imageLoading, error: imageError } = usePostImageSrc(post.image);

  return (
    <div className="flex gap-4 p-4 border border-border rounded-lg">
      {post.image && (
        <div className="relative w-24 h-24 bg-muted rounded flex-shrink-0">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs text-center p-1">
              Image unavailable
            </div>
          )}
          {imageSrc && !imageError && (
            <img src={imageSrc} alt="Post thumbnail" className="w-full h-full object-cover rounded" />
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">@{author?.username || 'Unknown'}</p>
        <p className="text-sm text-muted-foreground truncate">{post.caption || 'No caption'}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {post.likesCount.toString()} likes · {post.commentsCount.toString()} comments
        </p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(post.id)}
        disabled={isDeleting}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  );
}
