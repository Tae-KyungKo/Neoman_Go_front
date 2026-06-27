import { api } from './client'

export function getComments(postId, params) {
  return api.get(`/api/posts/${postId}/comments`, { params })
}

export function createComment(postId, payload) {
  return api.post(`/api/posts/${postId}/comments`, payload)
}

export function updateComment(commentId, payload) {
  return api.patch(`/api/comments/${commentId}`, payload)
}

export function deleteComment(commentId) {
  return api.delete(`/api/comments/${commentId}`)
}
