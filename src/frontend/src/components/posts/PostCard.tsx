import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetProfileById } from '../../hooks/useProfiles';
import { useDeletePost } from '../../hooks/usePosts';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { VerifiedBadge } from '../profile/VerifiedBadge';
import { Button } from '../ui/button';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { getVerifiedBadgeVariant } from '../../utils/verifiedBadge';
import { usePostImageSrc } from '../../hooks/usePostImageSrc';
import { toast } from 'sonner';
import type { Post } from '../../types/missing-backend-types';

interface PostCardProps {
  post: Post;
  showDelete?: boolean;
}

export function PostCard({ post, showDelete = false }: PostCardProps) {
  const navigate = useNavigate();
  const { data: author } = useGetProfileById(post.author);
  const deletePost = useDeletePost();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { src: imageSrc, isLoading: imageLoading, error: imageError } = usePostImageSrc(post.image);
  const badgeVariant = getVerifiedBadgeVariant(author);

  const handlePostClick = () => {
    navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (author) {
      navigate({ to: '/profile/$username', params: { username: author.username } });
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      await deletePost.mutateAsync(post.id);
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handlePostClick}>
      <div className="p-4 flex items-center gap-3" onClick={handleAuthorClick}>
        <ProfileAvatar avatar={author?.avatar || ''} username={author?.username || 'unknown'} size="sm" />
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm">{author?.displayName || 'Unknown User'}</span>
            {badgeVariant && <VerifiedBadge variant={badgeVariant} />}
          </div>
          <span className="text-xs text-muted-foreground">@{author?.username || 'unknown'}</span>
        </div>
        {showDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {post.image && (
        <div className="relative w-full aspect-square bg-muted">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Image unavailable
            </div>
          )}
          {imageSrc && !imageError && (
            <img
              src={imageSrc}
              alt="Post"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
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
      </div>
    </div>
  );
}
