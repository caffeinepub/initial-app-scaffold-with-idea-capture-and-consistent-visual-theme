import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Post, Comment } from '../types/missing-backend-types';
import type { Principal } from '@icp-sdk/core/principal';

// Note: All post-related backend methods are missing from the interface
// These hooks return empty data until backend is updated

export function useGetHomeFeed() {
  return useQuery<Post[]>({
    queryKey: ['homeFeed'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetAllPosts() {
  return useQuery<Post[]>({
    queryKey: ['allPosts'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetPostsByUser(userId?: Principal) {
  return useQuery<Post[]>({
    queryKey: ['posts', 'user', userId?.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetPostById(postId: bigint) {
  return useQuery<Post | null>({
    queryKey: ['post', postId.toString()],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { caption: string; image: Uint8Array | null }) => {
      throw new Error('Post creation is not available - backend method missing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      throw new Error('Post deletion is not available - backend method missing');
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
  return useQuery<Principal[]>({
    queryKey: ['likes', postId.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      throw new Error('Post liking is not available - backend method missing');
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      throw new Error('Post unliking is not available - backend method missing');
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
  return useQuery<Comment[]>({
    queryKey: ['comments', postId.toString()],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { postId: bigint; text: string }) => {
      throw new Error('Comments are not available - backend method missing');
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
