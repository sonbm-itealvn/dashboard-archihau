import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as tagApi from '@/api/tagApi'

const initialTags = []

export const useTagStore = defineStore('tag', () => {
  const tags = ref(initialTags)
  const isLoading = ref(false)
  const error = ref('')

  const setTags = (payload) => {
    if (Array.isArray(payload)) {
      tags.value = payload
      return
    }
    if (payload && Array.isArray(payload.data)) {
      tags.value = payload.data
      return
    }
    if (!payload) {
      tags.value = []
    }
  }

  async function fetchTags() {
    error.value = ''
    isLoading.value = true
    try {
      const remote = await tagApi.fetchTags()
      setTags(remote)
    } catch (err) {
      error.value = err?.message ?? 'Không thể tải danh sách thẻ.';
      console.error('Failed to load tags', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createTag(payload) {
    try {
      const created = await tagApi.createTag(payload)
      await fetchTags()
      return created
    } catch (err) {
      console.error('Failed to create tag', err)
      throw err
    }
  }

  async function updateTag(id, payload) {
    try {
      const updated = await tagApi.updateTag(id, payload)
      await fetchTags()
      return updated
    } catch (err) {
      console.error('Failed to update tag', err)
      throw err
    }
  }

  async function deleteTag(id) {
    try {
      await tagApi.deleteTag(id)
      tags.value = tags.value.filter((tag) => tag.id !== id)
    } catch (err) {
      console.error('Failed to delete tag', err)
      throw err
    }
  }

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
  }
})
