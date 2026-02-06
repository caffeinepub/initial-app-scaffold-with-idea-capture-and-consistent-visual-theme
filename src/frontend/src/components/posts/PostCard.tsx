import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { VerifiedBadge } from '../profile/VerifiedBadge';
import { useLikePost, useUnlikePost, useGetLikesByPost } from '../../hooks/usePosts';
import { useGetProfileById } from '../../hooks/useProfiles';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Post } from '../../backend';

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
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const isLiked = identity ? likes.some(p => p.toString() === identity.getPrincipal().toString()) : false;

  useEffect(() => {
    if (post.image) {
      const url = post.image.getDirectURL();
      setImageUrl(url);
    }
  }, [post.image]);

  const handleLike = () => {
    if (isLiked) {
      unlikeMutation.mutate(post.id);
    } else {
      likeMutation.mutate(post.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const openPostDetail = () => {
    navigate({ to: '/post/$postId', params: { postId: post.id.toString() } });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => author && navigate({ to: '/profile/$username', params: { username: author.username } })}
          >
            {author && <ProfileAvatar avatar={author.avatar} username={author.username} size="sm" />}
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{author?.displayName || 'Unknown'}</span>
                {author?.verified && <VerifiedBadge />}
              </div>
              <span className="text-xs text-muted-foreground">@{author?.username || 'unknown'}</span>
            </div>
          </div>
          {showDeleteButton && onDelete && (
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>

        {/* Image */}
        {imageUrl && (
          <div className="w-full aspect-square bg-muted cursor-pointer" onClick={openPostDetail}>
            <img 
              src={imageUrl} 
              alt="Post" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={likeMutation.isPending || unlikeMutation.isPending}
              className="gap-2 px-2"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={openPostDetail} className="gap-2 px-2">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 px-2">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-sm">{Number(post.likesCount)} likes</p>
            {post.caption && (
              <p className="text-sm">
                <span className="font-semibold mr-2">{author?.username}</span>
                {post.caption}
              </p>
            )}
            {Number(post.commentsCount) > 0 && (
              <button 
                onClick={openPostDetail}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                View all {Number(post.commentsCount)} comments
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
