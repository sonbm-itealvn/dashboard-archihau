import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as postApi from '@/api/postApi'

const fallbackPosts = [
  { id: 1, title: 'Quarterly update', status: 'published', author: { name: 'Jane Cooper' } },
  { id: 2, title: 'Product roadmap', status: 'draft', author: { name: 'Devon Lane' } },
]

export const usePostStore = defineStore('post', () => {
  const posts = ref(fallbackPosts)
  const error = ref('')
  const isLoading = ref(false)

  async function fetchPosts(params) {
    error.value = ''
    isLoading.value = true
    try {
      const remote = await postApi.fetchPosts(params)
      posts.value = Array.isArray(remote) ? remote : []
    } catch (err) {
      error.value = err?.message ?? 'Không thể tải danh sách bài viết.';
      console.error('Failed to fetch posts', err)
    } finally {
      isLoading.value = false
    }
  }

  async function deletePost(id) {
    try {
      await postApi.deletePost(id)
      posts.value = posts.value.filter((post) => post.id !== id)
    } catch (err) {
      console.error('Failed to delete post', err)
      throw err
    }
  }

  return {
    posts,
    error,
    isLoading,
    fetchPosts,
    deletePost,
  }
})
