import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Heart, X } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useLikeStory, useUnlikeStory } from '../../hooks/useStories';
import { useGetProfileById } from '../../hooks/useProfiles';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { toast } from 'sonner';
import type { StoryView } from '../../backend';

interface StoryViewerProps {
  story: StoryView;
  open: boolean;
  onClose: () => void;
}

export function StoryViewer({ story, open, onClose }: StoryViewerProps) {
  const { identity } = useInternetIdentity();
  const { data: author } = useGetProfileById(story.author);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const likeMutation = useLikeStory();
  const unlikeMutation = useUnlikeStory();

  const isLiked = identity 
    ? story.likes.some(p => p.toString() === identity.getPrincipal().toString())
    : false;

  const likeCount = Number(story.likeCount);

  useEffect(() => {
    if (story.image) {
      const url = story.image.getDirectURL();
      setImageUrl(url);
    }
  }, [story.image]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeMutation.mutateAsync(story.id);
      } else {
        await likeMutation.mutateAsync(story.id);
      }
    } catch (err: any) {
      console.error('Failed to like/unlike story:', err);
      const errorMessage = err.message || 'Failed to update like';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-black border-none">
        <div className="relative h-[80vh] flex flex-col">
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {author && (
                  <>
                    <ProfileAvatar 
                      avatar={author.avatar} 
                      username={author.username} 
                      size="sm"
                    />
                    <span className="text-white font-semibold text-sm">
                      {author.username}
                    </span>
                  </>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Story" 
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
                className="text-white hover:bg-white/20 gap-2"
              >
                <Heart 
                  className={`w-6 h-6 ${isLiked ? 'fill-primary text-primary' : ''}`} 
                />
                <span>{likeCount}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
