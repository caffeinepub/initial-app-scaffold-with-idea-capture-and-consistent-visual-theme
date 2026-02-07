import { useNavigate } from '@tanstack/react-router';
import { usePostImageSrc } from '../../hooks/usePostImageSrc';
import type { Post } from '../../types/missing-backend-types';

interface PostGridProps {
  posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
  const navigate = useNavigate();

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No posts yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map((post) => (
        <PostGridItem key={post.id.toString()} post={post} onClick={() => navigate({ to: '/post/$postId', params: { postId: post.id.toString() } })} />
      ))}
    </div>
  );
}

function PostGridItem({ post, onClick }: { post: Post; onClick: () => void }) {
  const { src: imageSrc, isLoading, error } = usePostImageSrc(post.image);

  return (
    <div
      className="relative aspect-square bg-muted cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
          Image unavailable
        </div>
      )}
      {imageSrc && !error && (
        <img
          src={imageSrc}
          alt="Post"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
}
