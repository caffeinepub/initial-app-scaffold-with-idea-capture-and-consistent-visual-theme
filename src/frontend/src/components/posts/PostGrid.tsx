import { useNavigate } from '@tanstack/react-router';
import { usePostImageSrc } from '../../hooks/usePostImageSrc';
import type { Post } from '../../types/missing-backend-types';

interface PostGridProps {
  posts: Post[];
}

function PostGridItem({ post }: { post: Post }) {
  const navigate = useNavigate();
  const { src: imageUrl, isLoading } = usePostImageSrc(post.image);

  return (
    <div
      className="aspect-square bg-muted cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => navigate({ to: '/post/$postId', params: { postId: post.id.toString() } })}
    >
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {imageUrl && !isLoading && (
        <img src={imageUrl} alt={post.caption} className="w-full h-full object-cover" />
      )}
    </div>
  );
}

export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <PostGridItem key={post.id.toString()} post={post} />
      ))}
    </div>
  );
}
