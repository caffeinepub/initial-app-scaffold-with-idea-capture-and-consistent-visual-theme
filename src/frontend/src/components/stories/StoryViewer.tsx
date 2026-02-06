import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { X, Heart, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetStoryLikes, useLikeStory, useUnlikeStory } from '../../hooks/useStories';
import type { Story } from '../../types/missing-backend-types';

interface StoryViewerProps {
  story: Story | null;
  open: boolean;
  onClose: () => void;
}

export function StoryViewer({ story, open, onClose }: StoryViewerProps) {
  const { identity } = useInternetIdentity();
  const [error, setError] = useState('');
  
  const { data: likes = [] } = useGetStoryLikes(story?.id);
  const likeStory = useLikeStory();
  const unlikeStory = useUnlikeStory();

  if (!story) return null;

  const imageUrl = story.image.getDirectURL();
  const currentUserId = identity?.getPrincipal().toString();
  const isLiked = currentUserId ? likes.some(p => p.toString() === currentUserId) : false;
  const likeCount = likes.length;

  const handleLikeToggle = async () => {
    if (!identity) return;
    
    setError('');
    try {
      if (isLiked) {
        await unlikeStory.mutateAsync(story.id);
      } else {
        await likeStory.mutateAsync(story.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update like');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-full h-full p-0 bg-black/95 border-0">
        <div className="relative w-full h-full flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {error && (
            <Alert variant="destructive" className="absolute top-4 left-4 right-20 z-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="absolute bottom-4 left-4 right-4 z-50 flex items-center justify-between">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleLikeToggle}
              disabled={likeStory.isPending || unlikeStory.isPending || !identity}
              className="text-white hover:bg-white/20 gap-2"
            >
              <Heart 
                className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
              />
              <span className="text-lg font-semibold">{likeCount}</span>
            </Button>
          </div>

          <img
            src={imageUrl}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
