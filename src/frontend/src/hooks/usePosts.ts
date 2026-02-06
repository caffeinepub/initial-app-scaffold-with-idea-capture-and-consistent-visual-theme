import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { formatBackendError } from '../utils/formatBackendError';
import { ExternalBlob } from '../backend';
import type { Post, PostInput } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetHomeFeed() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['homeFeed'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPosts();
      } catch (error) {
        console.error('Failed to get home feed:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPosts();
      } catch (error) {
        console.error('Failed to get all posts:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPostsByUser(userId?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts', 'user', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      try {
        return await actor.getPostsForAuthor(userId);
      } catch (error) {
        console.error('Failed to get posts by user:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetPostById(postId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Post | null>({
    queryKey: ['post', postId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getPost(postId);
      } catch (error) {
        console.error('Failed to get post:', error);
        throw new Error(formatBackendError(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { caption: string; image: Uint8Array | null }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to create a post');

      try {
        const postInput: PostInput = {
          author: identity.getPrincipal(),
          caption: data.caption,
          image: data.image ? ExternalBlob.fromBytes(data.image as Uint8Array<ArrayBuffer>) : undefined,
        };

        const postId = await actor.createPost(postInput);
        return postId;
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deletePost(postId);
      } catch (error) {
        throw new Error(formatBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
    },
  });
}

export function useGetLikesByPost(postId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['likes', postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have a getLikesByPost method, so we return empty array
      // Likes count is available in the post object itself
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have like/unlike post methods yet
      throw new Error('Post liking is not yet available');
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have like/unlike post methods yet
      throw new Error('Post unliking is not yet available');
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useGetCommentsByPost(postId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['comments', postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have comment methods yet
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { postId: bigint; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have comment methods yet
      throw new Error('Comments are not yet available');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
