import { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { CreateStoryDialog } from '../stories/CreateStoryDialog';
import { StoryViewer } from '../stories/StoryViewer';
import { useGetActiveStories, type StoryView } from '../../hooks/useStories';
import { useGetProfileById } from '../../hooks/useProfiles';
import { ProfileAvatar } from '../profile/ProfileAvatar';

function StoryCircle({ story }: { story: StoryView }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const { data: profile } = useGetProfileById(story.author);

  if (!profile) return null;

  return (
    <>
      <div 
        className="flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => setViewerOpen(true)}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
          <div className="w-full h-full rounded-full bg-background p-0.5">
            <ProfileAvatar 
              avatar={profile.avatar} 
              username={profile.username} 
              size="md"
              className="w-full h-full"
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground max-w-[64px] truncate">
          {profile.username}
        </span>
      </div>

      <StoryViewer 
        story={story}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}

export function StoriesRow() {
  const { data: stories = [], isLoading } = useGetActiveStories();

  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          <CreateStoryDialog />

          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                <div className="w-12 h-3 bg-muted rounded animate-pulse" />
              </div>
            ))
          ) : (
            stories.map((story) => (
              <StoryCircle key={story.id.toString()} story={story} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
