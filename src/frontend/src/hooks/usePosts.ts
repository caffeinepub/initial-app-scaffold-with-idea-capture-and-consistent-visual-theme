import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import type { Post, Comment } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetHomeFeed() {
  const { actor, isFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['homeFeed'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHomeFeed();
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
      return actor.getAllPosts();
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
      return actor.getPostsByUser(userId);
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
      return actor.getPostById(postId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { caption: string; image: Uint8Array | null }) => {
      if (!actor) throw new Error('Actor not available');
      const externalBlob = data.image ? ExternalBlob.fromBytes(new Uint8Array(data.image)) : null;
      await actor.createPost(data.caption, externalBlob);
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
      await actor.deletePost(postId);
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
      return actor.getLikesByPost(postId);
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
      await actor.likePost(postId);
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
      await actor.unlikePost(postId);
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

  return useQuery<Comment[]>({
    queryKey: ['comments', postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsByPost(postId);
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
      await actor.addComment(data.postId, data.text);
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
