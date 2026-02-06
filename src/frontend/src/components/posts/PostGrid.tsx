import { useNavigate } from '@tanstack/react-router';
import type { Post } from '../../types/missing-backend-types';

interface PostGridProps {
  posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
  const navigate = useNavigate();

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map((post) => {
        const imageUrl = post.image?.getDirectURL();
        return (
          <div
            key={post.id.toString()}
            className="aspect-square bg-muted cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate({ to: '/post/$postId', params: { postId: post.id.toString() } })}
          >
            {imageUrl && (
              <img src={imageUrl} alt={post.caption} className="w-full h-full object-cover" />
            )}
          </div>
        );
      })}
    </div>
  );
}
