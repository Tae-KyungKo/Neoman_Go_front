import { api } from './client'

export function getPosts(category, params) {
  return api.get(`/api/categories/${category}/posts`, { params })
}

export function getPost(postId) {
  return api.get(`/api/posts/${postId}`)
}

export function createPost(category, payload) {
  return api.post(`/api/categories/${category}/posts`, payload)
}

export function updatePost(postId, payload) {
  return api.patch(`/api/posts/${postId}`, payload)
}

export function deletePost(postId) {
  return api.delete(`/api/posts/${postId}`)
}
