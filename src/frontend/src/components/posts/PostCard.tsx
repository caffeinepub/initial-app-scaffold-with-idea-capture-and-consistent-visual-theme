import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetProfileById } from '../../hooks/useProfiles';
import { useLikePost, useUnlikePost, useGetLikesByPost } from '../../hooks/usePosts';
import { usePostImageSrc } from '../../hooks/usePostImageSrc';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { Button } from '../ui/button';
import { Heart, MessageCircle, Share2, Trash2, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import type { Post } from '../../types/missing-backend-types';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: bigint) => void;
  showDeleteButton?: boolean;
}

export function PostCard({ post, onDelete, showDeleteButton = false }: PostCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: author } = useGetProfileById(post.author);
  const { data: likes = [] } = useGetLikesByPost(post.id);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  
  // Use the safe image hook instead of direct getDirectURL
  const { src: imageUrl, isLoading: imageLoading, error: imageError } = usePostImageSrc(post.image);

  const currentUserId = identity?.getPrincipal().toString();
  const isLiked = currentUserId ? likes.some(p => p.toString() === currentUserId) : false;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost.mutateAsync(post.id);
      } else {
        await likePost.mutateAsync(post.id);
      }
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleImageClick = () => {
    navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
  };

  const handleCommentClick = () => {
    navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  if (!author) return null;

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <ProfileAvatar avatar={author.avatar} username={author.username} size="sm" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{author.displayName}</p>
          <p className="text-xs text-muted-foreground">@{author.username}</p>
        </div>
        {showDeleteButton && onDelete && (
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Only render image if we have a valid src */}
      {imageUrl && (
        <div className="cursor-pointer" onClick={handleImageClick}>
          <img src={imageUrl} alt={post.caption} className="w-full aspect-square object-cover" />
        </div>
      )}
      
      {/* Show loading state for image */}
      {imageLoading && (
        <div className="w-full aspect-square bg-muted flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Show error state for image */}
      {imageError && post.image && (
        <div className="w-full aspect-square bg-muted flex flex-col items-center justify-center text-muted-foreground">
          <ImageOff className="w-12 h-12 mb-2" />
          <p className="text-sm">Image unavailable</p>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLike} className="gap-2">
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{Number(post.likesCount)}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCommentClick} className="gap-2">
            <MessageCircle className="w-5 h-5" />
            <span>{Number(post.commentsCount)}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold mr-2">{author.username}</span>
            {post.caption}
          </p>
        )}
      </div>
    </div>
  );
}
