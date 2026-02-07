import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetPostById, useGetCommentsByPost, useAddComment } from '../hooks/usePosts';
import { useGetProfileById } from '../hooks/useProfiles';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { VerifiedBadge } from '../components/profile/VerifiedBadge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Heart, MessageCircle, Share2, ArrowLeft, AlertCircle } from 'lucide-react';
import { getVerifiedBadgeVariant } from '../utils/verifiedBadge';
import { usePostImageSrc } from '../hooks/usePostImageSrc';
import { useState } from 'react';
import { toast } from 'sonner';

export function PostDetailPage() {
  const { postId } = useParams({ from: '/post/$postId' });
  const navigate = useNavigate();
  const { data: post, isLoading, error } = useGetPostById(BigInt(postId));
  const { data: author } = useGetProfileById(post?.author);
  const { data: comments = [] } = useGetCommentsByPost(BigInt(postId));
  const addComment = useAddComment();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { src: imageSrc, isLoading: imageLoading, error: imageError } = usePostImageSrc(post?.image || null);
  const badgeVariant = getVerifiedBadgeVariant(author);

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleAuthorClick = () => {
    if (author) {
      navigate({ to: '/profile/$username', params: { username: author.username } });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment.mutateAsync({ postId: BigInt(postId), text: commentText });
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Post not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={handleAuthorClick}>
          <ProfileAvatar avatar={author?.avatar || ''} username={author?.username || 'unknown'} size="sm" />
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{author?.displayName || 'Unknown User'}</span>
              {badgeVariant && <VerifiedBadge variant={badgeVariant} />}
            </div>
            <span className="text-xs text-muted-foreground">@{author?.username || 'unknown'}</span>
          </div>
        </div>

        {post.image && (
          <div className="relative w-full aspect-square bg-muted">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Image unavailable
              </div>
            )}
            {imageSrc && !imageError && (
              <img
                src={imageSrc}
                alt="Post"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}

        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <Heart className="w-5 h-5" />
              <span className="text-sm">{post.likesCount.toString()}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.commentsCount.toString()}</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {post.caption && (
            <p className="text-sm">
              <span className="font-semibold mr-2">@{author?.username || 'unknown'}</span>
              {post.caption}
            </p>
          )}

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-4">Comments</h3>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {comments.map((comment: any) => (
                  <div key={comment.id.toString()} className="text-sm">
                    <span className="font-semibold mr-2">@{comment.author}</span>
                    {comment.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting || !commentText.trim()}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
