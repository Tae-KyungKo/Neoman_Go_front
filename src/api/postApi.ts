import { requestApi } from './httpClient';

export type PostType = 'FREE' | 'RECRUITMENT' | 'QUESTION';

export interface PostPayload {
  type: PostType;
  title: string;
  content: string;
}

export interface PostSummaryResponse {
  id: number;
  type: PostType;
  title: string;
  preview: string;
  authorId: number;
  authorNickname: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
}

export interface PostResponse extends PostPayload {
  id: number;
  authorId: number;
  authorNickname: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  authorId: number;
  authorNickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export function getPosts(
  type: PostType | null,
  keyword: string,
  page: number,
  size = 10,
): Promise<PageResponse<PostSummaryResponse>> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (type) query.set('type', type);
  if (keyword.trim()) query.set('keyword', keyword.trim());
  return requestApi<PageResponse<PostSummaryResponse>>(`/api/posts?${query.toString()}`);
}

export function getPost(postId: number): Promise<PostResponse> {
  return requestApi<PostResponse>(`/api/posts/${postId}`);
}

export function createPost(payload: PostPayload, accessToken: string): Promise<PostResponse> {
  return requestApi<PostResponse>(
    '/api/posts',
    { method: 'POST', body: JSON.stringify(payload) },
    accessToken,
  );
}

export function updatePost(
  postId: number,
  payload: PostPayload,
  accessToken: string,
): Promise<PostResponse> {
  return requestApi<PostResponse>(
    `/api/posts/${postId}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    accessToken,
  );
}

export function deletePost(postId: number, accessToken: string): Promise<void> {
  return requestApi<void>(`/api/posts/${postId}`, { method: 'DELETE' }, accessToken);
}

export function getComments(
  postId: number,
  page = 0,
  size = 100,
): Promise<PageResponse<CommentResponse>> {
  return requestApi<PageResponse<CommentResponse>>(
    `/api/posts/${postId}/comments?page=${page}&size=${size}`,
  );
}

export function createComment(
  postId: number,
  content: string,
  accessToken: string,
): Promise<CommentResponse> {
  return requestApi<CommentResponse>(
    `/api/posts/${postId}/comments`,
    { method: 'POST', body: JSON.stringify({ content }) },
    accessToken,
  );
}

export function updateComment(
  commentId: number,
  content: string,
  accessToken: string,
): Promise<CommentResponse> {
  return requestApi<CommentResponse>(
    `/api/comments/${commentId}`,
    { method: 'PATCH', body: JSON.stringify({ content }) },
    accessToken,
  );
}

export function deleteComment(commentId: number, accessToken: string): Promise<void> {
  return requestApi<void>(`/api/comments/${commentId}`, { method: 'DELETE' }, accessToken);
}
