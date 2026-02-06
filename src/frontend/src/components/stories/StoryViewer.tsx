import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { X, Heart } from 'lucide-react';
import { useLikeStory, useUnlikeStory } from '../../hooks/useStories';
import { useGetProfileById } from '../../hooks/useProfiles';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { ProfileAvatar } from '../profile/ProfileAvatar';
import { ExternalBlob } from '../../backend';
import type { StoryView } from '../../types/missing-backend-types';
import { toast } from 'sonner';
import { formatBackendError } from '../../utils/formatBackendError';

interface StoryViewerProps {
  story: StoryView;
  open: boolean;
  onClose: () => void;
}

export function StoryViewer({ story, open, onClose }: StoryViewerProps) {
  const { identity } = useInternetIdentity();
  const { data: author } = useGetProfileById(story.author);
  const likeStory = useLikeStory();
  const unlikeStory = useUnlikeStory();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const currentUserId = identity?.getPrincipal().toString();
  const isLiked = currentUserId ? story.likes.some(p => p.toString() === currentUserId) : false;

  // Load image when dialog opens
  useState(() => {
    if (open && story.image) {
      try {
        const url = story.image.getDirectURL();
        setImageUrl(url);
        setImageError(false);
      } catch (err) {
        console.error('Failed to load story image:', err);
        setImageError(true);
        toast.error(formatBackendError(err));
      }
    }
  });

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeStory.mutateAsync(story.id);
      } else {
        await likeStory.mutateAsync(story.id);
      }
    } catch (err) {
      toast.error(formatBackendError(err));
    }
  };

  if (!author) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-black border-none">
        <div className="relative h-[80vh]">
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ProfileAvatar avatar={author.avatar} username={author.username} size="sm" />
                <div>
                  <p className="font-semibold text-white text-sm">{author.displayName}</p>
                  <p className="text-xs text-white/80">@{author.username}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {imageUrl && !imageError && (
            <img src={imageUrl} alt="Story" className="w-full h-full object-contain" />
          )}

          {imageError && (
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>Failed to load story</p>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="text-white hover:bg-white/20"
                  disabled={likeStory.isPending || unlikeStory.isPending}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="ml-2">{Number(story.likeCount)}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
