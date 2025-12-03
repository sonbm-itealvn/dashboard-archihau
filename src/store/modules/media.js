import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as mediaApi from '@/api/mediaApi'

const initialMedia = [
  { id: 1, name: 'Hero banner', type: 'Image', size: '1.2 MB' },
  { id: 2, name: 'Product demo', type: 'Video', size: '85 MB' },
]

export const useMediaStore = defineStore('media', () => {
  const mediaItems = ref(initialMedia)

  async function fetchMedia() {
    const remote = await mediaApi.fetchMedia()
    if (Array.isArray(remote) && remote.length) {
      mediaItems.value = remote
    }
  }

  return {
    mediaItems,
    fetchMedia,
  }
})
