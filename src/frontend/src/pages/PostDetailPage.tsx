import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetPostById, useGetLikesByPost, useGetCommentsByPost, useAddComment } from '../hooks/usePosts';
import { useLikePost, useUnlikePost } from '../hooks/usePosts';
import { useGetProfileById } from '../hooks/useProfiles';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { VerifiedBadge } from '../components/profile/VerifiedBadge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function PostDetailPage() {
  const { postId } = useParams({ from: '/post/$postId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const postIdBigInt = BigInt(postId);
  const { data: post, isLoading: postLoading } = useGetPostById(postIdBigInt);
  const { data: author } = useGetProfileById(post?.author);
  const { data: likes = [] } = useGetLikesByPost(postIdBigInt);
  const { data: comments = [] } = useGetCommentsByPost(postIdBigInt);
  
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const addCommentMutation = useAddComment();

  const isLiked = identity ? likes.some(p => p.toString() === identity.getPrincipal().toString()) : false;

  useEffect(() => {
    if (post?.image) {
      const url = post.image.getDirectURL();
      setImageUrl(url);
    }
  }, [post?.image]);

  const handleLike = () => {
    if (isLiked) {
      unlikeMutation.mutate(postIdBigInt);
    } else {
      likeMutation.mutate(postIdBigInt);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addCommentMutation.mutateAsync({ postId: postIdBigInt, text: commentText.trim() });
      setCommentText('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate({ to: -1 as any });
    } else {
      navigate({ to: '/' });
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Post not found</h2>
          <p className="text-muted-foreground mb-4">This post doesn't exist or has been removed</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Post</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto">
        <div className="md:flex md:h-[calc(100vh-3.5rem)]">
          {imageUrl && (
            <div className="md:flex-1 md:flex md:items-center md:justify-center bg-black">
              <img 
                src={imageUrl} 
                alt="Post" 
                className="w-full h-auto max-h-[70vh] md:max-h-full object-contain"
              />
            </div>
          )}

          <div className="md:w-96 md:border-l flex flex-col">
            <div className="p-4 border-b">
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
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {post.caption && (
                  <div className="flex gap-3">
                    {author && <ProfileAvatar avatar={author.avatar} username={author.username} size="sm" />}
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold mr-2">{author?.username}</span>
                        {post.caption}
                      </p>
                    </div>
                  </div>
                )}

                {comments.map((comment) => (
                  <CommentItem key={comment.id.toString()} comment={comment} />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t">
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={likeMutation.isPending || unlikeMutation.isPending}
                    className="gap-2 px-2"
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 px-2">
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 px-2">
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>

                <div>
                  <p className="font-semibold text-sm">{Number(post.likesCount)} likes</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Number(post.timeCreated) / 1000000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddComment} className="p-4 border-t flex gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  disabled={addCommentMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  size="sm"
                >
                  {addCommentMutation.isPending ? 'Posting...' : 'Post'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: any }) {
  const navigate = useNavigate();
  const { data: commentAuthor } = useGetProfileById(comment.author);

  return (
    <div className="flex gap-3">
      {commentAuthor && (
        <div 
          className="cursor-pointer"
          onClick={() => navigate({ to: '/profile/$username', params: { username: commentAuthor.username } })}
        >
          <ProfileAvatar avatar={commentAuthor.avatar} username={commentAuthor.username} size="sm" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm">
          <span 
            className="font-semibold mr-2 cursor-pointer hover:underline"
            onClick={() => commentAuthor && navigate({ to: '/profile/$username', params: { username: commentAuthor.username } })}
          >
            {commentAuthor?.username}
          </span>
          {comment.text}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(Number(comment.timeCreated) / 1000000).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
