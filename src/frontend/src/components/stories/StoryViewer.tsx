import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import type { Story } from '../../backend';

interface StoryViewerProps {
  story: Story | null;
  open: boolean;
  onClose: () => void;
}

export function StoryViewer({ story, open, onClose }: StoryViewerProps) {
  if (!story) return null;

  const imageUrl = story.image.getDirectURL();

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
