import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as tagApi from '@/api/tagApi'

const initialTags = [
  { id: 1, name: 'news', display_name: 'Tin tức' },
  { id: 2, name: 'events', display_name: 'Sự kiện' },
]

export const useTagStore = defineStore('tag', () => {
  const tags = ref(initialTags)

  async function fetchTags() {
    try {
      const remote = await tagApi.fetchTags()
      if (Array.isArray(remote) && remote.length) {
        tags.value = remote
      }
    } catch (error) {
      console.error('Failed to load tags', error)
    }
  }

  return {
    tags,
    fetchTags,
  }
})
