import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Post } from '../../backend';

interface PostGridProps {
  posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = useState<Map<string, string | null>>(new Map());

  useEffect(() => {
    const urls = new Map<string, string | null>();
    
    posts.forEach(post => {
      if (post.image) {
        const url = post.image.getDirectURL();
        urls.set(post.id.toString(), url);
      }
    });

    setImageUrls(urls);
  }, [posts]);

  const handlePostClick = (postId: bigint) => {
    navigate({ to: '/post/$postId', params: { postId: postId.toString() } });
  };

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
        const imageUrl = imageUrls.get(post.id.toString());
        
        return (
          <div
            key={post.id.toString()}
            onClick={() => handlePostClick(post.id)}
            className="aspect-square bg-muted cursor-pointer hover:opacity-80 transition-opacity"
          >
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Post" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <p className="text-xs text-center line-clamp-4">{post.caption}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
